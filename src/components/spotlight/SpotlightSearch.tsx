import { useCallback, useEffect, useRef, useState } from "react";
import { hideMainWindow, SPOTLIGHT_OPEN_EVENT } from "@/lib/mainWindow";
import { openLinkInBrowser } from "@/lib/spotlight";
import { inTauriRuntime } from "@/lib/tauri";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useSpotlightSearch } from "@/hooks/useSpotlightSearch";
import { SpotlightResults } from "./SpotlightResults";

function clampIndex(index: number, length: number): number {
  if (length <= 0) {
    return -1;
  }
  return Math.max(0, Math.min(index, length - 1));
}

export function SpotlightSearch() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { results, loading } = useSpotlightSearch(query);

  const focusInput = useCallback(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }
    input.focus();
    input.select();
  }, []);

  const resetSpotlight = useCallback(() => {
    setQuery("");
    setSelectedIndex(-1);
  }, []);

  useEffect(() => {
    focusInput();

    const onOpen = () => {
      resetSpotlight();
      focusInput();
    };
    window.addEventListener(SPOTLIGHT_OPEN_EVENT, onOpen);

    let unlistenFocus: (() => void) | undefined;
    if (inTauriRuntime()) {
      void getCurrentWindow()
        .onFocusChanged(({ payload: focused }) => {
          if (focused) {
            onOpen();
          }
        })
        .then((unlisten) => {
          unlistenFocus = unlisten;
        });
    }

    return () => {
      window.removeEventListener(SPOTLIGHT_OPEN_EVENT, onOpen);
      unlistenFocus?.();
    };
  }, [focusInput, resetSpotlight]);

  useEffect(() => {
    if (results.length === 0) {
      setSelectedIndex(-1);
      return;
    }
    setSelectedIndex((prev) => clampIndex(prev < 0 ? 0 : prev, results.length));
  }, [results]);

  const openSelected = useCallback(async () => {
    const index = clampIndex(
      selectedIndex < 0 ? 0 : selectedIndex,
      results.length,
    );
    const link = results[index];
    if (!link) {
      return;
    }
    await openLinkInBrowser(link.url);
    resetSpotlight();
    await hideMainWindow();
  }, [results, selectedIndex, resetSpotlight]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      void hideMainWindow();
      return;
    }

    if (event.key === "ArrowDown") {
      if (results.length > 0) {
        event.preventDefault();
        setSelectedIndex((prev) =>
          clampIndex(prev < 0 ? 0 : prev + 1, results.length),
        );
      }
      return;
    }

    if (event.key === "ArrowUp") {
      if (results.length > 0) {
        event.preventDefault();
        setSelectedIndex((prev) =>
          clampIndex(prev < 0 ? results.length - 1 : prev - 1, results.length),
        );
      }
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      void openSelected();
    }
  };

  const hasPanel = query.trim().length > 0;

  return (
    <div className="flex flex-col">
      <input
        ref={inputRef}
        type="search"
        name="spotlight"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder="Search links…"
        aria-label="Search links"
        aria-controls="spotlight-results"
        aria-expanded={hasPanel}
        className="w-full bg-transparent text-lg text-zinc-100 placeholder:text-zinc-500 outline-none ring-0"
        onKeyDown={onKeyDown}
      />
      <div id="spotlight-results">
        <SpotlightResults
          results={results}
          selectedIndex={selectedIndex}
          loading={loading}
          query={query}
          onSelectIndex={setSelectedIndex}
        />
      </div>
    </div>
  );
}
