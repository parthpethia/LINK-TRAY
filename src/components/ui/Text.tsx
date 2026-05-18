import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type TextProps = {
  children: ReactNode;
  className?: string;
  variant?: "body" | "muted";
};

export function Text({ children, className, variant = "body" }: TextProps) {
  return (
    <p
      className={cn(
        "text-sm leading-relaxed",
        variant === "muted" ? "text-ink-muted" : "text-ink",
        className,
      )}
    >
      {children}
    </p>
  );
}
