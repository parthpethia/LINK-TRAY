import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type HeadingProps = {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2";
};

export function Heading({ children, className, as: Tag = "h1" }: HeadingProps) {
  return (
    <Tag
      className={cn(
        "font-semibold tracking-tight text-ink",
        Tag === "h1" ? "text-3xl" : "text-xl",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
