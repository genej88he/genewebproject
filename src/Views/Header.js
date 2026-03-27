import React, { useState, useEffect } from 'react';
import './Header.css';
import mangoLogo from '../assets/images/mangoseed512.png';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Check if user has scrolled down more than 50px
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <header className={`header-container ${isScrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="header-brand-link">
        <div className="header-left">
          <img src={mangoLogo} alt="Mango Seed" className="brand-logo" />
          <div className="brand-info">
            <span className="brand-name">Mango Seed</span>
            <span className="brand-slogan">Nurture your thoughts</span>
          </div>
        </div>
      </Link>
      

      <nav className="header-center">
        <a href="#features" className="nav-link">Features</a>
        <a href="#benefits" className="nav-link">Benefits</a>
        <a href="/pricing" className="nav-link">Pricing</a>
        <a href="#blog" className="nav-link">Blog</a>
        <a href="#contact" className="nav-link">Contact Us</a>
      </nav>

      <div className="header-right">
        <Link to="/download" className="btn-black">
          Try Mango Seed free
        </Link>
      </div>
    </header>
  );
};

export default Header;