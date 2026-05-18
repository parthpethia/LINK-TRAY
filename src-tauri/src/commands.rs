use crate::db::{Database, Link, LinkInput};
use tauri::State;

#[tauri::command]
pub fn save_link(state: State<'_, Database>, input: LinkInput) -> Result<Link, String> {
    state.save_link(input)
}

#[tauri::command]
pub fn get_links(state: State<'_, Database>) -> Result<Vec<Link>, String> {
    state.get_links()
}

#[tauri::command]
pub fn search_links(
    state: State<'_, Database>,
    query: String,
    limit: Option<u32>,
) -> Result<Vec<Link>, String> {
    state.search_links(&query, limit)
}

#[tauri::command]
pub fn delete_link(state: State<'_, Database>, id: i64) -> Result<(), String> {
    state.delete_link(id)
}
