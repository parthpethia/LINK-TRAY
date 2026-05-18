import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type AppLayoutProps = {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
};

export function AppLayout({ children, header, className }: AppLayoutProps) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-surface", className)}>
      {header ? (
        <header className="shrink-0 border-b border-zinc-800/80 px-6 py-3 dark:border-zinc-800/80">
          {header}
        </header>
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
