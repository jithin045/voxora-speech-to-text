"use client";

import { useState } from "react";
import { Transcription } from "../../lib/api";
import { Button } from "../atoms/Button";

interface Props {
  item: Transcription;
  onUpdate: (id: string, title: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TranscriptCard({ item, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [content, setContent] = useState(item.content);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSave = async () => {
    await onUpdate(item.id, title, content);
    setEditing(false);
  };

  if (editing) {
    return (
      <article className="p-4 space-y-2.5">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-[#09090B] px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
        />
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-[#09090B] p-2.5 text-xs leading-relaxed text-zinc-200 focus:border-indigo-500 focus:outline-none"
        />
        <div className="flex gap-2">
          <Button variant="primary" onClick={handleSave} className="py-1 px-3">Save</Button>
          <Button variant="secondary" onClick={() => setEditing(false)} className="py-1 px-3">Cancel</Button>
        </div>
      </article>
    );
  }

  return (
    <article className="p-4 hover:bg-zinc-900/60 transition-colors space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-zinc-100">{item.title}</h3>
          <p className="text-[11px] text-zinc-500">
            {new Date(item.createdAt).toLocaleString()}
            {item.durationSeconds ? ` · ${item.durationSeconds}s` : ""}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" onClick={handleCopy} className="px-2 py-1 text-[11px]">
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="ghost" onClick={() => setEditing(true)} className="px-2 py-1 text-[11px]">
            Edit
          </Button>
          <Button
            variant="ghost"
            onClick={() => onDelete(item.id)}
            className="px-2 py-1 text-[11px] text-rose-400 hover:bg-rose-950/60 hover:text-rose-300"
          >
            Delete
          </Button>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-zinc-400 whitespace-pre-wrap line-clamp-4">
        {item.content}
      </p>
    </article>
  );
}