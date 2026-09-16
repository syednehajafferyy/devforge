"use client";

import React from "react";
import { Sliders, X, Palette, Circle, Type } from "lucide-react";
import { t, Locale } from "@/lib/i18n";

export interface ThemeTokens {
  primaryColor?: string;
  radius?: "none" | "sm" | "md" | "lg" | "full";
  fontScale?: "compact" | "comfortable" | "spacious";
}

interface StyleInspectorProps {
  themeTokens: ThemeTokens;
  onChange: (tokens: ThemeTokens) => void;
  locale?: Locale;
  isOpen?: boolean;
  onClose?: () => void;
}

const PRESET_COLORS = [
  { name: "Blue", hex: "#3b82f6" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Purple", hex: "#8b5cf6" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Indigo", hex: "#6366f1" },
  { name: "Slate", hex: "#0f172a" },
];

const RADIUS_OPTIONS: Array<{ id: ThemeTokens["radius"]; label: string }> = [
  { id: "none", label: "Square (0px)" },
  { id: "sm", label: "Small (4px)" },
  { id: "md", label: "Medium (8px)" },
  { id: "lg", label: "Large (16px)" },
  { id: "full", label: "Pill / Full" },
];

const FONT_SCALE_OPTIONS: Array<{ id: ThemeTokens["fontScale"]; label: string }> = [
  { id: "compact", label: "Compact" },
  { id: "comfortable", label: "Comfortable" },
  { id: "spacious", label: "Spacious" },
];

export default function StyleInspector({
  themeTokens,
  onChange,
  locale = "en",
  isOpen = true,
  onClose,
}: StyleInspectorProps) {
  if (!isOpen) return null;

  const currentPrimary = themeTokens.primaryColor || "#3b82f6";
  const currentRadius = themeTokens.radius || "md";
  const currentFontScale = themeTokens.fontScale || "comfortable";

  return (
    <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm">{t(locale, "inspector.title")}</h3>
            <p className="text-[11px] text-slate-500">Visual No-Code Theme Tokens</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Primary Color Token */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
          <Palette className="w-4 h-4 text-blue-600" />
          {t(locale, "inspector.primaryColor")}
        </label>
        <div className="flex flex-wrap items-center gap-2.5">
          {PRESET_COLORS.map((col) => (
            <button
              key={col.hex}
              onClick={() => onChange({ ...themeTokens, primaryColor: col.hex })}
              style={{ backgroundColor: col.hex }}
              className={`w-8 h-8 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center shadow-sm ${
                currentPrimary === col.hex ? "ring-4 ring-blue-500/30 scale-110" : "hover:scale-105"
              }`}
              title={col.name}
            />
          ))}
          <input
            type="color"
            value={currentPrimary}
            onChange={(e) => onChange({ ...themeTokens, primaryColor: e.target.value })}
            className="w-8 h-8 rounded-full border border-slate-200 p-0 cursor-pointer overflow-hidden"
            title="Custom Color"
          />
        </div>
      </div>

      {/* Corner Radius Token */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
          <Circle className="w-4 h-4 text-blue-600" />
          {t(locale, "inspector.radius")}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onChange({ ...themeTokens, radius: opt.id })}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer text-center ${
                currentRadius === opt.id
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Font Scale Token */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
          <Type className="w-4 h-4 text-blue-600" />
          {t(locale, "inspector.fontScale")}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {FONT_SCALE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onChange({ ...themeTokens, fontScale: opt.id })}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer text-center ${
                currentFontScale === opt.id
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
