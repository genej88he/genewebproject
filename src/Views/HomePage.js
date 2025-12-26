import React, { useState } from 'react';
import './HomePage.css';
import Header from './Header.js';
import Hero from './Hero.js';

import mangoCup from '../assets/images/mangoseed.png';
import mangoLogo from '../assets/images/mangoseed512.png';

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
        <h2>Rest of the page</h2>
      </section>
    </div>
  );
};

export default HomePage;
