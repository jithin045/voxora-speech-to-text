import { StatusBadge } from "../atoms/StatusBadge";

interface Props {
  isRecording: boolean;
  status: string;
  elapsed: number;
}

export function Navbar({ isRecording, status, elapsed }: Props) {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-[#07070A]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/20">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
              />
            </svg>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-base font-bold tracking-tight text-white">Voxora</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-medium text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              Multilingual AI
            </span>
          </div>
        </div>

        <StatusBadge isRecording={isRecording} status={status} elapsed={elapsed} />
      </div>
    </header>
  );
}