const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

const dbPath = path.join(app.getPath('userData'), 'mango-seed.db');
const db = new Database(dbPath);

db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      type TEXT NOT NULL,
      folder_id TEXT,
      created_at INTEGER NOT NULL
    );
  `);

  function getAllNotes() {
    const stmt = db.prepare('SELECT * FROM notes ORDER BY `created_at` DESC');
    const rows = stmt.all();
    
    return rows.map(row => ({
        id: row.id,
        text: row.title,
        content: row.content,
        type: row.type,
        folderId: row.folder_id || null,  // Force null instead of undefined
        createdAt: row.created_at
    }));
  }


function createNote(note) {
    const stmt = db.prepare(`
        INSERT INTO notes (id, title, content, type, folder_id, \`created_at\`)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
    return stmt.run(
        note.id,
        note.text || note.title,
        note.content || '',
        note.type,
        note.folderId || note.folder_id,
        note.createdAt || Date.now()
    );
}

function updateNote(id, updates) {
    const stmt = db.prepare(`
      UPDATE notes 
      SET title = ?, content = ?
      WHERE id = ?
    `);
    
    return stmt.run(updates.text || updates.title, updates.content, id);
}

function deleteNote(id) {
    const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
    return stmt.run(id);
}

module.exports = {
    getAllNotes,
    createNote,
    updateNote,
    deleteNote
};