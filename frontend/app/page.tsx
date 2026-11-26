"use client";

import { useState } from "react";
import { useRecorder } from "../hooks/useRecorder";
import { useTranscriptions } from "../hooks/useTranscriptions";
import { Navbar } from "../components/organisms/Navbar";
import { RecordingStudio } from "../components/organisms/RecordingStudio";
import { HistorySidebar } from "../components/organisms/HistorySidebar";

export default function HomePage() {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  const recorder = useRecorder(setError);
  const store = useTranscriptions(setError);

  const handleSave = async () => {
    if (!recorder.liveText.trim()) return;
    const ok = await store.create(title, recorder.liveText, recorder.getDuration());
    if (ok) {
      setTitle("");
      recorder.reset();
    }
  };

  return (
    <div className="min-h-screen bg-studio-grid text-zinc-100 selection:bg-indigo-500/30">
      <Navbar isRecording={recorder.isRecording} status={recorder.status} elapsed={recorder.elapsed} />

      <main className="mx-auto max-w-6xl px-5 py-6 lg:py-8">
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-rose-500/30 bg-rose-950/40 px-4 py-2.5 text-sm text-rose-200">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-xs font-medium text-rose-300 hover:text-white cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <RecordingStudio
              title={title}
              liveText={recorder.liveText}
              isRecording={recorder.isRecording}
              saving={store.saving}
              onTitleChange={setTitle}
              onTextChange={recorder.setLiveText}
              onStart={recorder.startRecording}
              onStop={recorder.stopRecording}
              onSave={handleSave}
              onClear={() => { setTitle(""); recorder.reset(); }}
            />
          </div>

          <aside className="lg:col-span-5">
            <HistorySidebar
              history={store.history}
              loading={store.loading}
              search={store.search}
              onSearchChange={store.setSearch}
              onSearchSubmit={(e) => { e.preventDefault(); store.load(store.search); }}
              onUpdate={store.update}
              onDelete={store.remove}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}