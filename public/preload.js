const { contextBridge, ipcRenderer } = require('electron');

const ALLOWED_CHANNELS = [
  'get-all-notes',
  'create-note',
  'update-note',
  'delete-note',
  'get-stats',
  'secure-streak',
  'generate-test',
  'get-daily-sessions',
];

function safeInvoke(channel, ...args) {
  if (!ALLOWED_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel "${channel}" is not allowed`))
  }
  return ipcRenderer.invoke(channel, ...args)
}

function sanitizeString(value, maxLength = 100000) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

contextBridge.exposeInMainWorld('electronAPI', {
  getAllNotes: () => safeInvoke('get-all-notes'),

  createNote: (note) => {
    const sanitizedNote = {
      ...note,
      title: sanitizeString(note.title, 500),
      content: sanitizeString(note.content, 100000),
    }
    return safeInvoke('create-note', sanitizedNote)
  },

  updateNote: (id, updates) => {
    const sanitizedUpdates = {
      ...(updates.title !== undefined && { title: sanitizeString(updates.title, 500) || 'Untitled' }),
      ...(updates.content !== undefined && { content: sanitizeString(updates.content, 100000) }),
    }
    return safeInvoke('update-note', id, sanitizedUpdates)
  },

  deleteNote: (id) => safeInvoke('delete-note', id),
  getStats: () => safeInvoke('get-stats'),
  secureStreak: (accumulatedMs) => safeInvoke('secure-streak', accumulatedMs),
  getDailySessions: () => safeInvoke('get-daily-sessions'),

  generateTest: (options) => {
    if (!options || typeof options.prompt !== 'string') {
      return Promise.reject(new Error('generateTest: prompt must be a string'))
    }
    return safeInvoke('generate-test', {
      prompt: sanitizeString(options.prompt, 10000)
    })
  },
});