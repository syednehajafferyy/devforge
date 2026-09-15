import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-gemini-key, x-openai-key, x-anthropic-key, x-custom-api-key, x-api-key",
};

const SYSTEM_PROMPT = `You are an expert AI code-generation engine (like Gemini and v0).
Your task is to turn a user prompt into a single, self-contained, highly interactive React + Tailwind CSS component exported as default export in App.tsx.

Rules:
- Return ONLY executable TSX React code for App.tsx. Do NOT wrap in markdown fences or add explanatory text.
- Use Tailwind CSS utility classes for styling — modern, vibrant designs, dark mode, smooth rounded corners, shadow effects, and flex/grid layouts.
- Rely on standard React hooks (useState, useEffect, useMemo, useRef) for rich interactive state.
- Do not import external packages other than "react" and "react-dom".
- Ensure the component is fully functional, visually impressive, responsive, and completely tailored to the user's prompt.`;

function isValidPrompt(p: string): { valid: boolean; message?: string } {
  const trimmed = p.trim();
  if (trimmed.length < 3) {
    return {
      valid: false,
      message: "Prompt is too short. Please describe a clear UI or component to generate.",
    };
  }
  return { valid: true };
}

function generateDynamicWebsiteCode(prompt: string): string {
  // Extract business name from quotes or prompt text
  const match = prompt.match(/"([^"]+)"/) || prompt.match(/for\s+([A-Za-z0-9\s]+?)(,|\.|is|located)/i);
  const businessName = match ? match[1] : "Premier Business";
  
  const isHotel = /hotel|resort|stay|inn|lodge/i.test(prompt);
  const isClinic = /clinic|hospital|doctor|dentist|health|medical|dental/i.test(prompt);
  const isRestaurant = /restaurant|cafe|food|dining|bistro|bar/i.test(prompt);

  const categoryTitle = isHotel ? "Luxury Hotel & Suites" : isClinic ? "Healthcare & Medical Clinic" : isRestaurant ? "Fine Dining & Cafe" : "Professional Business";

  return `import React, { useState } from 'react';

export default function App() {
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', date: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md">
              ${businessName.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900">${businessName}</h1>
              <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">${categoryTitle}</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#about" className="hover:text-blue-600 transition">About</a>
            <a href="#services" className="hover:text-blue-600 transition">Services</a>
            <a href="#location" className="hover:text-blue-600 transition">Location</a>
            <a href="#contact" className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition active:scale-95">
              Book Appointment
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.15),transparent_70%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-extrabold uppercase tracking-wider">
              Official Website
            </span>
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight leading-tight text-white">
              Welcome to <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">${businessName}</span>
            </h2>
            <p className="text-slate-300 text-base lg:text-lg leading-relaxed max-w-xl">
              Delivering premium services, dedicated care, and exceptional experiences. ${prompt.substring(0, 140)}...
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a href="#contact" className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition active:scale-95">
                Get Started Today
              </a>
              <a href="#services" className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-sm backdrop-blur-md transition">
                Explore Services
              </a>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <h3 className="text-xl font-extrabold text-white">Quick Details & Information</h3>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xl">📍</span>
                <div>
                  <p className="font-bold text-white text-xs uppercase tracking-wider">Address & Location</p>
                  <p className="text-xs text-slate-300 mt-0.5">${prompt.includes("located at") ? prompt.split("located at")[1].split(".")[0] : "Prime Central Location"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xl">📞</span>
                <div>
                  <p className="font-bold text-white text-xs uppercase tracking-wider">Phone Contact</p>
                  <p className="text-xs text-slate-300 mt-0.5">${prompt.includes("Phone:") ? prompt.split("Phone:")[1].split(".")[0] : "+1 (555) 019-2834"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xl">⭐</span>
                <div>
                  <p className="font-bold text-white text-xs uppercase tracking-wider">Customer Rating</p>
                  <p className="text-xs text-slate-300 mt-0.5">4.8 / 5.0 (Highly Recommended)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <h2 className="text-xs font-black uppercase tracking-widest text-blue-600">Our Offerings</h2>
          <p className="text-3xl font-black text-slate-900 tracking-tight">Services & Highlights</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: "${isHotel ? '🏨' : isClinic ? '🩺' : '🍽️'}", title: "${isHotel ? 'Luxury Accommodation' : isClinic ? 'Expert Consultation' : 'Gourmet Dining'}", desc: "Top-tier standards tailored for complete customer satisfaction and convenience." },
            { icon: "${isHotel ? '🛎️' : isClinic ? '💊' : '☕'}", title: "${isHotel ? '24/7 Room Service' : isClinic ? 'Specialized Treatment' : 'Artisanal Selection'}", desc: "Dedicated professionals committed to delivering flawless service round the clock." },
            { icon: "${isHotel ? '🌴' : isClinic ? '📅' : '🎉'}", title: "${isHotel ? 'Prime Amenities' : isClinic ? 'Instant Appointment' : 'Event Booking'}", desc: "Seamless experience with easy booking, comfortable atmosphere, and friendly support." }
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 text-2xl flex items-center justify-center font-bold">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact & Booking Section */}
      <section id="contact" className="py-20 bg-slate-100 border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200/90 shadow-xl space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Contact & Appointment Request</h2>
              <p className="text-xs text-slate-500">Fill out the form below to reach out directly to ${businessName}.</p>
            </div>

            {bookingSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-2 animate-in fade-in">
                <span className="text-3xl">✅</span>
                <h4 className="font-bold text-base">Request Submitted Successfully!</h4>
                <p className="text-xs text-emerald-700">Thank you for reaching out to ${businessName}. Our team will contact you shortly.</p>
                <button onClick={() => setBookingSubmitted(false)} className="mt-4 px-4 py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl">
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                    <input
                      required
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-600 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      required
                      type="tel"
                      placeholder="+92 300 1234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-600 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Special Instructions / Message</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your request or appointment timing..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-600 transition resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/20 active:scale-98 transition cursor-pointer"
                >
                  Send Booking Request
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 text-slate-400 text-xs text-center border-t border-slate-900">
        <p>© {new Date().getFullYear()} ${businessName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
`;
}

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions).catch(() => null);
    const userId = session?.user ? (session.user as { id: string }).id : "guest-user";
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

    const rl = checkRateLimit(`gen_${userId || ip}`, { limit: 25, windowMs: 60000 });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment before generating again." },
        { status: 429, headers: corsHeaders }
      );
    }

    const body = await req.json().catch(() => ({}));
    const prompt = body.prompt || "";
    const existingCode = body.existingCode || "";
    const targetLanguage = body.targetLanguage || "React (TypeScript)";

    // 1. Validate prompt input
    const validation = isValidPrompt(prompt);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400, headers: corsHeaders }
      );
    }

    const userGeminiKey = body.geminiApiKey || body.geminiKey || req.headers.get("x-gemini-key");
    const userAnthropicKey = body.anthropicApiKey || body.anthropicKey || body.apiKey || req.headers.get("x-anthropic-key") || req.headers.get("x-api-key");

    const geminiKey = userGeminiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const apiKey = userAnthropicKey || process.env.ANTHROPIC_API_KEY;

    const targetLangPrompt = `TARGET FRAMEWORK / LANGUAGE: ${targetLanguage}. Ensure the generated code strictly follows ${targetLanguage} conventions and syntaxes while exporting a default executable component structure.`;

    // 2. Google Gemini Provider (tries valid models: gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash-exp)
    if (geminiKey && !geminiKey.includes("your-key-here") && geminiKey.length > 15 && geminiKey.startsWith("AIzaSy")) {
      const candidateModels = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp", "gemini-1.5-flash-latest"];
      const genAI = new GoogleGenerativeAI(geminiKey);
      const userMsg = existingCode && existingCode.length > 50
        ? `${targetLangPrompt}\nEXISTING CODE:\n\`\`\`\n${existingCode}\n\`\`\`\n\nUSER MODIFICATION REQUEST: ${prompt}\n\nINSTRUCTION: Modify the Existing Code according to the User Modification Request in ${targetLanguage}. Output ONLY executable code.`
        : `${targetLangPrompt}\nUSER REQUEST: ${prompt}\n\nINSTRUCTION: Create a complete, modern, interactive application in ${targetLanguage}. Output ONLY executable code.`;

      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(`${SYSTEM_PROMPT}\n\n${userMsg}`);
          let code = result.response.text();
          code = code.replace(/```jsx|```javascript|```tsx|```html|```python|```vue|```svelte|```java|```cpp|```c\+\+|```/g, "").trim();

          if (code && code.length > 20) {
            return new Response(code, {
              headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
            });
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} attempt failed:`, err?.message || err);
        }
      }
    }

    // 3. Anthropic Provider Fallback
    if (apiKey && !apiKey.includes("your-key-here") && apiKey.length > 10 && apiKey.startsWith("sk-ant")) {
      try {
        const anthropic = new Anthropic({ apiKey });
        const response = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: `${targetLangPrompt}\nBuild: ${prompt}\nExisting Code: ${existingCode}` }],
        });
        const codeText = response.content.map((b) => (b.type === "text" ? b.text : "")).join("");
        const cleaned = codeText.replace(/```jsx|```javascript|```tsx|```html|```python|```vue|```svelte|```java|```cpp|```c\+\+|```/g, "").trim();
        if (cleaned && cleaned.length > 20) {
          return new Response(cleaned, { headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" } });
        }
      } catch (err: any) {
        console.error("Anthropic Call Error:", err?.message || err);
      }
    }

    // 4. Reliable Instant Code Generator Fallback (Ensures site NEVER hangs at 'Generating...')
    const fallbackCode = generateDynamicWebsiteCode(prompt);
    return new Response(fallbackCode, {
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("Generation Engine Error:", error);
    const fallbackCode = generateDynamicWebsiteCode("Local Business");
    return new Response(fallbackCode, {
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
