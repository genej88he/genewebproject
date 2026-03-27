const { contextBridge, ipcRenderer } = require('electron');

// 👇 add this right here
const ALLOWED_CHANNELS = [
  'get-all-notes',
  'create-note',
  'update-note',
  'delete-note',
  'get-stats',
  'secure-streak',
  'generate-test',
];

function safeInvoke(channel, ...args) {
  if (!ALLOWED_CHANNELS.includes(channel)) {  // 👈 this is the only extra thing
    return Promise.reject(new Error(`Channel "${channel}" is not allowed`))
  }
  return ipcRenderer.invoke(channel, ...args)  // same as before
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
      ...(updates.title !== undefined && { title: sanitizeString(updates.title, 500) || 'Untitled'}),
      ...(updates.content !== undefined && { content: sanitizeString(updates.content, 100000) }),
    }
    return safeInvoke('update-note', id, sanitizedUpdates)
  },

  deleteNote: (id) => safeInvoke('delete-note', id),
  getStats: () => safeInvoke('get-stats'),
  secureStreak: () => safeInvoke('secure-streak'),

  generateTest: (options) => {
    if (!options || typeof options.prompt !== 'string') {
      return Promise.reject(new Error('generateTest: prompt must be a string'))
    }
    return safeInvoke('generate-test', {
      prompt: sanitizeString(options.prompt, 10000) // cap prompt at 10K chars
    })
  },
});