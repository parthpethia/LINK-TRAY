use rusqlite::Connection;

const SCHEMA: &str = r#"
CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  favicon TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  source TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE VIRTUAL TABLE IF NOT EXISTS links_fts USING fts5(
  title,
  url,
  tags,
  tokenize = 'unicode61'
);

CREATE TRIGGER IF NOT EXISTS links_fts_ai AFTER INSERT ON links BEGIN
  INSERT INTO links_fts(rowid, title, url, tags)
  VALUES (new.id, new.title, new.url, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS links_fts_ad AFTER DELETE ON links BEGIN
  INSERT INTO links_fts(links_fts, rowid, title, url, tags)
  VALUES ('delete', old.id, old.title, old.url, old.tags);
END;

CREATE TRIGGER IF NOT EXISTS links_fts_au AFTER UPDATE ON links BEGIN
  INSERT INTO links_fts(links_fts, rowid, title, url, tags)
  VALUES ('delete', old.id, old.title, old.url, old.tags);
  INSERT INTO links_fts(rowid, title, url, tags)
  VALUES (new.id, new.title, new.url, new.tags);
END;
"#;

pub fn run(conn: &Connection) -> Result<(), String> {
    conn.execute_batch(SCHEMA)
        .map_err(|e| format!("database migration failed: {e}"))
}
