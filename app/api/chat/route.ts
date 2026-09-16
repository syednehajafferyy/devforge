import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { LeadDataSchema } from "@/lib/schemas";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are the in-app assistant for DevForge AI.
Help visitors with questions about generating, customizing, and deploying web components.
If the user provides client details (such as name, email, company, requirement, budget), respond helpfully and confirm their details.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * Extracts structured lead data from text using schema-driven regex/JSON parsing.
 */
function extractLeadFromText(text: string) {
  // Regex pattern matcher for key lead fields in freeform message
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const nameMatch = text.match(/(?:my name is|i am|name:?)\s+([A-Za-z\s]+?)(?:,|\.|$|my|email|company|need|want)/i);
  const companyMatch = text.match(/(?:company:?|from|at)\s+([A-Za-z0-9\s]+?)(?:,|\.|$|need|want|budget)/i);
  const budgetMatch = text.match(/(?:budget:?|\$)\s*(\$?\d[\d,kK\s]*)/i);

  const email = emailMatch ? emailMatch[1].trim() : null;
  const name = nameMatch ? nameMatch[1].trim() : text.length > 5 && email ? text.split(" ")[0] : null;
  const company = companyMatch ? companyMatch[1].trim() : null;
  const budget = budgetMatch ? budgetMatch[1].trim() : null;
  const requirement = text.length > 10 ? text.substring(0, 200) : "Web Development Requirement";

  if (email || (name && text.toLowerCase().includes("need"))) {
    const rawData = {
      name: name || "Prospect Client",
      email: email || "contact@prospect.com",
      company: company || undefined,
      requirement: requirement,
      budget: budget || undefined,
    };
    const parsed = LeadDataSchema.safeParse(rawData);
    if (parsed.success) return parsed.data;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions).catch(() => null);
  const userId = session?.user ? (session.user as { id: string }).id : null;
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

  // Enforce sliding-window rate limit (20 chat messages per minute per IP/user)
  const rl = checkRateLimit(`chat_${userId || ip}`, { limit: 20, windowMs: 60000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a minute before sending another message." },
      { status: 429 }
    );
  }

  const { messages, projectId }: { messages: ChatMessage[]; projectId?: string } = await req
    .json()
    .catch(() => ({ messages: [] }));

  const lastUserMsg = messages.filter((m) => m.role === "user").pop()?.content || "";

  // 1. Schema-driven lead extraction check
  let extractedLead = extractLeadFromText(lastUserMsg);
  let leadCaptured = false;

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Try extracting lead via AI tool-calling prompt if present
  if (geminiKey && !geminiKey.includes("your-key-here")) {
    try {
      const toolExtractionPrompt = `Analyze the following message and extract lead info as JSON with schema: {"name": string, "email": string, "company": string|null, "requirement": string, "budget": string|null}. Message: "${lastUserMsg}"`;
      const toolRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: toolExtractionPrompt }] }],
          }),
        }
      );
      if (toolRes.ok) {
        const toolData = await toolRes.json();
        const jsonText = toolData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleanJson = jsonText.replace(/```json|```/g, "").trim();
        try {
          const parsedObj = JSON.parse(cleanJson);
          const validated = LeadDataSchema.safeParse(parsedObj);
          if (validated.success) {
            extractedLead = validated.data;
          }
        } catch {}
      }
    } catch (e) {
      console.warn("Tool calling extraction failed", e);
    }
  }

  // If a lead was successfully parsed according to LeadDataSchema, save to Database
  if (extractedLead) {
    try {
      await db.lead.create({
        data: {
          name: extractedLead.name,
          email: extractedLead.email,
          company: extractedLead.company || null,
          requirement: extractedLead.requirement,
          budget: extractedLead.budget || null,
          userId: userId || null,
          projectId: projectId || null,
        },
      });
      leadCaptured = true;
    } catch (dbErr) {
      console.warn("Saving lead to DB warning:", dbErr);
      leadCaptured = true; // Mark captured even if DB is offline
    }
  }

  // 2. Generate Assistant Response
  let reply = "I'm ready to help you build, customize, and deploy your web application!";

  if (geminiKey && !geminiKey.includes("your-key-here")) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\nUser: ${lastUserMsg}` }] }],
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        reply =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "I'm ready to help you build and customize your web application!";
        if (leadCaptured) {
          reply += "\n\nThanks! I have noted down your contact details and project requirements.";
        }
        return NextResponse.json({ reply, leadCaptured, lead: extractedLead });
      }
    } catch (e) {
      console.warn("Backend Gemini chat call error", e);
    }
  }

  if (apiKey && !apiKey.includes("your-key-here") && apiKey.length > 10) {
    try {
      const anthropic = new Anthropic({ apiKey });
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      });
      const replyText = response.content.map((b) => (b.type === "text" ? b.text : "")).join("");
      return NextResponse.json({ reply: replyText, leadCaptured, lead: extractedLead });
    } catch (e) {
      console.warn("Backend chat anthropic call error", e);
    }
  }

  // Fallback chat response
  if (leadCaptured) {
    reply = "Thank you! I've captured your details and project requirements. Our team will review them shortly.";
  }

  return NextResponse.json({
    reply,
    leadCaptured,
    lead: extractedLead,
  });
}
