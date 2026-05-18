import { invoke } from "@tauri-apps/api/core";
import type { Link } from "@/lib/database/types";

export type SearchLinksOptions = {
  limit?: number;
};

export async function searchLinks(
  query: string,
  options?: SearchLinksOptions,
): Promise<Link[]> {
  return invoke<Link[]>("search_links", {
    query,
    limit: options?.limit,
  });
}
