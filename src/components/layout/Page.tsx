import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PageProps = {
  children: ReactNode;
  className?: string;
  centered?: boolean;
};

export function Page({ children, className, centered = true }: PageProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col px-6 py-8",
        centered && "items-center justify-center",
        className,
      )}
    >
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
