import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header-container">
      <div className="header-logo">
        <div className="logo-icon"></div>
        <span>Dreeliiio</span>
      </div>

      <nav className="header-nav">
        <a href="#features" className="nav-link">Features</a>
        <a href="#benefits" className="nav-link">Benefits</a>
        <a href="#pricing" className="nav-link">Pricing</a>
        <a href="#blog" className="nav-link">Blog</a>
        <a href="#contact" className="nav-link">Contact Us</a>
      </nav>

      <div className="header-cta">
        <button className="btn-primary">Try Dreeliiio free</button>
      </div>
    </header>
  );
};

export default Header;