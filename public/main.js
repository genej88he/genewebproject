const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // During development, it loads your localhost. 
  // When you "build" it, it will load your index.html file.
  win.loadURL('http://localhost:3000/workspace'); 
}

app.whenReady().then(createWindow);