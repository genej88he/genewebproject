import React from 'react';
import './Features.css';
// Import your icons or images here


const Features = () => {
  return (
    <section className="features-section">
      <div className="section-header">
        <h2 className="section-title">Unlock Your Ideas</h2>
        <div className="header-line"></div>
      </div>

      <div className="bento-grid">
        {/* Large Feature: Handwritten Clarity */}
        <div className="feature-card main-feature">
          <h3>Handwritten Clarity</h3>
          <p>Capture thoughts as naturally as pen on paper.</p>
        </div>

        {/* Small Stack: Voice and Search */}
        <div className="feature-stack">
          <div className="feature-card mini">
            <h3>Voice to Text</h3>
            <div className="icon">🎙️</div>
          </div>
          <div className="feature-card mini">
            <h3>Smart Search</h3>
            <div className="icon">🔍</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;