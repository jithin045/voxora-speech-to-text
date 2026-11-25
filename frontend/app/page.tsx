"use client";

import { useEffect, useRef, useState } from "react";
import { transcriptionApi, Transcription } from "../lib/api";
import { float32ToInt16Base64 } from "../lib/audio";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000/ws";

export default function HomePage() {
  // Live recording state
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [title, setTitle] = useState("");
  const [liveText, setLiveText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // History CRUD state
  const [history, setHistory] = useState<Transcription[]>([]);
  const [search, setSearch] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // Refs for audio & WebSocket cleanup
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const loadHistory = async (query = "") => {
    try {
      setLoadingHistory(true);
      const data = await transcriptionApi.list(query);
      setHistory(data);
    } catch {
      setError("Could not load transcription history.");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
    return () => stopRecording();
  }, []);

  const startRecording = async () => {
    setError("");
    setStatus("Connecting...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "start" }));
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "ready") {
          setStatus("Listening (Hindi / English)...");
          setIsRecording(true);
          startTimeRef.current = Date.now();
          startAudioCapture(stream, ws);
        } else if (msg.type === "transcript" && msg.text) {
          setLiveText((prev) => (prev ? `${prev} ${msg.text}`.replace(/\s+/g, " ") : msg.text));
        } else if (msg.type === "error") {
          setError(msg.message || "Transcription error");
          stopRecording();
        }
      };

      ws.onerror = () => {
        setError("WebSocket connection failed. Is the backend running on port 5000?");
        stopRecording();
      };

      ws.onclose = () => {
        setIsRecording(false);
        setStatus("Idle");
      };
    } catch {
      setError("Microphone access denied or unavailable.");
      setStatus("Idle");
    }
  };

  const startAudioCapture = (stream: MediaStream, ws: WebSocket) => {
    const audioCtx = new AudioContext({ sampleRate: 16000 });
    audioCtxRef.current = audioCtx;

    const source = audioCtx.createMediaStreamSource(stream);
    const processor = audioCtx.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (ws.readyState !== WebSocket.OPEN) return;
      const inputData = e.inputBuffer.getChannelData(0);
      const base64Pcm = float32ToInt16Base64(inputData);
      ws.send(JSON.stringify({ type: "audio", data: base64Pcm }));
    };

    source.connect(processor);
    processor.connect(audioCtx.destination);
  };

  const stopRecording = () => {
    processorRef.current?.disconnect();
    audioCtxRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "stop" }));
      wsRef.current.close();
    }

    processorRef.current = null;
    audioCtxRef.current = null;
    streamRef.current = null;
    wsRef.current = null;
    setIsRecording(false);
    setStatus("Idle");
  };

  const handleSave = async () => {
    if (!liveText.trim()) return;
    try {
      setSaving(true);
      setError("");
      const durationSeconds = startTimeRef.current
        ? Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
        : undefined;

      await transcriptionApi.create({
        title: title.trim() || "Untitled Recording",
        content: liveText.trim(),
        durationSeconds,
      });

      setTitle("");
      setLiveText("");
      startTimeRef.current = null;
      await loadHistory(search);
    } catch {
      setError("Failed to save transcription.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: Transcription) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditContent(item.content);
  };

  const handleUpdate = async (id: string) => {
    try {
      await transcriptionApi.update(id, { title: editTitle, content: editContent });
      setEditingId(null);
      await loadHistory(search);
    } catch {
      setError("Failed to update transcription.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await transcriptionApi.remove(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setError("Failed to delete transcription.");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadHistory(search);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Voxora</h1>
            <p className="text-sm text-slate-400">
              Real-Time Multilingual Speech-to-Text (Hindi + English)
            </p>
          </div>
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full w-fit ${
              isRecording
                ? "bg-red-500/20 text-red-300 border border-red-500/40"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            {status}
          </span>
        </header>

        {error && (
          <div className="bg-red-950/60 border border-red-700 text-red-200 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Live Transcription Panel */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition cursor-pointer"
              >
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition cursor-pointer"
              >
                Stop Recording
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={!liveText.trim() || saving}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition cursor-pointer"
            >
              {saving ? "Saving..." : "Save to History"}
            </button>

            <button
              onClick={() => {
                setLiveText("");
                setTitle("");
              }}
              disabled={!liveText && !title}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-sm px-4 py-2.5 rounded-lg transition cursor-pointer"
            >
              Clear
            </button>
          </div>

          <input
            type="text"
            placeholder="Recording title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-slate-600"
          />

          <textarea
            rows={5}
            placeholder="Click Start Recording and speak in Hindi, English, or Hinglish..."
            value={liveText}
            onChange={(e) => setLiveText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-slate-600"
          />
        </section>

        {/* Transcription History Dashboard */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Transcription History</h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search transcripts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-slate-600"
              />
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-700 text-sm px-3 py-1.5 rounded-lg cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>

          {loadingHistory ? (
            <p className="text-sm text-slate-400">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-slate-400 bg-slate-900 border border-slate-800 rounded-xl p-6">
              No transcriptions saved yet.
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3"
                >
                  {editingId === item.id ? (
                    <div className="space-y-3">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                      />
                      <textarea
                        rows={3}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate(item.id)}
                          className="bg-blue-600 hover:bg-blue-500 text-xs font-medium px-3 py-1.5 rounded-md cursor-pointer"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded-md cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-slate-100">{item.title}</h3>
                          <p className="text-xs text-slate-500">
                            {new Date(item.createdAt).toLocaleString()}
                            {item.durationSeconds ? ` · ${item.durationSeconds}s` : ""}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => navigator.clipboard.writeText(item.content)}
                            className="bg-slate-800 hover:bg-slate-700 text-xs px-2.5 py-1 rounded-md cursor-pointer"
                          >
                            Copy
                          </button>
                          <button
                            onClick={() => startEdit(item)}
                            className="bg-slate-800 hover:bg-slate-700 text-xs px-2.5 py-1 rounded-md cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-950 hover:bg-red-900 text-red-300 text-xs px-2.5 py-1 rounded-md cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap">{item.content}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}