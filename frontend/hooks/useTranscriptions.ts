"use client";

import { useEffect, useState } from "react";
import { transcriptionApi, Transcription } from "../lib/api";

export function useTranscriptions(onError: (msg: string) => void) {
  const [history, setHistory] = useState<Transcription[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async (query = "") => {
    try {
      setLoading(true);
      setHistory(await transcriptionApi.list(query));
    } catch {
      onError("Could not load transcription history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (title: string, content: string, durationSeconds?: number) => {
    try {
      setSaving(true);
      onError("");
      await transcriptionApi.create({
        title: title.trim() || "Untitled Recording",
        content: content.trim(),
        durationSeconds,
      });
      await load(search);
      return true;
    } catch {
      onError("Failed to save transcription.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const update = async (id: string, title: string, content: string) => {
    try {
      await transcriptionApi.update(id, { title, content });
      await load(search);
    } catch {
      onError("Failed to update transcription.");
    }
  };

  const remove = async (id: string) => {
    try {
      await transcriptionApi.remove(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch {
      onError("Failed to delete transcription.");
    }
  };

  return { history, search, setSearch, loading, saving, load, create, update, remove };
}