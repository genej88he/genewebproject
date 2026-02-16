import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from './Header.js';
import './Pricing.css';

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Sprout',
      price: '$0',
      description: 'Perfect for getting your thoughts organized.',
      features: ['Up to 5 Files', 'Basic Notebook access', 'Community support'],
      buttonText: 'Get Started',
      isFeatured: false,
    },
    {
      name: 'Grove',
      price: '$12',
      description: 'For power users nurturing a forest of ideas.',
      features: ['Unlimited Mango Seeds', 'Advanced Typedocs', 'Cloud Syncing', 'Priority support'],
      buttonText: 'Try Mango Seed Free',
      isFeatured: true, // This highlights the "popular" plan
    }
  ];

  return (
    <div className="pricing-container">
        <Header/>
      <header className="pricing-header">
        <h1>Choose your plan</h1>
        <p>Start nurturing your thoughts today.</p>
      </header>

      <div className="pricing-grid">
        {plans.map((plan, index) => (
          <div key={index} className={`pricing-card ${plan.isFeatured ? 'featured' : ''}`}>
            {plan.isFeatured && <span className="badge">Most Popular</span>}
            <h2>{plan.name}</h2>
            <div className="price">{plan.price}<span>/year</span></div>
            <p className="description">{plan.description}</p>
            <ul className="features">
              {plan.features.map((feature, i) => (
                <li key={i}>✓ {feature}</li>
              ))}
            </ul>
            <button 
              className="plan-button" 
              onClick={() => navigate('/workspace')}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;