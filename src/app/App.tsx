import { SpotlightSearch, SpotlightShell } from "@/components/spotlight";
import { useAppInit } from "@/hooks/useAppInit";
import { useEffect } from "react";

export function App() {
  useAppInit();

  useEffect(() => {
    document.documentElement.classList.add("dark", "spotlight");
    return () => {
      document.documentElement.classList.remove("dark", "spotlight");
    };
  }, []);

  return (
    <SpotlightShell>
      <SpotlightSearch />
    </SpotlightShell>
  );
}
