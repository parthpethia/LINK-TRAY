use rusqlite::{params, Connection, OptionalExtension, Row};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Link {
    pub id: i64,
    pub title: String,
    pub url: String,
    pub favicon: Option<String>,
    pub tags: Vec<String>,
    pub source: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LinkInput {
    pub id: Option<i64>,
    pub title: String,
    pub url: String,
    pub favicon: Option<String>,
    pub tags: Option<Vec<String>>,
    pub source: Option<String>,
}

fn now_millis() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

fn tags_to_json(tags: &[String]) -> String {
    serde_json::to_string(tags).unwrap_or_else(|_| "[]".to_string())
}

fn tags_from_json(raw: &str) -> Vec<String> {
    serde_json::from_str(raw).unwrap_or_default()
}

fn row_to_link(row: &Row<'_>) -> Result<Link, rusqlite::Error> {
    let tags_raw: String = row.get(5)?;
    Ok(Link {
        id: row.get(0)?,
        title: row.get(1)?,
        url: row.get(2)?,
        favicon: row.get(3)?,
        tags: tags_from_json(&tags_raw),
        source: row.get(4)?,
        created_at: row.get(6)?,
        updated_at: row.get(7)?,
    })
}

const SELECT_LINKS: &str = r#"
SELECT id, title, url, favicon, source, tags, created_at, updated_at
FROM links
"#;

pub fn save_link(conn: &Connection, input: LinkInput) -> Result<Link, String> {
    let tags = input.tags.unwrap_or_default();
    let tags_json = tags_to_json(&tags);
    let now = now_millis();

    if let Some(id) = input.id {
        let updated = conn
            .execute(
                r#"
                UPDATE links
                SET title = ?1, url = ?2, favicon = ?3, source = ?4, tags = ?5, updated_at = ?6
                WHERE id = ?7
                "#,
                params![
                    input.title,
                    input.url,
                    input.favicon,
                    input.source,
                    tags_json,
                    now,
                    id
                ],
            )
            .map_err(|e| e.to_string())?;

        if updated == 0 {
            return Err(format!("link not found: {id}"));
        }

        get_link_by_id(conn, id)
    } else {
        conn.execute(
            r#"
            INSERT INTO links (title, url, favicon, source, tags, created_at, updated_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
            "#,
            params![
                input.title,
                input.url,
                input.favicon,
                input.source,
                tags_json,
                now,
                now
            ],
        )
        .map_err(|e| e.to_string())?;

        let id = conn.last_insert_rowid();
        get_link_by_id(conn, id)
    }
}

fn get_link_by_id(conn: &Connection, id: i64) -> Result<Link, String> {
    let sql = format!("{SELECT_LINKS} WHERE id = ?1");
    conn.query_row(&sql, params![id], row_to_link)
        .optional()
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("link not found: {id}"))
}

pub fn get_links(conn: &Connection) -> Result<Vec<Link>, String> {
    let sql = format!("{SELECT_LINKS} ORDER BY updated_at DESC");
    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let links = stmt
        .query_map([], row_to_link)
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    Ok(links)
}

pub fn search_links(conn: &Connection, query: &str, limit: Option<u32>) -> Result<Vec<Link>, String> {
    let trimmed = query.trim();
    if trimmed.is_empty() {
        return get_links(conn);
    }

    let fts_query = build_fts_query(trimmed);
    let max_rows = limit.unwrap_or(50).min(200) as i64;

    let sql = format!(
        r#"
        SELECT l.id, l.title, l.url, l.favicon, l.source, l.tags, l.created_at, l.updated_at
        FROM links l
        INNER JOIN links_fts fts ON fts.rowid = l.id
        WHERE fts MATCH ?1
        ORDER BY bm25(fts)
        LIMIT ?2
        "#
    );

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let links = stmt
        .query_map(params![fts_query, max_rows], row_to_link)
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    Ok(links)
}

pub fn delete_link(conn: &Connection, id: i64) -> Result<(), String> {
    let deleted = conn
        .execute("DELETE FROM links WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    if deleted == 0 {
        return Err(format!("link not found: {id}"));
    }
    Ok(())
}

fn build_fts_query(user_query: &str) -> String {
    user_query
        .split_whitespace()
        .filter(|term| !term.is_empty())
        .map(|term| {
            let escaped = term.replace('"', "\"\"");
            format!("\"{escaped}\"*")
        })
        .collect::<Vec<_>>()
        .join(" OR ")
}
