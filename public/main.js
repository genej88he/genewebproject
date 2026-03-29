const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const db = require('./database');
require('dotenv').config();

function isValidNote(note) {
  return (
    note &&
    typeof note.id === 'string' &&
    typeof note.title === 'string' &&
    typeof note.type === 'string' &&
    typeof note.created_at === 'number'
  );
}

function isValidId(id) {
  return typeof id === 'string' && id.trim().length > 0;
}

function isValidUpdates(updates) {
  return (
    updates &&
    typeof updates === 'object' &&
    (updates.title === undefined || typeof updates.title === 'string') &&
    (updates.content === undefined || typeof updates.content === 'string')
  );
}

function createWindow() {
  db.startSession();

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true
    },
  });

  win.webContents.on('will-navigate', (event, url) => {
    const allowedOrigins = isDev
      ? ['http://localhost:3000']
      : [`file://${path.join(__dirname, '../build')}`];
    const isAllowed = allowedOrigins.some(origin => url.startsWith(origin));
    if (!isAllowed) event.preventDefault();
  });

  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  win.on('close', () => { db.endSession(); });

  win.loadURL(
    isDev
      ? 'http://localhost:3000/workspace'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );
}

ipcMain.handle('get-all-notes', async () => {
  return db.getAllNotes();
});

ipcMain.handle('create-note', async (event, note) => {
  if (!isValidNote(note)) return { success: false, error: 'Invalid note data' };
  db.createNote(note);
  return { success: true };
});

ipcMain.handle('update-note', async (event, id, updates) => {
  if (!isValidId(id) || !isValidUpdates(updates)) return { success: false, error: 'Invalid arguments' };
  db.updateNote(id, updates);
  return { success: true };
});

ipcMain.handle('delete-note', async (event, id) => {
  if (!isValidId(id)) return { success: false, error: 'Invalid id' };
  db.deleteNote(id);
  return { success: true };
});

ipcMain.handle('get-stats', async () => {
  return db.getStats();
});

ipcMain.handle('secure-streak', async (event, accumulatedMs) => {
  db.secureStreak(accumulatedMs);
  return { success: true };
});

ipcMain.handle('get-daily-sessions', async () => {
  return db.getDailySessions();
});

ipcMain.handle('generate-test', async (event, options) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { success: false, error: 'API key not configured' };
  if (!options || typeof options.prompt !== 'string') return { success: false, error: 'Invalid prompt' };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: options.prompt }] }] })
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error?.message || 'API request failed' };
    }
    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error('generate-test error:', err);
    return { success: false, error: 'Failed to generate test' };
  }
});

app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          "script-src 'self'; " +
          "connect-src 'self' https://generativelanguage.googleapis.com; " +
          "img-src 'self' data:; " +
          "style-src 'self' 'unsafe-inline'"
        ]
      }
    });
  });
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});