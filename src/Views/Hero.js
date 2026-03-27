import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Study Smarter with <span className="highlight">Mango Seed</span>
        </h1>
        <p className="hero-subtitle">
          Your visual workspace for organizing lecture notes, documents, and study materials.
          Drag, drop, and never lose track of your files again.
        </p>
        <div className="hero-buttons">
          <button 
            className="cta-primary"
            onClick={() => navigate('/download')}
          >
            Try Mango Seed for Free
          </button>
          <button className="cta-secondary">
            Watch Demo
          </button>
        </div>
        <p className="hero-note">
          Available for macOS, Windows, and Linux
        </p>
      </div>
      
      <div className="hero-image">
        <div className="mockup-placeholder">
          <div className="workspace-preview">
            🥭 Workspace Preview
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;