"use client";

import { useState } from "react";
import { StudioToolbar } from "../molecules/StudioToolbar";

interface Props {
  title: string;
  liveText: string;
  isRecording: boolean;
  saving: boolean;
  onTitleChange: (val: string) => void;
  onTextChange: (val: string) => void;
  onStart: () => void;
  onStop: () => void;
  onSave: () => void;
  onClear: () => void;
}

export function RecordingStudio({
  title,
  liveText,
  isRecording,
  saving,
  onTitleChange,
  onTextChange,
  onStart,
  onStop,
  onSave,
  onClear,
}: Props) {
  const [copied, setCopied] = useState(false);
  const words = liveText.trim() ? liveText.trim().split(/\s+/).length : 0;

  const handleCopy = () => {
    if (!liveText.trim()) return;
    navigator.clipboard.writeText(liveText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border bg-zinc-950/90 shadow-xl shadow-black/40 transition-colors ${
        isRecording ? "border-rose-500/40" : "border-zinc-800/90"
      }`}
    >
      {/* Top Accent Line */}
      <div
        className={`h-[2px] w-full bg-gradient-to-r ${
          isRecording
            ? "from-rose-500 via-orange-400 to-rose-500"
            : "from-indigo-500 via-cyan-400 to-indigo-500 opacity-70"
        }`}
      />

      <StudioToolbar
        isRecording={isRecording}
        canSave={Boolean(liveText.trim())}
        canClear={Boolean(liveText || title)}
        saving={saving}
        onStart={onStart}
        onStop={onStop}
        onSave={onSave}
        onClear={onClear}
      />

      <div className="p-5 sm:p-6 space-y-4">
        <input
          type="text"
          placeholder="Untitled recording..."
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full border-b border-zinc-800/70 bg-transparent pb-3 text-lg font-semibold tracking-tight text-white placeholder:text-zinc-600 focus:border-indigo-500/60 focus:outline-none transition-colors"
        />

        <textarea
          rows={12}
          placeholder="Click Start Recording and speak in any language. Your real-time transcript will stream here..."
          value={liveText}
          onChange={(e) => onTextChange(e.target.value)}
          className="w-full resize-none bg-transparent text-sm leading-7 text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-900/50 px-5 py-3 text-xs text-zinc-400">
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-zinc-300">
            {words} {words === 1 ? "word" : "words"}
          </span>
          <span className="text-zinc-500">{liveText.length} chars</span>
        </div>

        <button
          onClick={handleCopy}
          disabled={!liveText.trim()}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer disabled:opacity-30 ${
            copied
              ? "bg-emerald-500/15 text-emerald-300"
              : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
          }`}
        >
          {copied ? "Copied" : "Copy text"}
        </button>
      </div>
    </section>
  );
}