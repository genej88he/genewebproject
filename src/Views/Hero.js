import React from 'react';
import './Hero.css';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="hero-section">
      <h1 className="hero-main-title">Multiply your thoughts for those who note</h1>
      <p className="hero-description">
        The all-in-one workspace for your ideas, research, and daily journals. 
        From raw notes to polished projects, Mango Seed keeps your mind organized.
      </p>
      <div className="hero-action-area">
        <Link to="/workspace" className="btn-black">
          Try Mango Seed free
        </Link>
        <button className="btn-light">See features</button>
      </div>
    </section>
  );
};

export default Hero;