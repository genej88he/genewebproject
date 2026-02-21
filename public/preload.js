const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getAllNotes: () => ipcRenderer.invoke('get-all-notes'),
    createNote: (note) => ipcRenderer.invoke('create-note', note),
    updateNote: (id, updates) => ipcRenderer.invoke('update-note', id, updates),
    deleteNote: (id) => ipcRenderer.invoke('delete-note', id)
  });