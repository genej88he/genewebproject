# 🥭 Mango Seed Study Tool

A visual workspace for organizing your study materials with drag-and-drop documents and notebooks.

## Features

- **Visual Workspace**: Drag and drop your documents on an infinite canvas
- **Two Document Types**:
  - Text Doc: Clean writing interface for essays and reports
  - Notebook: Note-taking interface for lecture notes
- **Auto-Save**: All changes are automatically saved to local storage
- **Desktop App**: Run as a native desktop application with Electron

## Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/genej88he/genewebproject.git
cd genewebproject
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Set up Firebase:
   - Copy `.env.example` to `.env`
   - Fill in your Firebase credentials from [Firebase Console](https://console.firebase.google.com/)

## Running the App

### Web Version (Development)
```bash
npm start
```
Opens the app at http://localhost:3000/workspace

### Electron Desktop App (Development)
```bash
npm run electron-dev
```
This will:
1. Start the React development server
2. Wait for it to be ready
3. Open the Electron desktop app

### Production Build

**Web Build:**
```bash
npm run build
```

**Desktop App Package:**
```bash
npm run electron-pack    # Creates unpacked app in /dist
npm run electron-dist    # Creates installers (.dmg, .exe, etc.)
```

## Project Structure
```
genewebproject/
├── public/
│   ├── main.js           # Electron main process
│   └── index.html        # HTML template
├── src/
│   ├── Views/
│   │   ├── HomePage.js   # Landing page
│   │   ├── Workspace.js  # Main canvas workspace
│   │   ├── Textdoc.js    # Text document editor
│   │   └── Notepage.js   # Notebook editor
│   ├── App.js            # Main React component
│   ├── firebase.js       # Firebase configuration
│   └── index.js          # Entry point
├── package.json
└── README.md
```

## Available Scripts

- `npm start` - Run web app in development mode
- `npm run build` - Build web app for production
- `npm test` - Run tests
- `npm run electron-dev` - Run Electron desktop app in development
- `npm run electron-pack` - Package desktop app (no installer)
- `npm run electron-dist` - Create desktop app installers

## Technologies Used

- **React** (v19) - UI framework
- **React Router** - Navigation
- **Konva/React-Konva** - Canvas graphics for workspace
- **Electron** - Desktop app wrapper
- **Firebase** - Backend (configured, ready to use)
- **LocalStorage** - Client-side data persistence

## Git Workflow

After making changes:
```bash
git add .
git commit -m "Your commit message"
git push origin study-tool    # Push to study-tool branch
```

Or merge into main:
```bash
git checkout main
git merge study-tool
git push origin main
```

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Dependencies issues:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Electron won't start:**
Make sure the React dev server is running first (`npm start`), then in another terminal run `npm run electron-dev`

## Future Enhancements

- [ ] Cloud sync with Firebase
- [ ] User authentication
- [ ] Collaborative editing
- [ ] Mobile app version
- [ ] Export to PDF
- [ ] Rich text formatting
- [ ] Image uploads

## License

MIT

## Author

Gene Jiang