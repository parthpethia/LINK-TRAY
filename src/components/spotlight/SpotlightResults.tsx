import { useEffect, useRef } from "react";
import type { Link } from "@/lib/database/types";
import { SpotlightResultItem } from "./SpotlightResultItem";

type SpotlightResultsProps = {
  results: Link[];
  selectedIndex: number;
  loading: boolean;
  query: string;
  onSelectIndex: (index: number) => void;
};

export function SpotlightResults({
  results,
  selectedIndex,
  loading,
  query,
  onSelectIndex,
}: SpotlightResultsProps) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list || selectedIndex < 0) {
      return;
    }
    const item = list.children[selectedIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex, results]);

  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }

  if (loading && results.length === 0) {
    return (
      <p className="px-2 py-2 text-xs text-zinc-500" role="status">
        Searching…
      </p>
    );
  }

  if (results.length === 0) {
    return (
      <p className="px-2 py-2 text-xs text-zinc-500" role="status">
        No links found
      </p>
    );
  }

  return (
    <ul
      ref={listRef}
      role="listbox"
      aria-label="Search results"
      aria-activedescendant="spotlight-active-option"
      className="max-h-[min(50vh,320px)] overflow-y-auto overscroll-contain border-t border-white/5 py-1"
    >
      {results.map((link, index) => (
        <SpotlightResultItem
          key={link.id}
          link={link}
          selected={index === selectedIndex}
          active={index === selectedIndex}
          onSelect={() => onSelectIndex(index)}
        />
      ))}
    </ul>
  );
}
