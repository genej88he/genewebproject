import React, { useState, useEffect } from 'react'; // Fixes Line 9
import './App.css';
import HomePage from './Views/HomePage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Workspace from './Views/Workspace';
import Notepage from './Views/Notepage';
import Textdoc from './Views/Textdoc';
import Pricing from './Views/Pricing';
function App() {
  const [seeds, setSeeds] = useState(() => {
    const savedSeeds = localStorage.getItem('mango-seeds');
    return savedSeeds ? JSON.parse(savedSeeds) : [
      { id: '1', x: 200, y: 200, text: 'Lecture Notes', content: '' }
    ];
  });

  // 2. Automatically save to LocalStorage whenever 'seeds' changes
  useEffect(() => {
    localStorage.setItem('mango-seeds', JSON.stringify(seeds));
  }, [seeds]);


  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={<HomePage />} 
          />
          
          <Route
            path="/pricing"
            element={<Pricing/>}
          />
          <Route 
            path="/workspace" 
            element={<Workspace seeds ={seeds} setSeeds={setSeeds}/>} 
          />


          {/* The Note Editor Subpage */}
          <Route 
            path="/note/:seedId" 
            element={<Notepage seeds={seeds} setSeeds={setSeeds} />} 
          />

          <Route
            path="/doc/:seedId"
            element={<Textdoc seeds={seeds} setSeeds={setSeeds} />}
          />
          
          
        </Routes>
      </div>

    </Router>
    
  );
}
export default App;
