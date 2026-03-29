import React, { useState, useEffect } from 'react';
import './StudyStats.css';
import Sidebar from './Sidebar.js';
import timerState from './TimerState';

const THIRTY_MINUTES = 30 * 60 * 1000;
const CIRCUMFERENCE = 2 * Math.PI * 52; // radius 52

const StudyStats = ({ isCollapsed, setIsCollapsed }) => {
  const [stats, setStats] = useState({ streak: 0, totalDays: 0, noteCount: 0, sessionStart: null });
  const [timeLeft, setTimeLeft] = useState(null);
  const [streakSecured, setStreakSecured] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  

  useEffect(() => {
    async function loadStats() {
      if (window.electronAPI) {
        const s = await window.electronAPI.getStats();
        setStats(s);
  
        if (s.streakSecuredDate) {
          const today = new Date().setHours(0, 0, 0, 0);
          const securedDate = new Date(s.streakSecuredDate).setHours(0, 0, 0, 0);
          if (securedDate === today) {
            setStreakSecured(true);
            setProgress(1);
          }
        }
      }
    }
    loadStats();
  }, []);


useEffect(() => {
  if (!stats.sessionStart) return;
  if (streakSecured) return;

  const interval = setInterval(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const sessionDate = new Date(stats.sessionStart).setHours(0, 0, 0, 0);

    if (sessionDate !== today) {
      setProgress(0);
      setTimeLeft(null);
      clearInterval(interval);
      return;
    }

    const elapsed = timerState.accumulatedTime;
    const remaining = THIRTY_MINUTES - elapsed;

    // Guard against NaN while timer hasn't started yet
    if (remaining <= 0 || elapsed === 0) return;

    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
    setProgress(Math.min(elapsed / THIRTY_MINUTES, 0.99));
  }, 1000);

  return () => clearInterval(interval);
}, [stats.sessionStart, streakSecured]);

  // progress 0→1 drives the plant growth
  // 0.00 - 0.15: just seed in soil
  // 0.15 - 0.40: tiny sprout appears
  // 0.40 - 0.70: stem grows, first leaf
  // 0.70 - 1.00: second leaf, small mango bud
  const seedY = 200;
  const soilY = 220;

  const stemHeight = progress < 0.15 ? 0 : Math.min(((progress - 0.15) / 0.85) * 120, 120);
  const stemTopY = seedY - stemHeight;

  const showLeaf1 = progress >= 0.4;
  const leaf1Opacity = progress < 0.4 ? 0 : Math.min((progress - 0.4) / 0.15, 1);
  const leaf1Scale = leaf1Opacity;

  const showLeaf2 = progress >= 0.65;
  const leaf2Opacity = progress < 0.65 ? 0 : Math.min((progress - 0.65) / 0.15, 1);
  const leaf2Scale = leaf2Opacity;

  const showBud = progress >= 0.85;
  const budOpacity = progress < 0.85 ? 0 : Math.min((progress - 0.85) / 0.15, 1);

  const seedOpacity = progress < 0.3 ? 1 : Math.max(1 - (progress - 0.3) / 0.2, 0);

  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const caption = streakSecured
    ? 'Your seedling is ready. Keep studying to help it grow!'
    : progress === 0
    ? 'Your seed is waiting. Start studying to watch it sprout.'
    : progress < 0.15
    ? 'The seed is warming up...'
    : progress < 0.4
    ? 'A tiny sprout is emerging!'
    : progress < 0.7
    ? 'Your seedling is growing its first leaves.'
    : progress < 1
    ? 'Almost there — a bud is forming!'
    : 'Your seedling has sprouted!';

  return (
    <>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div
        className="stats-container"
        style={{ marginLeft: isCollapsed ? '72px' : '220px' }}
      >
        <div className="stats-header">
          <div className="stats-eyebrow">Your Progress</div>
          <h1 className="stats-title">Study <em>Statistics</em></h1>
        </div>

        {/* STAT CARDS */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-value">{stats.streak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.noteCount}</div>
            <div className="stat-label">Notes Created</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalDays}</div>
            <div className="stat-label">Total Days</div>
          </div>
          <div className={`stat-card ${streakSecured ? 'secured' : ''}`}>
            <div className="stat-value">
              {streakSecured ? 'Done' : timeLeft || '--:--'}
            </div>
            <div className="stat-label">
              {streakSecured ? 'Streak Secured' : 'Until Streak'}
            </div>
          </div>
        </div>

        {/* SEED / SPROUT */}
        <div className="seed-section">

          {/* Progress ring */}
          <div className="progress-ring-wrap">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle className="progress-ring-bg" cx="60" cy="60" r="52" />
              <circle
                className="progress-ring-fill"
                cx="60" cy="60" r="52"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className="progress-ring-label">
              <span className="progress-ring-time">
                {streakSecured ? '100%' : `${Math.round(progress * 100)}%`}
              </span>
              <span className="progress-ring-sub">focused</span>
            </div>
          </div>

          {/* Sprouting plant SVG */}
          <svg
            width="280"
            height="260"
            viewBox="0 0 280 260"
            className="seed-svg"
          >
            <defs>
              <radialGradient id="soilGrad" cx="50%" cy="40%">
                <stop offset="0%" stopColor="#8B6914" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#8B6914" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Soil */}
            <ellipse cx="140" cy={soilY + 18} rx="70" ry="18" fill="#C4973A" opacity="0.25" />
            <ellipse cx="140" cy={soilY + 14} rx="52" ry="12" fill="#A0782A" opacity="0.2" />

            {/* Seed */}
            <g opacity={seedOpacity}>
              <ellipse cx="140" cy={seedY + 10} rx="14" ry="10" fill="#8B5E3C" />
              <ellipse cx="137" cy={seedY + 8} rx="6" ry="4" fill="#A0784A" opacity="0.5" />
            </g>

            {/* Stem */}
            {stemHeight > 0 && (
              <line
                x1="140" y1={seedY + 8}
                x2="140" y2={stemTopY}
                stroke="#5C8A6E"
                strokeWidth="4"
                strokeLinecap="round"
              />
            )}

            {/* Leaf 1 — left */}
            {showLeaf1 && (
              <g
                transform={`translate(140, ${stemTopY + stemHeight * 0.4}) scale(${leaf1Scale})`}
                style={{ transformOrigin: '140px 0px' }}
                opacity={leaf1Opacity}
              >
                <ellipse
                  cx="-18" cy="-8"
                  rx="22" ry="11"
                  fill="#5C8A6E"
                  transform="rotate(-30, -18, -8)"
                />
                <line
                  x1="0" y1="0"
                  x2="-30" y2="-14"
                  stroke="#4A7A5C"
                  strokeWidth="1.5"
                  opacity="0.6"
                />
              </g>
            )}

            {/* Leaf 2 — right */}
            {showLeaf2 && (
              <g
                transform={`translate(140, ${stemTopY + stemHeight * 0.2}) scale(${leaf2Scale})`}
                style={{ transformOrigin: '140px 0px' }}
                opacity={leaf2Opacity}
              >
                <ellipse
                  cx="18" cy="-10"
                  rx="20" ry="10"
                  fill="#4A7A5C"
                  transform="rotate(25, 18, -10)"
                />
                <line
                  x1="0" y1="0"
                  x2="28" y2="-16"
                  stroke="#3A6A4C"
                  strokeWidth="1.5"
                  opacity="0.6"
                />
              </g>
            )}

            {/* Mango bud at tip */}
            {showBud && (
              <g opacity={budOpacity}>
                <ellipse
                  cx="140" cy={stemTopY - 10}
                  rx="8" ry="11"
                  fill="#E8803A"
                />
                <ellipse
                  cx="138" cy={stemTopY - 12}
                  rx="4" ry="5"
                  fill="#F5A060"
                  opacity="0.6"
                />
              </g>
            )}
          </svg>

          <p className="seed-caption">{caption}</p>
        </div>
      </div>
    </>
  );
};

export default StudyStats;