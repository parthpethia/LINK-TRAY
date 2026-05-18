import { useCallback, useEffect, useRef } from "react";
import { hideMainWindow, SPOTLIGHT_OPEN_EVENT } from "@/lib/mainWindow";
import { inTauriRuntime } from "@/lib/tauri";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function SpotlightSearch() {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = useCallback(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }
    input.focus();
    input.select();
  }, []);

  useEffect(() => {
    focusInput();

    const onOpen = () => focusInput();
    window.addEventListener(SPOTLIGHT_OPEN_EVENT, onOpen);

    let unlistenFocus: (() => void) | undefined;
    if (inTauriRuntime()) {
      void getCurrentWindow()
        .onFocusChanged(({ payload: focused }) => {
          if (focused) {
            focusInput();
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
  }, [focusInput]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      void hideMainWindow();
    }
  };

  return (
    <input
      ref={inputRef}
      type="search"
      name="spotlight"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      placeholder="Search links…"
      aria-label="Search links"
      className="w-full bg-transparent text-lg text-zinc-100 placeholder:text-zinc-500 outline-none ring-0"
      onKeyDown={onKeyDown}
    />
  );
}
