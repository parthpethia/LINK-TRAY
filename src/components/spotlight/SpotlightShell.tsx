import type { ReactNode } from "react";

type SpotlightShellProps = {
  children: ReactNode;
};

export function SpotlightShell({ children }: SpotlightShellProps) {
  return (
    <div className="flex min-h-screen items-start justify-center bg-transparent px-4 pt-[18vh]">
      <div
        className="w-full max-w-xl rounded-2xl border border-white/10 bg-zinc-900/95 px-4 py-3 shadow-2xl shadow-black/50 ring-1 ring-white/5 backdrop-blur-md"
        role="search"
      >
        {children}
      </div>
    </div>
  );
}
