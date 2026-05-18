import type { Link } from "@/lib/database/types";
import { cn } from "@/lib/cn";

type SpotlightResultItemProps = {
  link: Link;
  selected: boolean;
  active: boolean;
  onSelect: () => void;
};

export function SpotlightResultItem({
  link,
  selected,
  active,
  onSelect,
}: SpotlightResultItemProps) {
  const tagsLabel =
    link.tags.length > 0 ? link.tags.slice(0, 3).join(" · ") : null;

  return (
    <li
      role="option"
      aria-selected={selected}
      id={active ? "spotlight-active-option" : undefined}
      className={cn(
        "flex cursor-default items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors",
        selected
          ? "bg-sky-500/15 text-zinc-50 ring-1 ring-sky-500/30"
          : "text-zinc-200 hover:bg-white/5",
      )}
      onMouseEnter={onSelect}
      onMouseDown={(e) => e.preventDefault()}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-zinc-800/80">
        {link.favicon ? (
          <img
            src={link.favicon}
            alt=""
            className="h-5 w-5 object-contain"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="text-xs font-medium text-zinc-500" aria-hidden>
            {link.title.charAt(0).toUpperCase() || "?"}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium leading-tight">
          {link.title || link.url}
        </span>
        <span className="block truncate text-xs text-zinc-500">{link.url}</span>
        {tagsLabel ? (
          <span className="mt-0.5 block truncate text-[11px] text-zinc-600">
            {tagsLabel}
          </span>
        ) : null}
      </span>
    </li>
  );
}
