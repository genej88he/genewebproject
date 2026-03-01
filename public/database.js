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

  db.exec(`
      CREATE TABLE IF NOT EXISTS stats (
      id TEXT PRIMARY KEY,
      last_opened INTEGER,
      session_start INTEGER,
      streak INTEGER DEFAULT 0,
      total_days INTEGER DEFAULT 0
    );
  `)

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

function getStats() {
  const row = db.prepare('SELECT * FROM stats WHERE id = 1').get();
  const noteCount = db.prepare("SELECT COUNT(*) as count FROM notes WHERE type != 'folder'").get();
  return {
      streak: row?.streak || 0,
      totalDays: row?.total_days || 0,
      noteCount: noteCount.count,
      sessionStart: row?.session_start || null
  };
}

function startSession() {
  const now = Date.now();
  const today = new Date().setHours(0, 0, 0, 0);   
  const row = db.prepare('SELECT * FROM stats WHERE id = 1').get();
  if (!row) {
      db.prepare('INSERT INTO stats (id, last_opened, session_start, streak, total_days) VALUES (1, ?, ?, 0, 0)').run(now, now);
  } else {
    const lastSessionDate = row.session_start ? new Date(row.session_start).setHours(0, 0, 0, 0) : null;
        
    if (lastSessionDate === today) {
        // Same day — don't reset, keep existing session_start so timer resumes
        return;
    } else {
        // New day — start fresh session
        db.prepare('UPDATE stats SET session_start = ? WHERE id = 1').run(now);
    }
  }
}

function endSession() {
  const now = Date.now();
  const today = new Date().setHours(0, 0, 0, 0);
  const yesterday = today - 86400000;

  const row = db.prepare('SELECT * FROM stats WHERE id = 1').get();
  if (!row) return;

  const sessionDuration = now - row.session_start;
  const thirtyMinutes = 30 * 60 * 1000;

  if (sessionDuration < thirtyMinutes) return;

  const lastOpened = new Date(row.last_opened).setHours(0, 0, 0, 0);

  if (lastOpened === today) {
      return;
  } else if (lastOpened === yesterday) {
      db.prepare('UPDATE stats SET last_opened = ?, streak = ?, total_days = ? WHERE id = 1')
          .run(now, row.streak + 1, row.total_days + 1);
  } else {
      db.prepare('UPDATE stats SET last_opened = ?, streak = 1, total_days = ? WHERE id = 1')
          .run(now, row.total_days + 1);
  }
}

function secureStreak() {
  const now = Date.now();
  const today = new Date().setHours(0, 0, 0, 0);
  const yesterday = today - 86400000;

  const row = db.prepare('SELECT * FROM stats WHERE id = 1').get();
  if (!row) return;

  const lastOpened = new Date(row.last_opened).setHours(0, 0, 0, 0);

  if (lastOpened === today) {
      return; // already counted today
  } else if (lastOpened === yesterday) {
      db.prepare('UPDATE stats SET last_opened = ?, streak = ?, total_days = ? WHERE id = 1')
          .run(now, row.streak + 1, row.total_days + 1);
  } else {
      db.prepare('UPDATE stats SET last_opened = ?, streak = 1, total_days = ? WHERE id = 1')
          .run(now, row.total_days + 1);
  }
}

module.exports = {
    getAllNotes,
    createNote,
    updateNote,
    deleteNote,
    getStats,
    startSession,
    endSession,
    secureStreak
};