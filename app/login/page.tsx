"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Github, Sparkles, ArrowRight, UserCheck, Lock, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  const handleGuestSignIn = async () => {
    setGuestLoading(true);
    try {
      await signIn("credentials", { callbackUrl: "/" });
    } catch {
      setGuestLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setGithubLoading(true);
    try {
      await signIn("github", { callbackUrl: "/" });
    } catch {
      setGithubLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    try {
      await signIn("credentials", { email, callbackUrl: "/" });
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between relative z-10 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-600/30 group-hover:scale-105 transition">
            D
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              DevForge <span className="text-blue-400 text-xs px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-400/20">AI</span>
            </h1>
            <p className="text-[11px] font-bold text-slate-400">Web Builder Platform</p>
          </div>
        </Link>
        <Link
          href="/"
          className="text-xs font-bold text-slate-400 hover:text-white transition flex items-center gap-1 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md"
        >
          Back to Workspace <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto relative z-10 my-12">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-extrabold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Sign In to DevForge
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">Welcome Back</h2>
            <p className="text-xs text-slate-400">Access your saved projects, leads, and 1-click deployments.</p>
          </div>

          {/* Social Sign In Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGithubSignIn}
              disabled={githubLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs flex items-center justify-center gap-3 transition shadow-lg active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <Github className="w-4 h-4 text-slate-900" />
              {githubLoading ? "Connecting to GitHub..." : "Continue with GitHub"}
            </button>

            <button
              onClick={handleGuestSignIn}
              disabled={guestLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-3 transition shadow-lg shadow-blue-600/30 active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              {guestLoading ? "Signing in as Guest..." : "Instant Demo / Guest Access"}
            </button>
          </div>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">or sign in with email</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Email Sign In Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-slate-400" />
              {loading ? "Sending Magic Link..." : "Sign In with Email"}
            </button>
          </form>

          <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/40 text-[11px] text-slate-400 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Secure session persistence powered by NextAuth & Prisma ORM.</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-[11px] text-slate-500 relative z-10 py-4">
        <p>© {new Date().getFullYear()} DevForge AI Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
