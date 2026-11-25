export interface Transcription {
  id: string;
  title: string;
  content: string;
  languages: string[];
  durationSeconds: number | null;
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const transcriptionApi = {
  async list(search = ""): Promise<Transcription[]> {
    const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
    const res = await fetch(`${API_URL}/api/transcriptions${query}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch transcriptions");
    return res.json();
  },

  async create(payload: { title?: string; content: string; durationSeconds?: number }): Promise<Transcription> {
    const res = await fetch(`${API_URL}/api/transcriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to save transcription");
    return res.json();
  },

  async update(id: string, payload: { title?: string; content?: string }): Promise<Transcription> {
    const res = await fetch(`${API_URL}/api/transcriptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update transcription");
    return res.json();
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/transcriptions/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete transcription");
  },
};