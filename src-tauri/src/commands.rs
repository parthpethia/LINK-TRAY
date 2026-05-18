use crate::db::{normalize_link_input, validate_link_input, Database, Link, LinkInput};
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub fn save_link(state: State<'_, Arc<Database>>, input: LinkInput) -> Result<Link, String> {
    let input = normalize_link_input(input);
    validate_link_input(&input)?;
    state.save_link(input)
}

#[tauri::command]
pub fn get_links(state: State<'_, Arc<Database>>) -> Result<Vec<Link>, String> {
    state.get_links()
}

#[tauri::command]
pub fn search_links(
    state: State<'_, Arc<Database>>,
    query: String,
    limit: Option<u32>,
) -> Result<Vec<Link>, String> {
    state.search_links(&query, limit)
}

#[tauri::command]
pub fn delete_link(state: State<'_, Arc<Database>>, id: i64) -> Result<(), String> {
    state.delete_link(id)
}
