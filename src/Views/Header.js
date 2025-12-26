import React from 'react';
import './Header.css';
import mangoLogo from '../assets/images/mangoseed512.png';

const Header = () => {
  return (
    <header className="header-container">
      <div className="header-left">
        <img src={mangoLogo} alt="Mango Seed" className="brand-logo" />
        <div className="brand-info">
          <span className="brand-name">Mango Seed</span>
          <span className="brand-slogan">Nurture your thoughts</span>
        </div>
      </div>

      <nav className="header-center">
        <a href="#features" className="nav-link">Features</a>
        <a href="#benefits" className="nav-link">Benefits</a>
        <a href="#pricing" className="nav-link">Pricing</a>
        <a href="#blog" className="nav-link">Blog</a>
        <a href="#contact" className="nav-link">Contact Us</a>
      </nav>

      <div className="header-right">
        <button className="btn-cta">Try Mango Seed free</button>
      </div>
    </header>
  );
};

export default Header;