
interface Props {
  isRecording: boolean;
  status: string;
  elapsed: number;
}

const formatTime = (s: number) =>
  [Math.floor(s / 60), s % 60]
    .map((v) => String(v).padStart(2, "0"))
    .join(":");

export function StatusBadge({ isRecording, status, elapsed }: Props) {
  const color = isRecording
    ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
    : "border-zinc-800 bg-zinc-900 text-zinc-400";

  return (
    <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${color}`}>
      <span
        className={`h-2 w-2 rounded-full ${
          isRecording ? "bg-rose-500 animate-pulse" : "bg-emerald-500"
        }`}
      />
      <span>{status}</span>
      {isRecording && (
        <span className="ml-0.5 font-mono text-rose-200">
          {formatTime(elapsed)}
        </span>
      )}
    </div>
  );
}
