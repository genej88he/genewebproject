import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import orangeSidebar from '../assets/images/orangesidebar.png';
import mangoFire from '../assets/images/mangofire.png';
import timerState from './TimerState';

const THIRTY_MINUTES = 30 * 60 * 1000;
const IDLE_THRESHOLD = 3 * 60 * 1000;

// Module-level — persists across re-renders and page changes

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [timeLeft, setTimeLeft] = useState(null);
  const [streakSecured, setStreakSecured] = useState(false);
  const [sessionStart, setSessionStart] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const menuItems = [
    { id: 'workspace', label: 'Workspace', path: '/workspace' },
    { id: 'test-gen', label: 'Test Generator', path: '/test-generator' },
    { id: 'stats', label: 'Study Statistics', path: '/stats' },
    { id: 'settings', label: 'Settings', path: '/settings', disabled: true },
  ];

  useEffect(() => {
    async function loadStats() {
      if (window.electronAPI) {
        const stats = await window.electronAPI.getStats();
        if (stats?.sessionStart) {
          setSessionStart(stats.sessionStart);
          timerState.lastTickTime = Date.now();
        }
      }
    }
    loadStats();
  }, []);

  const handleActivity = useCallback(() => {
    const now = Date.now();
    const idleFor = now - timerState.lastActiveTime;

    if (timerState.paused && idleFor >= IDLE_THRESHOLD) {
      timerState.paused = false;
      setIsPaused(false);
      timerState.lastTickTime = now;
    }

    timerState.lastActiveTime = now; // this line was wrong — was lastTickTime
  }, []);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, handleActivity, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, handleActivity));
  }, [handleActivity]);

  useEffect(() => {
    if (!sessionStart) return;

    const interval = setInterval(async () => {
      const now = Date.now();
      const idleFor = now - timerState.lastActiveTime;

      if (idleFor >= IDLE_THRESHOLD) {
        if (!timerState.paused) {
          timerState.paused = true;
          setIsPaused(true);
        }
        timerState.lastTickTime = now;
        return;
      }

      const tickDelta = now - (timerState.lastTickTime || now);
      timerState.accumulatedTime += tickDelta;
      timerState.lastTickTime = now;

      const remaining = THIRTY_MINUTES - timerState.accumulatedTime;

      if (remaining <= 0) {
        setStreakSecured(true);
        setTimeLeft(null);
        clearInterval(interval);
        await window.electronAPI.secureStreak();
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
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <img src={orangeSidebar} alt="sidebar" className="file-icon-img2" />
        </button>
        <div className="logo-wrapper" style={{ position: 'relative' }}>
          <h3 className={`app-name ${isCollapsed ? 'label-hidden' : ''}`}>
            Mango Seed
          </h3>
          <h3 className={`app-name ${isCollapsed ? '' : 'label-hidden'}`}>
            Mango
          </h3>
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
            <span className={`sidebar-label ${isCollapsed ? 'label-hidden' : ''}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="streak-timer">
        {streakSecured ? (
          <div className="streak-secured">
            <img src={mangoFire} alt="fire" className="mango-fire-icon" />
            {!isCollapsed && <span>Streak secured!</span>}
          </div>
        ) : isPaused ? (
          <div className="streak-paused">
            <span className="streak-pause-icon">||</span>
            {!isCollapsed && (
              <span className="streak-text">Paused — move to resume</span>
            )}
          </div>
        ) : (
          <div className="streak-countdown">
            {!isCollapsed ? (
              <span className="streak-text">
                {timeLeft ? `${timeLeft} left` : 'Loading...'}
              </span>
            ) : (
              <span className="streak-text" style={{ fontSize: '11px' }}>
                {timeLeft || '--'}
              </span>
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