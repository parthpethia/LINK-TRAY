import { Home } from "@/components/Home";
import { useAppInit } from "@/hooks/useAppInit";

export function App() {
  useAppInit();

  return <Home />;
}
