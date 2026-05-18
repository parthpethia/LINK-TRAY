mod links;
mod migrate;

use rusqlite::Connection;
use std::path::Path;
use std::sync::Mutex;

pub use links::{Link, LinkInput};

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    pub fn open(path: &Path) -> Result<Self, String> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }

        let conn = Connection::open(path).map_err(|e| e.to_string())?;
        migrate::run(&conn)?;
        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    pub fn save_link(&self, input: LinkInput) -> Result<Link, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        links::save_link(&conn, input)
    }

    pub fn get_links(&self) -> Result<Vec<Link>, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        links::get_links(&conn)
    }

    pub fn search_links(&self, query: &str, limit: Option<u32>) -> Result<Vec<Link>, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        links::search_links(&conn, query, limit)
    }

    pub fn delete_link(&self, id: i64) -> Result<(), String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        links::delete_link(&conn, id)
    }
}
