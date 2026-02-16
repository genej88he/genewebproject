import React from 'react';
import './Download.css';
import Header from './Header';

const Download = () => {
  return (
    <div className="download-page">
      <Header />
      
      <div className="download-container">
        <h1>Download Mango Seed</h1>
        <p className="subtitle">Choose your operating system to get started</p>

        <div className="download-options">
          {/* macOS */}
          <div className="download-card">
            <div className="os-icon">🍎</div>
            <h2>macOS</h2>
            <p>For Mac computers</p>
            <button className="download-btn mac">
              Download for Mac
              <span className="file-info">.dmg file</span>
            </button>
          </div>

          {/* Windows */}
          <div className="download-card">
            <div className="os-icon">🪟</div>
            <h2>Windows</h2>
            <p>For Windows PC</p>
            <button className="download-btn windows">
              Download for Windows
              <span className="file-info">.exe installer</span>
            </button>
          </div>

          {/* Linux */}
          <div className="download-card">
            <div className="os-icon">🐧</div>
            <h2>Linux</h2>
            <p>For Linux distributions</p>
            <button className="download-btn linux">
              Download for Linux
              <span className="file-info">.AppImage file</span>
            </button>
          </div>
        </div>

        <div className="system-requirements">
          <h3>System Requirements</h3>
          <ul>
            <li>macOS 10.13 or later</li>
            <li>Windows 10 or later</li>
            <li>Linux (64-bit)</li>
            <li>200 MB free disk space</li>
          </ul>
        </div>

        <div className="help-section">
          <p>Need help installing? <a href="#installation-guide">View installation guide</a></p>
        </div>
      </div>
    </div>
  );
};

export default Download;