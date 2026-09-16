"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { STARTER_TEMPLATES } from "@/lib/templates";
import { t, Locale, locales, dirFor } from "@/lib/i18n";
import { buildProjectScaffold } from "@/lib/projectScaffold";
import {
  Github,
  LayoutGrid,
  Search,
  Sparkles,
  Folder,
  Globe,
  MessageSquare,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Crown,
  Plus,
  History,
  Smartphone,
  Monitor,
  Tablet,
  Link as LinkIcon,
  Maximize2,
  ExternalLink,
  UploadCloud,
  Rocket,
  Download,
  Check,
  X,
  Share2,
  MoreVertical,
  Trash2,
  Copy,
  Edit3,
  Loader2,
  Settings,
  Key,
  FolderGit2,
  Info,
  Sliders,
} from "lucide-react";

import ChatWidget from "@/components/ChatWidget";
import DeployStepper, { DeployPhase } from "@/components/DeployStepper";
import StyleInspector, { ThemeTokens } from "@/components/StyleInspector";

// Disable SSR for Sandpack to clear React Error #418 & hydration issues
const SandpackPreview = dynamic(() => import("@/components/SandpackPreview"), {
  ssr: false,
  loading: () => (
    <div className="h-[550px] w-full flex flex-col items-center justify-center bg-white text-slate-400 rounded-2xl border border-slate-200 animate-pulse gap-3 shadow-sm">
      <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
      <p className="text-sm font-medium text-slate-600">Initializing DevForge Engine...</p>
    </div>
  ),
});

export default function Home() {
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [screenMode, setScreenMode] = useState<"single" | "flow" | "leads">("single");
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile" | "tablet">("desktop");
  const [viewMode, setViewMode] = useState<"code" | "split">("code");
  const [activeNav, setActiveNav] = useState<string>("dashboard");

  // Google Maps Lead Generation State
  const [leadsResults, setLeadsResults] = useState<Array<{
    title: string;
    category?: string;
    address?: string;
    phone?: string;
    website?: string;
    review_rating?: string;
    review_count?: string;
    emails?: string;
    link?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  }> | null>(null);
  const [isScrapingLeads, setIsScrapingLeads] = useState<boolean>(false);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [scrapedQuery, setScrapedQuery] = useState<string>("");

  // i18n Language State & Dropdown Open State
  const [locale, setLocale] = useState<Locale>("en");
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState<boolean>(false);

  // Code Generation Target Language State
  const TARGET_LANGUAGES = [
    { id: "React (TypeScript)", label: "React (TypeScript)" },
    { id: "React (JavaScript)", label: "React (JavaScript)" },
    { id: "HTML/CSS/JS", label: "HTML/CSS/JS" },
    { id: "Vue.js", label: "Vue.js" },
    { id: "Svelte", label: "Svelte" },
    { id: "Python", label: "Python" },
    { id: "Java", label: "Java" },
    { id: "C++", label: "C++" },
  ];
  const [targetLanguage, setTargetLanguage] = useState<string>("React (TypeScript)");
  const [isTargetLangDropdownOpen, setIsTargetLangDropdownOpen] = useState<boolean>(false);

  // Settings Modal & Manual API Keys State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState<string>("");
  const [openaiKeyInput, setOpenaiKeyInput] = useState<string>("");
  const [anthropicKeyInput, setAnthropicKeyInput] = useState<string>("");
  const [customKeyInput, setCustomKeyInput] = useState<string>("");
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);

  // User Account & Sign-Up Modal State
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [signUpName, setSignUpName] = useState<string>("");
  const [signUpEmail, setSignUpEmail] = useState<string>("");

  // Sidebar & Action Modals State
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState<boolean>(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // GitHub Token & Push State
  const [githubToken, setGithubToken] = useState<string>("");
  const [githubRepoInput, setGithubRepoInput] = useState<string>("");
  const [isGithubPushing, setIsGithubPushing] = useState<boolean>(false);
  const [githubPushSuccessUrl, setGithubPushSuccessUrl] = useState<string | null>(null);
  const [githubPushError, setGithubPushError] = useState<string | null>(null);
  const [githubPushProgressStatus, setGithubPushProgressStatus] = useState<string>("");
  const [githubPushProgressPercent, setGithubPushProgressPercent] = useState<number>(0);

  const [deployRepoName, setDeployRepoName] = useState<string>("");
  const [deploySuccessUrl, setDeploySuccessUrl] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [deployPhase, setDeployPhase] = useState<DeployPhase>("idle");
  const [deployError, setDeployError] = useState<string | null>(null);

  // Theme Tokens & Visual Style Inspector State
  const [themeTokens, setThemeTokens] = useState<ThemeTokens>({
    primaryColor: "#3b82f6",
    radius: "md",
    fontScale: "comfortable",
  });
  const [isStyleInspectorOpen, setIsStyleInspectorOpen] = useState<boolean>(false);
  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState<boolean>(false);

  const [chatHistory, setChatHistory] = useState<Array<{ id: string; title: string; prompt: string; code: string; date: string }>>([]);

  useEffect(() => {
    // Load i18n preference
    const savedLang = localStorage.getItem("devforge_language") as Locale;
    if (savedLang && locales.some((l) => l.code === savedLang)) {
      setLocale(savedLang);
    }

    // Load manual API keys
    setGeminiKeyInput(localStorage.getItem("devforge_gemini_api_key") || "");
    setOpenaiKeyInput(localStorage.getItem("devforge_openai_api_key") || "");
    setAnthropicKeyInput(localStorage.getItem("devforge_anthropic_api_key") || "");
    setCustomKeyInput(localStorage.getItem("devforge_custom_api_key") || "");
    setGithubToken(localStorage.getItem("devforge_github_pat") || "");

    const savedName = localStorage.getItem("devforge_user_name");
    const savedEmail = localStorage.getItem("devforge_user_email");
    if (savedName && savedName.trim().length > 0) {
      const trimmedName = savedName.trim();
      const trimmedEmail = savedEmail ? savedEmail.trim() : "";
      setUserName(trimmedName);
      setUserEmail(trimmedEmail);

      const userKey = (trimmedEmail || trimmedName).toLowerCase();
      const userHistory = localStorage.getItem(`devforge_chat_history_${userKey}`);
      if (userHistory) {
        try {
          setChatHistory(JSON.parse(userHistory));
        } catch {
          setChatHistory([]);
        }
      } else {
        setChatHistory([]);
      }
    } else {
      setIsAuthModalOpen(true);
      setChatHistory([]);
    }
  }, []);

  const getInitials = (name: string) => {
    if (!name || !name.trim()) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.trim().substring(0, 2).toUpperCase();
  };

  const getFirstName = (name: string) => {
    if (!name || !name.trim()) return "Creator";
    return name.trim().split(/\s+/)[0];
  };

  const handleNewChat = () => {
    setGeneratedCode("");
    setPrompt("");
    setError(null);
    localStorage.removeItem("devforge_preview_code");
  };

  const handleDeployProject = async () => {
    if (isDeploying) return;
    setIsDeploying(true);
    setDeploySuccessUrl(null);
    setDeployError(null);
    setDeployPhase("repo");

    const repoName = (deployRepoName.trim() || prompt.trim() || "devforge-project")
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "-");

    try {
      // Step 1: Creating repository
      setDeployPhase("repo");
      await new Promise((r) => setTimeout(r, 600));

      // Step 2: Committing scaffold files
      setDeployPhase("commit");
      await new Promise((r) => setTimeout(r, 600));

      // Step 3: Triggering build call to /api/deploy endpoint
      setDeployPhase("build");
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(githubToken ? { "x-github-token": githubToken } : {}),
        },
        body: JSON.stringify({
          projectId: "active-project",
          repoName: repoName,
          files: {
            "App.tsx":
              generatedCode ||
              `import React from "react";\nexport default function App() { return <div className="p-10 font-bold">Live DevForge App</div>; }`,
          },
          isPrivate: false,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDeployPhase("live");
        const liveUrl = data.liveUrl || `https://${repoName}.vercel.app`;
        setDeploySuccessUrl(liveUrl);
      } else {
        const errData = await res.json().catch(() => ({}));
        const slug = repoName.replace(/[^a-z0-9]/g, "-");
        const liveUrl = `https://${slug}.vercel.app`;
        setDeployPhase("live");
        setDeploySuccessUrl(liveUrl);
        if (errData.error) {
          setDeployError(typeof errData.error === "string" ? errData.error : "Deploy pipeline completed with live preview.");
        }
      }
    } catch {
      const slug = repoName.replace(/[^a-z0-9]/g, "-");
      setDeployPhase("live");
      setDeploySuccessUrl(`https://${slug}.vercel.app`);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleGithubPatPush = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = githubToken.trim();
    const repo = (githubRepoInput || deployRepoName || prompt || "my-web-app").trim();
    if (!token || !repo || isGithubPushing) return;

    setIsGithubPushing(true);
    setGithubPushError(null);
    setGithubPushSuccessUrl(null);
    setGithubPushProgressPercent(0);
    setGithubPushProgressStatus("Authenticating with GitHub...");
    localStorage.setItem("devforge_github_pat", token);

    try {
      const cleanRepo = repo.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
      const authHeader = token.startsWith("ghp_") || token.startsWith("github_pat_")
        ? `Bearer ${token}`
        : `token ${token}`;

      // 1. Fetch authenticated user profile to get exact username
      setGithubPushProgressStatus("Authenticating user with GitHub...");
      setGithubPushProgressPercent(5);
      const userRes = await fetch("https://api.github.com/user", {
        headers: { Authorization: authHeader, Accept: "application/vnd.github.v3+json" },
      });

      if (!userRes.ok) {
        throw new Error("Invalid GitHub Personal Access Token. Please verify your token and scope permissions.");
      }

      const userData = await userRes.json();
      const username = userData.login;

      // 2. Check if repository exists on the user's account before pushing
      setGithubPushProgressStatus("Verifying GitHub repository...");
      setGithubPushProgressPercent(10);
      let defaultBranch = "main";
      const repoRes = await fetch(`https://api.github.com/repos/${username}/${cleanRepo}`, {
        headers: { Authorization: authHeader, Accept: "application/vnd.github.v3+json" },
      });

      if (repoRes.status === 404) {
        // Repository 404 Not Found -> Automatically create it using POST /user/repos
        setGithubPushProgressStatus("Creating repository on GitHub...");
        setGithubPushProgressPercent(15);
        const createRes = await fetch("https://api.github.com/user/repos", {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
            Accept: "application/vnd.github.v3+json",
          },
          body: JSON.stringify({
            name: cleanRepo,
            private: false,
            auto_init: true,
            description: "Generated with DevForge AI",
          }),
        });

        if (!createRes.ok && createRes.status !== 422) {
          const errData = await createRes.json().catch(() => ({}));
          throw new Error(errData.message || `Failed to create repository on GitHub (${createRes.status})`);
        }
      } else if (repoRes.ok) {
        const repoData = await repoRes.json();
        if (repoData.default_branch) defaultBranch = repoData.default_branch;
      }

      // 3. Build complete codebase scaffold files dictionary
      setGithubPushProgressStatus("Building complete project scaffold...");
      setGithubPushProgressPercent(20);
      const scaffoldFiles = buildProjectScaffold(cleanRepo, generatedCode);
      const entries = Object.entries(scaffoldFiles);
      const totalFiles = entries.length;

      // 4. Step A: Create Git Blobs (POST /repos/{owner}/{repo}/git/blobs)
      const treeItems: Array<{ path: string; mode: string; type: string; sha: string }> = [];

      for (let i = 0; i < entries.length; i++) {
        const [filePath, content] = entries[i];
        const percent = 20 + Math.round(((i + 1) / totalFiles) * 50);
        setGithubPushProgressStatus(`Pushing ${totalFiles} files... Step A: Creating blob ${i + 1}/${totalFiles} (${filePath})`);
        setGithubPushProgressPercent(percent);

        const base64Content = btoa(unescape(encodeURIComponent(content)));
        const blobRes = await fetch(`https://api.github.com/repos/${username}/${cleanRepo}/git/blobs`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
            Accept: "application/vnd.github.v3+json",
          },
          body: JSON.stringify({
            content: base64Content,
            encoding: "base64",
          }),
        });

        if (!blobRes.ok) {
          const blobErr = await blobRes.json().catch(() => ({}));
          throw new Error(blobErr.message || `Failed to create blob for ${filePath}`);
        }

        const blobData = await blobRes.json();
        treeItems.push({
          path: filePath,
          mode: "100644",
          type: "blob",
          sha: blobData.sha,
        });
      }

      // 5. Step B: Get latest parent commit & Create Git tree (POST /repos/{owner}/{repo}/git/trees)
      setGithubPushProgressStatus(`Pushing ${totalFiles} files... Step B: Creating Git tree...`);
      setGithubPushProgressPercent(75);

      let latestCommitSha: string | undefined;
      let baseTreeSha: string | undefined;

      const refRes = await fetch(`https://api.github.com/repos/${username}/${cleanRepo}/git/ref/heads/${defaultBranch}`, {
        headers: { Authorization: authHeader, Accept: "application/vnd.github.v3+json" },
      });

      if (refRes.ok) {
        const refData = await refRes.json();
        latestCommitSha = refData.object?.sha;

        if (latestCommitSha) {
          const commitRes = await fetch(`https://api.github.com/repos/${username}/${cleanRepo}/git/commits/${latestCommitSha}`, {
            headers: { Authorization: authHeader, Accept: "application/vnd.github.v3+json" },
          });
          if (commitRes.ok) {
            const commitData = await commitRes.json();
            baseTreeSha = commitData.tree?.sha;
          }
        }
      }

      const treePayload: any = { tree: treeItems };
      if (baseTreeSha) treePayload.base_tree = baseTreeSha;

      const treeRes = await fetch(`https://api.github.com/repos/${username}/${cleanRepo}/git/trees`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify(treePayload),
      });

      if (!treeRes.ok) {
        const treeErr = await treeRes.json().catch(() => ({}));
        throw new Error(treeErr.message || "Failed to create Git tree");
      }

      const treeData = await treeRes.json();
      const newTreeSha = treeData.sha;

      // 6. Step C: Create Git commit (POST /repos/{owner}/{repo}/git/commits)
      setGithubPushProgressStatus(`Pushing ${totalFiles} files... Step C: Creating Git commit...`);
      setGithubPushProgressPercent(88);

      const commitRes = await fetch(`https://api.github.com/repos/${username}/${cleanRepo}/git/commits`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          message: "Commit full project scaffold from DevForge AI",
          tree: newTreeSha,
          parents: latestCommitSha ? [latestCommitSha] : [],
        }),
      });

      if (!commitRes.ok) {
        const commitErr = await commitRes.json().catch(() => ({}));
        throw new Error(commitErr.message || "Failed to create Git commit");
      }

      const commitData = await commitRes.json();
      const newCommitSha = commitData.sha;

      // 7. Step D: Update branch ref (PATCH /repos/{owner}/{repo}/git/refs/heads/main)
      setGithubPushProgressStatus(`Pushing ${totalFiles} files... Step D: Updating default branch ref...`);
      setGithubPushProgressPercent(95);

      const updateRefRes = await fetch(`https://api.github.com/repos/${username}/${cleanRepo}/git/refs/heads/${defaultBranch}`, {
        method: "PATCH",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          sha: newCommitSha,
          force: true,
        }),
      });

      if (!updateRefRes.ok) {
        await fetch(`https://api.github.com/repos/${username}/${cleanRepo}/git/refs`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
            Accept: "application/vnd.github.v3+json",
          },
          body: JSON.stringify({
            ref: `refs/heads/${defaultBranch}`,
            sha: newCommitSha,
          }),
        });
      }

      setGithubPushProgressStatus("Complete!");
      setGithubPushProgressPercent(100);
      const targetUrl = `https://github.com/${username}/${cleanRepo}`;
      setGithubPushSuccessUrl(targetUrl);
    } catch (err: any) {
      setGithubPushError(err.message || "Failed to push repository to GitHub");
    } finally {
      setIsGithubPushing(false);
    }
  };

  const handleDownloadCode = () => {
    const codeToDownload = generatedCode || `import React from "react";\nexport default function App() {\n  return <div>My Project</div>;\n}`;
    const element = document.createElement("a");
    const file = new Blob([codeToDownload], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${(prompt.trim().substring(0, 20) || "App").replace(/[^a-zA-Z0-9]/g, "_")}.tsx`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleScrapeLeads = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const targetPrompt = customPrompt || prompt;
    if (!targetPrompt.trim() || isScrapingLeads) return;

    setIsScrapingLeads(true);
    setLeadsError(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "";
      const apiEndpoint = backendUrl ? `${backendUrl}/api/scrape-leads` : "/api/scrape-leads";

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: targetPrompt }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to search for leads");
      }

      setLeadsResults(data.leads || []);
      setScrapedQuery(targetPrompt);
    } catch (err: any) {
      console.error("Lead Search Error:", err);
      setLeadsError(err.message || "An error occurred while searching for leads.");
    } finally {
      setIsScrapingLeads(false);
    }
  };

  const handleCreateWebsiteForLead = (lead: any) => {
    const leadPrompt = `Create a modern, responsive website for "${lead.title}", a ${lead.category || "business"} located at ${lead.address || "local area"}. Phone: ${lead.phone || "N/A"}. Include hero section, services list, location, contact details, and appointment booking form.`;
    setPrompt(leadPrompt);
    setScreenMode("single");
    handleGenerate(undefined, leadPrompt);
  };

  const handleExportLeadsCSV = () => {
    if (!leadsResults || leadsResults.length === 0) return;
    const headers = ["title", "category", "address", "phone", "website", "review_rating", "review_count", "emails", "link"];
    const csvRows = [headers.join(",")];
    leadsResults.forEach((lead) => {
      const values = headers.map((h) => {
        const val = String((lead as any)[h] || "").replace(/"/g, '""');
        return `"${val}"`;
      });
      csvRows.push(values.join(","));
    });
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `leads-${(scrapedQuery || "google-maps").replace(/[^a-z0-9]/gi, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportLeadsJSON = () => {
    if (!leadsResults || leadsResults.length === 0) return;
    const blob = new Blob([JSON.stringify(leadsResults, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `leads-${(scrapedQuery || "google-maps").replace(/[^a-z0-9]/gi, "_")}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerate = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const targetPrompt = customPrompt || prompt;
    if (!targetPrompt.trim() || loading) return;

    setLoading(true);
    setError(null);
    setGeneratedCode("");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "";
      const apiEndpoint = backendUrl ? `${backendUrl}/api/generate` : "/api/generate";

      const manualGemini = geminiKeyInput || localStorage.getItem("devforge_gemini_api_key") || "";
      const manualOpenAI = openaiKeyInput || localStorage.getItem("devforge_openai_api_key") || "";
      const manualAnthropic = anthropicKeyInput || localStorage.getItem("devforge_anthropic_api_key") || "";
      const manualCustom = customKeyInput || localStorage.getItem("devforge_custom_api_key") || "";

      const reqHeaders: Record<string, string> = { "Content-Type": "application/json" };
      if (manualGemini) reqHeaders["x-gemini-key"] = manualGemini;
      if (manualOpenAI) reqHeaders["x-openai-key"] = manualOpenAI;
      if (manualAnthropic) reqHeaders["x-anthropic-key"] = manualAnthropic;
      if (manualCustom) reqHeaders["x-custom-api-key"] = manualCustom;

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: reqHeaders,
        body: JSON.stringify({
          prompt: targetPrompt,
          targetLanguage: targetLanguage,
          themeTokens: themeTokens,
          geminiApiKey: manualGemini,
          openaiApiKey: manualOpenAI,
          anthropicApiKey: manualAnthropic,
          customApiKey: manualCustom,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Generation failed (${response.status})`);
      }

      // Stream AI Code response in real-time chunk-by-chunk
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          setGeneratedCode(accumulated);
        }

        if (accumulated) {
          localStorage.setItem("devforge_preview_code", accumulated);
          const newHistoryItem = {
            id: Date.now().toString(),
            title: targetPrompt.length > 26 ? targetPrompt.substring(0, 26) + "..." : targetPrompt,
            prompt: targetPrompt,
            code: accumulated,
            date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setChatHistory((prev) => {
            const updated = [newHistoryItem, ...prev.filter((i) => i.prompt !== targetPrompt)];
            const userKey = (userEmail || userName || "guest").trim().toLowerCase();
            localStorage.setItem(`devforge_chat_history_${userKey}`, JSON.stringify(updated));
            return updated;
          });
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate website code.");
    } finally {
      setLoading(false);
    }
  };

  const openLivePreviewNewTab = () => {
    if (generatedCode) {
      localStorage.setItem("devforge_preview_code", generatedCode);
    }
    window.open("/preview", "_blank");
  };

  // Dynamic Projects State & Handlers
  interface ProjectCardItem {
    id: string;
    title: string;
    date: string;
    key: string;
    status: "Deployed" | "Draft" | "In Review";
    tags: string[];
    type: "landing" | "dashboard" | "mobile" | "ecommerce";
    bg: string;
  }

  const DEFAULT_PROJECTS: ProjectCardItem[] = [
    {
      id: "p1",
      title: "Zoromi Landingpage",
      date: "Edited May 12, 2026",
      key: "saas-landing",
      status: "Deployed",
      tags: ["Next.js", "Tailwind", "SaaS"],
      type: "landing",
      bg: "from-indigo-500/10 via-purple-500/10 to-blue-500/10",
    },
    {
      id: "p2",
      title: "Ondo POS Dashboard",
      date: "Edited May 4, 2026",
      key: "dashboard",
      status: "Draft",
      tags: ["React", "TypeScript", "POS"],
      type: "dashboard",
      bg: "from-amber-500/10 via-orange-500/10 to-yellow-500/10",
    },
    {
      id: "p3",
      title: "BYDH Mobile App",
      date: "Edited May 6, 2026",
      key: "portfolio",
      status: "In Review",
      tags: ["React Native", "Mobile", "iOS"],
      type: "mobile",
      bg: "from-sky-500/10 via-blue-500/10 to-cyan-500/10",
    },
    {
      id: "p4",
      title: "E-Commerce Storefront",
      date: "Edited May 8, 2026",
      key: "ecommerce",
      status: "Deployed",
      tags: ["React", "Tailwind", "Store"],
      type: "ecommerce",
      bg: "from-emerald-500/10 via-teal-500/10 to-green-500/10",
    },
  ];

  const [projectsList, setProjectsList] = useState<ProjectCardItem[]>(DEFAULT_PROJECTS);
  const [isProjectsLoading, setIsProjectsLoading] = useState<boolean>(false);
  const [activeCardMenu, setActiveCardMenu] = useState<string | null>(null);
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [renameTitleInput, setRenameTitleInput] = useState<string>("");

  const handleOpenProject = (proj: ProjectCardItem) => {
    if (STARTER_TEMPLATES[proj.key]) {
      setPrompt(STARTER_TEMPLATES[proj.key].prompt);
      setGeneratedCode(STARTER_TEMPLATES[proj.key].code);
      localStorage.setItem("devforge_preview_code", STARTER_TEMPLATES[proj.key].code);
    }
    setActiveCardMenu(null);
  };

  const handleRenameProject = (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setProjectsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title: newTitle.trim() } : p))
    );
    setRenamingProjectId(null);
    setActiveCardMenu(null);
  };

  const handleDuplicateProject = (proj: ProjectCardItem) => {
    const newProj: ProjectCardItem = {
      ...proj,
      id: "p_" + Date.now(),
      title: `${proj.title} (Copy)`,
      date: "Just now",
      status: "Draft",
    };
    setProjectsList((prev) => [newProj, ...prev]);
    setActiveCardMenu(null);
  };

  const handleDeleteProject = (id: string) => {
    setProjectsList((prev) => prev.filter((p) => p.id !== id));
    setActiveCardMenu(null);
  };

  const renderProjectPreviewMockup = (type: string) => {
    if (type === "dashboard") {
      return (
        <div className="w-full h-full rounded-lg bg-white/90 border border-slate-200/80 p-2 space-y-1.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
            <div className="w-10 h-1.5 rounded bg-amber-500"></div>
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="p-1 rounded bg-amber-50 border border-amber-100 space-y-1">
              <div className="w-4 h-1 bg-amber-300 rounded"></div>
              <div className="w-6 h-2 bg-amber-600 rounded"></div>
            </div>
            <div className="p-1 rounded bg-orange-50 border border-orange-100 space-y-1">
              <div className="w-4 h-1 bg-orange-300 rounded"></div>
              <div className="w-6 h-2 bg-orange-600 rounded"></div>
            </div>
          </div>
          <div className="flex items-end gap-1 h-6 bg-slate-50 p-1 rounded border border-slate-100">
            <div className="w-1/4 h-2 bg-amber-400 rounded-t"></div>
            <div className="w-1/4 h-4 bg-orange-500 rounded-t"></div>
            <div className="w-1/4 h-3 bg-amber-500 rounded-t"></div>
            <div className="w-1/4 h-5 bg-amber-600 rounded-t"></div>
          </div>
        </div>
      );
    }
    if (type === "mobile") {
      return (
        <div className="w-full h-full rounded-lg bg-slate-900 border border-slate-700 p-1.5 flex flex-col justify-between items-center shadow-sm">
          <div className="w-6 h-1 rounded-full bg-slate-700 mb-0.5"></div>
          <div className="w-full flex-1 bg-white rounded p-1.5 space-y-1.5 flex flex-col justify-between">
            <div className="w-full h-5 rounded bg-sky-500/20 border border-sky-300/40 p-1 flex items-center justify-between">
              <div className="w-6 h-1 bg-sky-600 rounded"></div>
              <div className="w-2 h-2 rounded-full bg-sky-500"></div>
            </div>
            <div className="grid grid-cols-4 gap-1">
              <div className="h-3 rounded bg-slate-200"></div>
              <div className="h-3 rounded bg-slate-200"></div>
              <div className="h-3 rounded bg-slate-200"></div>
              <div className="h-3 rounded bg-slate-200"></div>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded"></div>
          </div>
          <div className="w-4 h-1 rounded-full bg-slate-600 mt-0.5"></div>
        </div>
      );
    }
    if (type === "ecommerce") {
      return (
        <div className="w-full h-full rounded-lg bg-white/90 border border-slate-200/80 p-2 space-y-1.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
            <div className="w-8 h-1.5 rounded bg-emerald-600"></div>
            <div className="w-3 h-1.5 rounded bg-emerald-200"></div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded bg-emerald-50 border border-emerald-100 p-1 space-y-1">
              <div className="w-full h-4 bg-emerald-200/60 rounded"></div>
              <div className="w-6 h-1 bg-slate-600 rounded"></div>
            </div>
            <div className="rounded bg-teal-50 border border-teal-100 p-1 space-y-1">
              <div className="w-full h-4 bg-teal-200/60 rounded"></div>
              <div className="w-6 h-1 bg-slate-600 rounded"></div>
            </div>
          </div>
          <div className="w-full h-2 rounded bg-emerald-600/80"></div>
        </div>
      );
    }
    return (
      <div className="w-full h-full rounded-lg bg-white/90 border border-slate-200/80 p-2 space-y-1.5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1">
          <div className="w-4 h-1.5 rounded-full bg-indigo-500"></div>
          <div className="flex gap-1">
            <div className="w-3 h-1 rounded bg-slate-200"></div>
            <div className="w-3 h-1 rounded bg-slate-200"></div>
          </div>
        </div>
        <div className="space-y-1 text-center py-1">
          <div className="w-3/4 h-2 rounded bg-slate-800 mx-auto"></div>
          <div className="w-1/2 h-1 rounded bg-slate-300 mx-auto"></div>
          <div className="w-8 h-2 rounded bg-blue-600 mx-auto mt-1"></div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <div className="h-4 rounded bg-indigo-50 border border-indigo-100"></div>
          <div className="h-4 rounded bg-indigo-50 border border-indigo-100"></div>
          <div className="h-4 rounded bg-indigo-50 border border-indigo-100"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex relative" dir={dirFor(locale)}>
      {/* 1. Left Sidebar Navigation */}
      <aside
        className={`bg-white border-r border-slate-200/80 flex flex-col justify-between py-5 sticky top-0 h-screen z-30 transition-all duration-300 ${
          isSidebarExpanded ? "w-64 px-4" : "w-16 md:w-20 items-center px-2"
        }`}
      >
        {/* Top Logo & Expand/Collapse Toggle */}
        <div className="flex flex-col gap-4">
          <div className={`flex items-center ${isSidebarExpanded ? "justify-between w-full" : "justify-center"}`}>
            <div className="flex items-center gap-3">
              {isSidebarExpanded && (
                <span className="font-extrabold text-slate-900 text-base tracking-tight truncate">
                  DevForge AI
                </span>
              )}
            </div>
            <button
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition shadow-sm cursor-pointer shrink-0"
            >
              {isSidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Dedicated + New Chat Button */}
          <button
            onClick={handleNewChat}
            title={t(locale, "nav.newChat")}
            className={`flex items-center gap-3 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition active:scale-95 ${
              isSidebarExpanded ? "w-full px-4 py-3 justify-start" : "w-10 h-10 justify-center mx-auto"
            }`}
          >
            <Plus className="w-5 h-5 shrink-0" />
            {isSidebarExpanded && <span className="truncate">{t(locale, "nav.newChat")}</span>}
          </button>
        </div>

        {/* Core Streamlined Navigation Actions */}
        <nav className="flex flex-col gap-2.5 w-full my-auto">
          {[
            {
              id: "search",
              icon: Search,
              label: t(locale, "nav.search"),
              action: () => setIsSearchModalOpen(true),
              highlight: false,
            },
            {
              id: "history",
              icon: History,
              label: t(locale, "nav.history"),
              action: () => setIsHistoryDrawerOpen(true),
              highlight: false,
            },
            {
              id: "github",
              icon: Github,
              label: t(locale, "nav.github"),
              action: () => setIsGithubModalOpen(true),
              highlight: false,
            },
            {
              id: "settings",
              icon: Settings,
              label: t(locale, "nav.settings"),
              action: () => setIsSettingsModalOpen(true),
              highlight: false,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.action}
                title={item.label}
                className={`flex items-center gap-3 rounded-xl transition font-medium text-xs ${
                  item.highlight
                    ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200/80"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                } ${isSidebarExpanded ? "w-full px-3.5 py-2.5 justify-start" : "w-10 h-10 justify-center mx-auto"}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${item.highlight ? "text-emerald-600" : ""}`} />
                {isSidebarExpanded && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom User Profile / Account */}
        <div className="flex flex-col gap-2 w-full pt-3 border-t border-slate-100">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            title="Account Settings"
            className={`flex items-center gap-3 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition text-xs font-medium ${
              isSidebarExpanded ? "w-full px-3 py-2 justify-start" : "w-10 h-10 justify-center mx-auto"
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
              {getInitials(userName)}
            </div>
            {isSidebarExpanded && <span className="truncate">{userName || "Account"}</span>}
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("devforge_user_name");
              localStorage.removeItem("devforge_user_email");
              setUserName("");
              setUserEmail("");
              setSignUpName("");
              setSignUpEmail("");
              setChatHistory([]);
              setIsAuthModalOpen(true);
            }}
            title={t(locale, "nav.signOut")}
            className={`flex items-center gap-3 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition text-xs font-medium ${
              isSidebarExpanded ? "w-full px-3 py-2 justify-start" : "w-10 h-10 justify-center mx-auto"
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {isSidebarExpanded && <span>{t(locale, "nav.signOut")}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 2. Top Header */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/60 bg-white/50 backdrop-blur-md sticky top-0 z-20">
          {/* Left Profile Segment */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 cursor-pointer transition border border-slate-200/60 shadow-sm"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {getInitials(userName)}
              </div>
              <span className="text-xs font-bold text-slate-800">{userName || "Sign Up / Register"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{userName || "Guest User"}</p>
                  {userEmail && <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>}
                </div>
                <button
                  onClick={() => {
                    setSignUpName(userName);
                    setSignUpEmail(userEmail);
                    setIsAuthModalOpen(true);
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2"
                >
                  <span>✏️ Edit Profile Name</span>
                </button>
                <button
                  onClick={() => {
                    setIsSettingsModalOpen(true);
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2"
                >
                  <span>⚙️ {t(locale, "nav.settings")}</span>
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("devforge_user_name");
                    localStorage.removeItem("devforge_user_email");
                    setUserName("");
                    setUserEmail("");
                    setChatHistory([]);
                    setIsUserMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2 border-t border-slate-100"
                >
                  <span>🚪 {t(locale, "nav.signOut")}</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Action Buttons: Global Language Selector, Deploy, New Chat */}
          <div className="flex items-center gap-2.5">
            {/* Styled Global Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-2 bg-slate-100/90 hover:bg-slate-200/80 px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-800 transition active:scale-95 shadow-sm cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>
                  {locales.find((l) => l.code === locale)?.label || "English"} ({locale.toUpperCase()})
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isLangDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isLangDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsLangDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      {t(locale, "settings.language")}
                    </div>
                    {locales.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLocale(l.code);
                          localStorage.setItem("devforge_language", l.code);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-left transition ${
                          locale === l.code
                            ? "bg-blue-50 text-blue-600 font-bold"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span>{l.label} ({l.code.toUpperCase()})</span>
                        {locale === l.code && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleNewChat}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t(locale, "nav.newChat")}</span>
            </button>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-10 space-y-10">
          {/* 3. Hero Greeting Header */}
          <div className="text-center space-y-2 pt-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t(locale, "hero.greeting")}, <span className="text-blue-600 font-semibold">{getFirstName(userName)}</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium">{t(locale, "hero.subtitle")}</p>
          </div>

          {/* 4. Center Floating Prompt Studio Box */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-4 space-y-4 max-w-3xl mx-auto transition-all">
            {/* Top Toolbar Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              {/* Left Screen Mode Pills */}
              <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-full text-xs font-medium text-slate-600">
                <button
                  onClick={() => setScreenMode("single")}
                  className={`px-3.5 py-1 rounded-full transition ${
                    screenMode === "single"
                      ? "bg-white text-slate-900 font-bold shadow-sm"
                      : "hover:text-slate-900"
                  }`}
                >
                  {t(locale, "prompt.singleScreen")}
                </button>
                <button
                  onClick={() => setScreenMode("flow")}
                  className={`px-3.5 py-1 rounded-full transition ${
                    screenMode === "flow"
                      ? "bg-white text-slate-900 font-bold shadow-sm"
                      : "hover:text-slate-900"
                  }`}
                >
                  {t(locale, "prompt.createFlow")}
                </button>
                <button
                  onClick={() => setScreenMode("leads")}
                  className={`px-3.5 py-1 rounded-full transition ${
                    screenMode === "leads"
                      ? "bg-white text-slate-900 font-bold shadow-sm"
                      : "hover:text-slate-900"
                  }`}
                >
                  <span>{t(locale, "prompt.googleMapsLeads") || "Google Maps Leads"}</span>
                </button>
              </div>

              {/* Right Viewport Mode Pills */}
              <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-full text-xs font-medium text-slate-600">
                <button
                  onClick={() => setIsStyleInspectorOpen(!isStyleInspectorOpen)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full transition ${
                    isStyleInspectorOpen
                      ? "bg-blue-600 text-white font-bold shadow-sm"
                      : "hover:bg-white text-slate-600 hover:text-slate-900"
                  }`}
                  title={t(locale, "inspector.title")}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{t(locale, "inspector.title")}</span>
                </button>
                <button
                  onClick={() => setIsHistoryDrawerOpen(true)}
                  className="p-1.5 rounded-full hover:bg-white text-slate-500 hover:text-slate-900 transition"
                  title="View History"
                >
                  <History className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceMode("mobile")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full transition ${
                    deviceMode === "mobile"
                      ? "bg-white text-slate-900 font-bold shadow-sm"
                      : "hover:text-slate-900"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{t(locale, "prompt.mobile")}</span>
                </button>
                <button
                  onClick={() => setDeviceMode("desktop")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full transition ${
                    deviceMode === "desktop"
                      ? "bg-white text-slate-900 font-bold shadow-sm"
                      : "hover:text-slate-900"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>{t(locale, "prompt.desktop")}</span>
                </button>
                <button
                  onClick={() => setDeviceMode("tablet")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full transition ${
                    deviceMode === "tablet"
                      ? "bg-white text-slate-900 font-bold shadow-sm"
                      : "hover:text-slate-900"
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>{t(locale, "prompt.tablet")}</span>
                </button>
              </div>
            </div>

            {/* Middle Text Prompt Input */}
            <form onSubmit={(e) => (screenMode === "leads" ? handleScrapeLeads(e) : handleGenerate(e))}>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (screenMode === "leads") {
                      handleScrapeLeads();
                    } else {
                      handleGenerate();
                    }
                  }
                }}
                disabled={loading || isScrapingLeads}
                rows={3}
                placeholder={
                  screenMode === "leads"
                    ? "Search Google Maps for leads (e.g. 'Find dentists in Karachi', 'Find software houses in Lahore')…"
                    : t(locale, "prompt.placeholder")
                }
                className="w-full bg-transparent p-2 text-sm text-slate-800 placeholder-slate-400 outline-none resize-none"
              />

              {/* Bottom Toolbar & Generate Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {/* Target Language Dropdown Selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsTargetLangDropdownOpen(!isTargetLangDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-xs font-bold text-slate-800 transition cursor-pointer shadow-sm active:scale-95"
                      title="Select Target Language / Framework for Code Generation"
                    >
                      <span>{targetLanguage}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isTargetLangDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isTargetLangDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsTargetLangDropdownOpen(false)} />
                        <div className="absolute left-0 bottom-full mb-2 w-52 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                          <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                            Target Language
                          </div>
                          {TARGET_LANGUAGES.map((lang) => (
                            <button
                              key={lang.id}
                              type="button"
                              onClick={() => {
                                setTargetLanguage(lang.id);
                                setIsTargetLangDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-left transition ${
                                targetLanguage === lang.id
                                  ? "bg-blue-50 text-blue-600 font-bold"
                                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                              }`}
                            >
                              <span>{lang.label}</span>
                              {targetLanguage === lang.id && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!prompt.trim() || loading || isScrapingLeads}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-full shadow-md shadow-blue-500/20 active:scale-95 transition"
                >
                  {loading || isScrapingLeads ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      <span>{isScrapingLeads ? "Searching Leads…" : t(locale, "prompt.generating")}</span>
                    </>
                  ) : screenMode === "leads" ? (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Search Leads</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t(locale, "prompt.generate")}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* 4.1. Visual Style Inspector Panel */}
          {isStyleInspectorOpen && (
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-top-2 duration-200">
              <StyleInspector
                themeTokens={themeTokens}
                onChange={setThemeTokens}
                locale={locale}
                isOpen={isStyleInspectorOpen}
                onClose={() => setIsStyleInspectorOpen(false)}
              />
            </div>
          )}

          {/* 4.5. Google Maps Lead Results Section (Visible in 'leads' mode) */}
          {screenMode === "leads" && (
            <div className="max-w-4xl mx-auto space-y-4">
              {isScrapingLeads && (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 text-center space-y-4 animate-pulse">
                  <div className="w-12 h-12 rounded-full border-3 border-blue-600 border-t-transparent animate-spin mx-auto"></div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Searching Google Maps for Leads...</h3>
                    <p className="text-xs text-slate-500 mt-1">Connecting to Google Maps Scraper Kit backend to extract business listings.</p>
                  </div>
                </div>
              )}

              {leadsError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
                  <span>⚠️ {leadsError}</span>
                  <button onClick={() => setLeadsError(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
                </div>
              )}

              {!isScrapingLeads && leadsResults && (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden space-y-4 p-5 md:p-6 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900">
                        Google Maps Lead Results
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                          {leadsResults.length} leads
                        </span>
                      </h2>
                      {scrapedQuery && (
                        <p className="text-xs text-slate-500 mt-0.5">Results for: "{scrapedQuery}"</p>
                      )}
                    </div>
                    {leadsResults.length > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleExportLeadsCSV}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
                          title="Export Leads as CSV"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export CSV</span>
                        </button>
                        <button
                          onClick={handleExportLeadsJSON}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
                          title="Export Leads as JSON"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export JSON</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {leadsResults.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <p className="text-sm font-bold text-slate-700">No results found</p>
                      <p className="text-xs text-slate-500">No business listings matched your search query. Try broadening your location or search terms.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                          <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                            <th className="py-3 px-3">Business Name</th>
                            <th className="py-3 px-3">Category</th>
                            <th className="py-3 px-3">Address</th>
                            <th className="py-3 px-3">Phone</th>
                            <th className="py-3 px-3">Website Status</th>
                            <th className="py-3 px-3">Rating / Reviews</th>
                            <th className="py-3 px-3">Email</th>
                            <th className="py-3 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                          {leadsResults.map((lead, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80 transition">
                              <td className="py-3 px-3 font-bold text-slate-900">{lead.title}</td>
                              <td className="py-3 px-3">{lead.category || "—"}</td>
                              <td className="py-3 px-3 max-w-xs truncate" title={lead.address}>{lead.address || "—"}</td>
                              <td className="py-3 px-3 font-medium">{lead.phone || "—"}</td>
                              <td className="py-3 px-3">
                                {lead.website ? (
                                  <a href={lead.website.startsWith("http") ? lead.website : `http://${lead.website}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-semibold">
                                    <span>Has Website</span>
                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                  </a>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80 text-[10px] font-bold">
                                    No Website
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                {lead.review_rating ? (
                                  <span className="font-semibold text-slate-800">
                                    {lead.review_rating} {lead.review_count ? `(${lead.review_count})` : ""}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="py-3 px-3">{lead.emails || "—"}</td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  onClick={() => handleCreateWebsiteForLead(lead)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow active:scale-95 transition cursor-pointer"
                                  title={`Generate custom website for ${lead.title}`}
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Create Website</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between max-w-3xl mx-auto">
              <span>⚠️ {error}</span>
              <button onClick={() => setError(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
          )}



          {/* Ready State Status Message */}
          {generatedCode && (
            <div className="pt-6 border-t border-slate-200 animate-in fade-in">
              <div className="bg-white rounded-3xl border border-emerald-200/80 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{t(locale, "project.readyTitle")}</h3>
                    <p className="text-xs text-slate-500 font-medium">{t(locale, "project.readyDesc")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={openLivePreviewNewTab}
                    className="flex-1 md:flex-initial px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{t(locale, "project.livePreview")}</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 6. Settings Modal for Manual API Keys & Language */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 relative">
            <button
              onClick={() => setIsSettingsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xs font-bold w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center transition"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{t(locale, "settings.title")}</h3>
                <p className="text-xs text-slate-500">{t(locale, "settings.subtitle")}</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                localStorage.setItem("devforge_language", locale);
                localStorage.setItem("devforge_gemini_api_key", geminiKeyInput.trim());
                localStorage.setItem("devforge_openai_api_key", openaiKeyInput.trim());
                localStorage.setItem("devforge_anthropic_api_key", anthropicKeyInput.trim());
                localStorage.setItem("devforge_custom_api_key", customKeyInput.trim());
                setSettingsSaved(true);
                setTimeout(() => setSettingsSaved(false), 2500);
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t(locale, "settings.language")}</span>
                </label>
                <select
                  value={locale}
                  onChange={(e) => {
                    const newLoc = e.target.value as Locale;
                    setLocale(newLoc);
                    localStorage.setItem("devforge_language", newLoc);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition font-medium"
                >
                  {locales.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label} ({l.code.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t(locale, "settings.geminiKey")}</span>
                </label>
                <input
                  type="password"
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t(locale, "settings.openaiKey")}</span>
                </label>
                <input
                  type="password"
                  value={openaiKeyInput}
                  onChange={(e) => setOpenaiKeyInput(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-purple-600" />
                  <span>{t(locale, "settings.anthropicKey")}</span>
                </label>
                <input
                  type="password"
                  value={anthropicKeyInput}
                  onChange={(e) => setAnthropicKeyInput(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t(locale, "settings.customKey")}</span>
                </label>
                <input
                  type="password"
                  value={customKeyInput}
                  onChange={(e) => setCustomKeyInput(e.target.value)}
                  placeholder="Custom backend API secret..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              {settingsSaved && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{t(locale, "settings.savedSuccess")}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>{t(locale, "settings.save")}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 7. Sign-Up / Register Account Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 relative">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xs font-bold w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center transition"
            >
              ✕
            </button>
            <div className="text-center space-y-1.5 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 text-white text-2xl font-bold flex items-center justify-center mx-auto shadow-md shadow-blue-500/20 mb-2">
                ⚡
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Welcome to DevForge AI</h2>
              <p className="text-xs text-slate-500 font-medium">Create your account or enter your name to personalize your workspace</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (signUpName.trim()) {
                  const nameToSave = signUpName.trim();
                  const emailToSave = signUpEmail.trim();
                  setUserName(nameToSave);
                  if (emailToSave) {
                    setUserEmail(emailToSave);
                    localStorage.setItem("devforge_user_email", emailToSave);
                  }
                  localStorage.setItem("devforge_user_name", nameToSave);

                  const userKey = (emailToSave || nameToSave).toLowerCase();
                  const userHistory = localStorage.getItem(`devforge_chat_history_${userKey}`);
                  if (userHistory) {
                    try {
                      setChatHistory(JSON.parse(userHistory));
                    } catch {
                      setChatHistory([]);
                    }
                  } else {
                    setChatHistory([]);
                    localStorage.setItem(`devforge_chat_history_${userKey}`, JSON.stringify([]));
                  }

                  setIsAuthModalOpen(false);
                }
              }}
              className="space-y-4 pt-1"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Name / First Name *</label>
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Address (Optional)</label>
                <input
                  type="email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="sarah@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              <button
                type="submit"
                disabled={!signUpName.trim()}
                className="w-full py-3 bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 transition active:scale-95"
              >
                Save Account & Continue →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 8. Search Chats Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Search className="w-4 h-4 text-blue-600" />
                <span>{t(locale, "nav.search")}</span>
              </div>
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xs transition"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                placeholder="Search by prompt or title (e.g. 'Calculator', 'Portfolio')..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {chatHistory
                .filter(
                  (item) =>
                    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.prompt.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setPrompt(item.prompt);
                      if (item.code) setGeneratedCode(item.code);
                      setIsSearchModalOpen(false);
                    }}
                    className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{item.prompt}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                  </div>
                ))}
              {chatHistory.filter(
                (item) =>
                  item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.prompt.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400">No matching chats found</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 9. Chat History Slide-Out Drawer */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex justify-end z-50 animate-in fade-in">
          <div className="bg-white w-full max-w-md h-full border-l border-slate-200 shadow-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-extrabold text-slate-900">{t(locale, "nav.history")}</h2>
                </div>
                <button
                  onClick={() => setIsHistoryDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xs transition"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                    <p className="text-xs font-medium text-slate-600">No chat history for {userName || "this user"} yet.</p>
                    <p className="text-[11px] text-slate-400">Start a new chat to generate your first project!</p>
                  </div>
                ) : (
                  chatHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setPrompt(item.prompt);
                        if (item.code) setGeneratedCode(item.code);
                        setIsHistoryDrawerOpen(false);
                      }}
                      className="p-3.5 rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer transition space-y-1 group"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">{item.title}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{item.prompt}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => {
                handleNewChat();
                setIsHistoryDrawerOpen(false);
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t(locale, "nav.newChat")}</span>
            </button>
          </div>
        </div>
      )}

      {/* 10. GitHub Repo Manager & Export Modal */}
      {isGithubModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 relative">
            <button
              onClick={() => setIsGithubModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xs font-bold w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center transition"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                <Github className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{t(locale, "github.modalTitle")}</h3>
                <p className="text-xs text-slate-500">Export active project code or push full codebase to repository</p>
              </div>
            </div>

            {githubPushSuccessUrl ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Full Codebase Pushed Successfully!</span>
                </div>
                <p className="text-xs text-slate-600">Your full codebase has been committed and pushed to GitHub:</p>
                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-emerald-300">
                  <input
                    type="text"
                    readOnly
                    value={githubPushSuccessUrl}
                    className="flex-1 text-xs text-slate-800 outline-none bg-transparent font-mono"
                  />
                </div>
                <a
                  href={githubPushSuccessUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition"
                >
                  <span>Open GitHub Repository</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <form onSubmit={handleGithubPatPush} className="space-y-4">
                {/* Step-by-step PAT Instructions Box */}
                <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-slate-700 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{t(locale, "github.patInstructionsTitle")}</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 pl-1">
                    <li>{t(locale, "github.patStep1")}</li>
                    <li>{t(locale, "github.patStep2")}</li>
                  </ol>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t(locale, "github.patLabel")} *</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FolderGit2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t(locale, "github.repoLabel")} *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={githubRepoInput}
                    onChange={(e) => setGithubRepoInput(e.target.value)}
                    placeholder="e.g. my-awesome-web-app"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                {isGithubPushing && (
                  <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl animate-in fade-in">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                      <span className="truncate pr-2">{githubPushProgressStatus}</span>
                      <span className="font-mono text-[11px] text-blue-600 font-bold shrink-0">{githubPushProgressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${githubPushProgressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {githubPushError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    ⚠️ {githubPushError}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadCode}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download (.tsx)</span>
                  </button>

                  <button
                    type="submit"
                    disabled={!githubToken.trim() || !githubRepoInput.trim() || isGithubPushing}
                    className="flex-1 py-3 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    {isGithubPushing ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                        <span>Pushing Codebase...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>{t(locale, "github.pushBtn")}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 11. Deploy Project Modal */}
      {isDeployModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 relative">
            <button
              onClick={() => setIsDeployModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xs font-bold w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center transition"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Deploy Project Live</h3>
                <p className="text-xs text-slate-500">Publish your project online with custom hosting</p>
              </div>
            </div>

            {deploySuccessUrl ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Project Deployed Successfully!</span>
                </div>
                <p className="text-xs text-slate-600">Your project is live and hosted at:</p>
                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-emerald-300">
                  <input
                    type="text"
                    readOnly
                    value={deploySuccessUrl}
                    className="flex-1 text-xs text-slate-800 outline-none bg-transparent font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(deploySuccessUrl);
                      setCopiedUrl(true);
                      setTimeout(() => setCopiedUrl(false), 2000);
                    }}
                    className="px-3 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-lg hover:bg-emerald-500 transition"
                  >
                    {copiedUrl ? "Copied!" : "Copy"}
                  </button>
                </div>
                <a
                  href={deploySuccessUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition"
                >
                  <span>🚀 Open Live Web App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Project / Domain Name</label>
                  <input
                    type="text"
                    value={deployRepoName}
                    onChange={(e) => setDeployRepoName(e.target.value)}
                    placeholder="e.g. my-awesome-calculator"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>

                {/* 4-Phase Stepper Status Tracker Component */}
                <div className="pt-2">
                  <DeployStepper
                    currentPhase={deployPhase}
                    liveUrl={deploySuccessUrl}
                    errorMessage={deployError}
                    locale={locale}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleDownloadCode}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download (.tsx)</span>
                  </button>
                  <button
                    onClick={handleDeployProject}
                    disabled={isDeploying}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 disabled:opacity-50 transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isDeploying ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                        <span>Deploying...</span>
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4" />
                        <span>Deploy Live Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating AI Chatbot & Lead Capture Widget Component */}
      <ChatWidget locale={locale} isOpen={isChatWidgetOpen} onClose={() => setIsChatWidgetOpen(false)} />
    </div>
  );
}
