import React, { useState, useEffect } from 'react'; // Fixes Line 9
import './App.css';
import HomePage from './Views/HomePage';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Workspace from './Views/Workspace';
import Notepage from './Views/Notepage';
import Textdoc from './Views/Textdoc';
import Pricing from './Views/Pricing';
import Download from './Views/Download';
import TestGenerator from './Views/TestGenerator';


function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);


  const [seeds, setSeeds] = useState([]);

  // Load notes from database when app starts
  useEffect(() => {
  async function loadNotes() {
    if (window.electronAPI) {
      const notes = await window.electronAPI.getAllNotes();
      console.log('Loaded notes:', notes);  // ADD THIS LINE
      setSeeds(notes);
    }
  }
  loadNotes();
}, []);

  const isElectron = window.navigator.userAgent.includes('Electron');

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* WEB-ONLY ROUTES (Marketing Site) */}
          {!isElectron && (
            <>
              <Route path="/" element={<HomePage />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/download" element={<Download />} />

              <Route path="/workspace" element={<Navigate to="/download" replace />} />
              <Route path="/note/:seedId" element={<Navigate to="/download" replace />} />
              <Route path="/doc/:seedId" element={<Navigate to="/download" replace />} />
            </>
          )}

          {isElectron && (
            <>
              <Route path="/" element={<Workspace seeds={seeds} setSeeds={setSeeds} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}/>} />
              <Route 
                path="/workspace" 
                element={<Workspace seeds={seeds} setSeeds={setSeeds} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}/>} 
              />
              <Route 
                path="/note/:seedId" 
                element={<Notepage seeds={seeds} setSeeds={setSeeds} />} 
              />
              <Route
                path="/doc/:seedId"
                element={<Textdoc seeds={seeds} setSeeds={setSeeds} />}
              />
              <Route 
                path="/test-generator" 
                element={<TestGenerator isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} seeds={seeds} />} 
              />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}
export default App;
