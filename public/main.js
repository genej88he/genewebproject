const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const db = require('./database');

function createWindow() {
  db.startSession();

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  win.on('close', () => {
    db.endSession(); // end session when app closes
  });

  // Load from localhost in development, build folder in production
  win.loadURL(
    isDev
      ? 'http://localhost:3000/workspace'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  // Open DevTools in development
//   if (isDev) {
//     win.webContents.openDevTools();
//   }
}

ipcMain.handle('get-all-notes', async () => {
  return db.getAllNotes();
});

ipcMain.handle('create-note', async (event, note) => {
  db.createNote(note);
  return { success: true };
});

ipcMain.handle('update-note', async (event, id, updates) => {
  db.updateNote(id, updates);
  return { success: true };
});

ipcMain.handle('delete-note', async (event, id) => {
  db.deleteNote(id);
  return { success: true };
});

ipcMain.handle('get-stats', async() => {
  return db.getStats();
})


app.whenReady().then(createWindow);

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Re-create window on macOS when clicking dock icon
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});