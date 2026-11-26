"use client";

import { Transcription } from "../../lib/api";
import { Button } from "../atoms/Button";
import { TranscriptCard } from "../molecules/TranscriptCard";

interface Props {
  history: Transcription[];
  loading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onUpdate: (id: string, title: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function HistorySidebar({
  history,
  loading,
  search,
  onSearchChange,
  onSearchSubmit,
  onUpdate,
  onDelete,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-950/90 shadow-xl shadow-black/40">
      <div className="border-b border-zinc-800/80 bg-zinc-900/70 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-white">Saved Transcripts</h2>
          <span className="rounded-full border border-indigo-500/25 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-mono font-medium text-indigo-300">
            {history.length}
          </span>
        </div>

        <form onSubmit={onSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search transcripts..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-[#07070A] pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
          <Button type="submit" variant="secondary" className="py-1.5 px-3">
            Find
          </Button>
        </form>
      </div>

      <div className="max-h-[540px] overflow-y-auto p-3 space-y-3">
        {loading ? (
          <div className="space-y-3 p-1">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-24 animate-pulse rounded-xl border border-zinc-800/70 bg-zinc-900/60" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center space-y-1.5">
            <p className="text-sm font-medium text-zinc-300">No transcripts yet</p>
            <p className="text-xs text-zinc-500">
              Start recording on the left and save your first clip.
            </p>
          </div>
        ) : (
          history.map((item) => (
            <TranscriptCard key={item.id} item={item} onUpdate={onUpdate} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}