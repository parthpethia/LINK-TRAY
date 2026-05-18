import { invoke } from "@tauri-apps/api/core";
import type { Link, LinkInput } from "./types";

export async function saveLink(input: LinkInput): Promise<Link> {
  return invoke<Link>("save_link", { input });
}

export async function getLinks(): Promise<Link[]> {
  return invoke<Link[]>("get_links");
}

export async function deleteLink(id: number): Promise<void> {
  return invoke("delete_link", { id });
}
