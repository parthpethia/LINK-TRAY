import { Page } from "@/components/layout/Page";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export function Home() {
  return (
    <Page>
      <div className="flex flex-col items-center text-center">
        <span
          className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-surface-raised text-sm font-semibold text-accent ring-1 ring-zinc-800/60 dark:ring-zinc-700/60"
          aria-hidden
        >
          LT
        </span>
        <Heading>Link Tray</Heading>
        <Text variant="muted" className="mt-3 max-w-xs">
          Your links, one tray away.
        </Text>
      </div>
    </Page>
  );
}
