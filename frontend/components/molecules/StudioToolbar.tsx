import { Button } from "../atoms/Button";

interface Props {
  isRecording: boolean;
  canSave: boolean;
  canClear: boolean;
  saving: boolean;
  onStart: () => void;
  onStop: () => void;
  onSave: () => void;
  onClear: () => void;
}

export function StudioToolbar({
  isRecording,
  canSave,
  canClear,
  saving,
  onStart,
  onStop,
  onSave,
  onClear,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 bg-zinc-900/70 px-5 py-3.5">
      <div className="flex items-center gap-2.5">
        {!isRecording ? (
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-400 hover:to-cyan-400 transition cursor-pointer"
          >
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3zm5-3a1 1 0 10-2 0 3 3 0 01-6 0 1 1 0 10-2 0 5 5 0 004 4.9V19H9a1 1 0 100 2h6a1 1 0 100-2h-2v-3.1A5 5 0 0017 11z" />
            </svg>
            Start Recording
          </button>
        ) : (
          <button
            onClick={onStop}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-600/25 hover:bg-rose-500 transition cursor-pointer"
          >
            <span className="h-2.5 w-2.5 rounded-xs bg-white" />
            Stop Recording
          </button>
        )}

        <Button variant="secondary" onClick={onSave} disabled={!canSave || saving} className="border-zinc-700/80 bg-zinc-800/80 text-white hover:bg-zinc-700">
          {saving ? "Saving..." : "Save Transcript"}
        </Button>
      </div>

      {isRecording ? (
        <div className="flex items-center gap-2 rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-1">
          <div className="flex items-end gap-0.5 h-3.5" aria-label="Recording active">
            <span className="w-0.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
            <span className="w-0.5 h-3.5 bg-rose-500 rounded-full animate-pulse [animation-delay:150ms]" />
            <span className="w-0.5 h-2.5 bg-rose-400 rounded-full animate-pulse [animation-delay:300ms]" />
            <span className="w-0.5 h-3.5 bg-rose-500 rounded-full animate-pulse [animation-delay:450ms]" />
          </div>
          <span className="text-[11px] font-medium text-rose-300">Live</span>
        </div>
      ) : (
        <Button variant="ghost" onClick={onClear} disabled={!canClear} className="px-2.5 py-1.5">
          Clear
        </Button>
      )}
    </div>
  );
}