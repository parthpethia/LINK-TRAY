import { Home } from "@/components/Home";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAppInit } from "@/hooks/useAppInit";

export function App() {
  useAppInit();

  return (
    <AppLayout>
      <Home />
    </AppLayout>
  );
}
