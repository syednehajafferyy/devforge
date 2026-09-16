"use client";

import React from "react";
import { FolderGit2, GitCommit, Rocket, CheckCircle2, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { t, Locale } from "@/lib/i18n";

export type DeployPhase = "idle" | "repo" | "commit" | "build" | "live" | "failed";

interface DeployStepperProps {
  currentPhase: DeployPhase;
  repoUrl?: string | null;
  liveUrl?: string | null;
  errorMessage?: string | null;
  locale?: Locale;
}

export default function DeployStepper({
  currentPhase,
  repoUrl,
  liveUrl,
  errorMessage,
  locale = "en",
}: DeployStepperProps) {
  const steps = [
    {
      id: "repo",
      label: t(locale, "deploy.step.repo"),
      icon: FolderGit2,
    },
    {
      id: "commit",
      label: t(locale, "deploy.step.commit"),
      icon: GitCommit,
    },
    {
      id: "build",
      label: t(locale, "deploy.step.build"),
      icon: Rocket,
    },
    {
      id: "live",
      label: t(locale, "deploy.step.live"),
      icon: CheckCircle2,
    },
  ];

  const getStepStatus = (stepId: string) => {
    if (currentPhase === "failed") return "failed";
    const phaseOrder = ["repo", "commit", "build", "live"];
    const currentIndex = phaseOrder.indexOf(currentPhase);
    const stepIndex = phaseOrder.indexOf(stepId);

    if (currentPhase === "idle") return "pending";
    if (stepIndex < currentIndex || currentPhase === "live") return "completed";
    if (stepIndex === currentIndex) return "in-progress";
    return "pending";
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-blue-400" />
            1-Click Deployment Pipeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Automated GitHub Repository & Vercel Build Pipeline</p>
        </div>
        {currentPhase === "live" && (
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Production Live
          </span>
        )}
      </div>

      {/* 4-Phase Stepper Tracker */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
        {steps.map((step, idx) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center space-y-2 relative ${
                status === "completed"
                  ? "bg-blue-950/40 border-blue-500/30 text-white"
                  : status === "in-progress"
                  ? "bg-blue-600/20 border-blue-500 text-white ring-2 ring-blue-500/20"
                  : status === "failed"
                  ? "bg-rose-950/40 border-rose-500/30 text-rose-300"
                  : "bg-slate-800/40 border-slate-700/50 text-slate-400"
              }`}
            >
              {/* Step indicator badge */}
              <div className="flex items-center justify-center w-10 h-10 rounded-xl relative">
                {status === "completed" ? (
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : status === "in-progress" ? (
                  <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/50">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : status === "failed" ? (
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                )}
              </div>

              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                Phase 0{idx + 1}
              </span>
              <p className="text-xs font-semibold leading-tight">{step.label}</p>
            </div>
          );
        })}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-300">Deployment Notice</p>
            <p className="mt-0.5 opacity-90">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Live Outcome Links */}
      {(liveUrl || repoUrl) && (
        <div className="pt-2 flex flex-wrap items-center gap-3">
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition active:scale-98"
            >
              <ExternalLink className="w-4 h-4" />
              Open Live Production Deployment ({liveUrl.replace(/^https?:\/\//, "")})
            </a>
          )}
          {repoUrl && (
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <FolderGit2 className="w-4 h-4 text-slate-400" />
              View GitHub Repository
            </a>
          )}
        </div>
      )}
    </div>
  );
}
