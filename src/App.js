import React from 'react';
import './App.css';
import HomePage from './Views/HomePage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Workspace from './Views/Workspace';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/workspace" element={<Workspace />} />
        </Routes>
      </div>

    </Router>
    
  );
}
export default App;
