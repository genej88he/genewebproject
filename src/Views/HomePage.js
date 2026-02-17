import React from 'react';
import './HomePage.css';
import Header from './Header.js';
import Hero from './Hero.js';
import Features from './Features.js'

// import mangoCup from '../assets/images/mangoseed.png';

const HomePage = () => {
    return (
    <div className="mangoseed-homepage">
      {/* The Top Fold Wrapper */}
      <div className="top-fold-wrapper">
        <Header />
        <Hero />
      </div>

      {/* Other sections will have the default background */}
      <section className="next-section">
        <Features />
      </section>
    </div>
  );
};

export default HomePage;
