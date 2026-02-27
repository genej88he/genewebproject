import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import orangeSidebar from '../assets/images/orangesidebar.png';
import mangoSeed from '../assets/images/mangoseed.png';
import mangoFire from '../assets/images/mangofire.png';

const THIRTY_MINUTES = 30 * 60 * 1000;

const Sidebar = ({isCollapsed, setIsCollapsed}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [timeLeft, setTimeLeft] = useState(null);
  const [streakSecured, setStreakSecured] = useState(false);
  const [sessionStart, setSessionStart] = useState(null);


  const menuItems = [
    { id: 'workspace', label: 'Workspace', path: '/workspace' },
    { id: 'test-gen', label: 'Test Generator', path: '/test-generator' },
    { id: 'stats', label: 'Study Stats', path: '/stats'},
    { id: 'settings', label: 'Settings', path: '/settings', disabled: true },
  ];

  useEffect(() => {
    async function loadStats() {
      if (window.electronAPI) {
        const stats = await window.electronAPI.getStats();
        if (stats?.sessionStart) {
          setSessionStart(stats.sessionStart);
        }
      }
    }
    loadStats();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!sessionStart) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - sessionStart;
      const remaining = THIRTY_MINUTES - elapsed;

      if (remaining <= 0) {
        setStreakSecured(true);
        setTimeLeft(null);
        clearInterval(interval);
      } else {
        setStreakSecured(false);
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStart]);

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button 
            className="collapse-btn" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
            {<img src={orangeSidebar} alt="sidebar" className="file-icon-img2" />}
        </button>
        <div className="logo-wrapper">
            {!isCollapsed && (
            <>
                <h3 className="app-name">Mango Seed</h3>
            </>
            )}
            {isCollapsed && <img src={mangoSeed} alt="logo" className="sidebar-logo" />}
        </div>
        
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
            onClick={() => !item.disabled && navigate(item.path)}
            disabled={item.disabled}
            title={isCollapsed ? item.label : ''}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="streak-timer">
        {streakSecured ? (
        <div className="streak-secured">
        {!isCollapsed && (
          <>
            <img src={mangoFire} alt="fire" className="mango-fire-icon" />
            <span>Streak secured!</span>
          </>
        )}
      </div>
        ) : (
          <div className="streak-countdown">
          {!isCollapsed ? (
            <>
              <img src={mangoFire} alt="fire" className="mango-fire-icon" />
              <span className="streak-text">
                {timeLeft ? `${timeLeft} left` : 'Loading...'}
              </span>
            </>
          ) : (
            <img src={mangoFire} alt="fire" className="mango-fire-icon" />
          )}
        </div>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">👤</div>
          {!isCollapsed && <div className="user-name">Student</div>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;