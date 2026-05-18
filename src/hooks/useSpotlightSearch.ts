import { useEffect, useState } from "react";
import type { Link } from "@/lib/database/types";
import { searchLinks } from "@/lib/search";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const DEFAULT_DEBOUNCE_MS = 180;
const DEFAULT_LIMIT = 24;

export function useSpotlightSearch(query: string, debounceMs = DEFAULT_DEBOUNCE_MS) {
  const debouncedQuery = useDebouncedValue(query, debounceMs);
  const [results, setResults] = useState<Link[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void searchLinks(trimmed, { limit: DEFAULT_LIMIT })
      .then((links) => {
        if (!cancelled) {
          setResults(links);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResults([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  return { results, loading, debouncedQuery };
}
