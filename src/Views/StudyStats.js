import React, { useState, useEffect } from 'react';
import './StudyStats.css';
import Sidebar from './Sidebar.js'

const THIRTY_MINUTES = 30 * 60 * 1000;

const StudyStats = ({ isCollapsed, setIsCollapsed}) => {
  const [stats, setStats] = useState({ streak: 0, totalDays: 0, noteCount: 0, sessionStart: null });
  const [timeLeft, setTimeLeft] = useState(null);
  const [streakSecured, setStreakSecured] = useState(false);


  useEffect(() => {
    async function loadStats() {
      if (window.electronAPI) {
        const s = await window.electronAPI.getStats();
        setStats(s);
      }
    }
    loadStats();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!stats.sessionStart) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - stats.sessionStart;
      const remaining = THIRTY_MINUTES - elapsed;
      if (remaining <= 0) {
        setStreakSecured(true);
        setTimeLeft(null);
        clearInterval(interval);
      } else {
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [stats.sessionStart]);

  // Tree generation based on stats
  const generateTree = () => {
    const noteCount = stats.noteCount || 0;
    const streak = stats.streak || 0;
    const branchCount = Math.min(2 + Math.floor(noteCount / 2), 8);
    const branchLength = Math.min(40 + streak * 8, 120);

    const branches = [];
    const angles = [-60, -30, -80, -15, -45, -70, -25, -50];
    const sides = ['left', 'right', 'left', 'right', 'left', 'right', 'left', 'right'];
    const heights = [0.3, 0.4, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75];

    for (let i = 0; i < branchCount; i++) {
      const side = sides[i];
      const heightPercent = heights[i];
      const trunkX = 300;
      const trunkTopY = 80;
      const trunkBottomY = 420;
      const trunkY = trunkTopY + (trunkBottomY - trunkTopY) * heightPercent;
      const angle = side === 'left' ? angles[i] : -angles[i];
      const angleRad = (angle * Math.PI) / 180;
      const endX = trunkX + Math.cos(angleRad) * branchLength;
      const endY = trunkY + Math.sin(angleRad) * branchLength;

      // sub branches
      const subBranches = [];
      if (noteCount > 3) {
        const subAngle1 = angle - 25;
        const subAngle2 = angle + 25;
        const subLength = branchLength * 0.55;
        [subAngle1, subAngle2].forEach((sa, idx) => {
          const saRad = (sa * Math.PI) / 180;
          const subEndX = endX + Math.cos(saRad) * subLength;
          const subEndY = endY + Math.sin(saRad) * subLength;
          subBranches.push({ x1: endX, y1: endY, x2: subEndX, y2: subEndY, idx });

          // mangos at sub branch tips
          if (noteCount > 5) {
            branches.push({ type: 'mango', x: subEndX, y: subEndY });
          }
        });
      }

      branches.push({ type: 'branch', x1: trunkX, y1: trunkY, x2: endX, y2: endY, subBranches });

      // mango at main branch tip
      if (noteCount > 1) {
        branches.push({ type: 'mango', x: endX, y: endY });
      }
    }

    return { branches, branchLength };
  };

  const { branches } = generateTree();

  return (
    <>
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className="stats-container" style={{ marginLeft: isCollapsed ? '70px' : '240px' }}>
        <h1 className="stats-title">Study Stats</h1>

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
            <div className="stat-value">{streakSecured ? 'Done!' : timeLeft || '--:--'}</div>
            <div className="stat-label">{streakSecured ? 'Streak Secured' : 'Until Streak Counts'}</div>
            </div>
        </div>

        {/* MANGO TREE */}
        <div className="tree-container">
            <svg width="600" height="500" viewBox="0 0 600 500" className="tree-svg">
            {/* Sky gradient */}
            <defs>
                <radialGradient id="groundGradient" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#8B6914" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#8B6914" stopOpacity="0" />
                </radialGradient>
                <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
                </filter>
            </defs>

            {/* Ground shadow */}
            <ellipse cx="300" cy="435" rx="60" ry="12" fill="url(#groundGradient)" />

            {/* TRUNK */}
            <path
                d="M 285 430 C 283 380 288 320 290 260 C 292 200 295 150 300 80"
                stroke="#6B4226"
                strokeWidth="18"
                fill="none"
                strokeLinecap="round"
            />
            <path
                d="M 300 430 C 300 380 302 320 303 260 C 304 200 305 150 300 80"
                stroke="#8B5E3C"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                opacity="0.5"
            />

            {/* BRANCHES */}
            {branches.filter(b => b.type === 'branch').map((branch, i) => (
                <g key={i}>
                <line
                    x1={branch.x1} y1={branch.y1}
                    x2={branch.x2} y2={branch.y2}
                    stroke="#6B4226"
                    strokeWidth="7"
                    strokeLinecap="round"
                    className="branch-line"
                    style={{ animationDelay: `${i * 0.15}s` }}
                />
                {branch.subBranches?.map((sub, j) => (
                    <line
                    key={j}
                    x1={sub.x1} y1={sub.y1}
                    x2={sub.x2} y2={sub.y2}
                    stroke="#7A5230"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="branch-line"
                    style={{ animationDelay: `${i * 0.15 + 0.3}s` }}
                    />
                ))}
                </g>
            ))}

            {/* LEAVES cluster around branch areas */}
            {branches.filter(b => b.type === 'branch').map((branch, i) => (
                <g key={`leaves-${i}`}>
                <ellipse
                    cx={branch.x2}
                    cy={branch.y2 - 10}
                    rx="22"
                    ry="16"
                    fill="#4CAF50"
                    opacity="0.85"
                    className="leaf-cluster"
                    style={{ animationDelay: `${i * 0.15 + 0.2}s` }}
                />
                <ellipse
                    cx={branch.x2 - 12}
                    cy={branch.y2 - 5}
                    rx="16"
                    ry="12"
                    fill="#66BB6A"
                    opacity="0.75"
                    className="leaf-cluster"
                    style={{ animationDelay: `${i * 0.15 + 0.25}s` }}
                />
                <ellipse
                    cx={branch.x2 + 10}
                    cy={branch.y2 - 8}
                    rx="14"
                    ry="11"
                    fill="#388E3C"
                    opacity="0.8"
                    className="leaf-cluster"
                    style={{ animationDelay: `${i * 0.15 + 0.3}s` }}
                />
                </g>
            ))}

            {/* MANGOS */}
            {branches.filter(b => b.type === 'mango').map((mango, i) => (
                <g key={`mango-${i}`} filter="url(#glow)" className="mango" style={{ animationDelay: `${i * 0.2 + 0.5}s` }}>
                <ellipse cx={mango.x} cy={mango.y + 10} rx="9" ry="12" fill="#FF9F43" />
                <ellipse cx={mango.x - 2} cy={mango.y + 8} rx="5" ry="7" fill="#FFB347" opacity="0.6" />
                <line x1={mango.x} y1={mango.y} x2={mango.x} y2={mango.y - 5} stroke="#4CAF50" strokeWidth="2" />
                </g>
            ))}

            {/* Top leaf canopy */}
            <ellipse cx="300" cy="75" rx="35" ry="25" fill="#4CAF50" opacity="0.9" className="leaf-cluster" />
            <ellipse cx="285" cy="85" rx="25" ry="18" fill="#66BB6A" opacity="0.8" className="leaf-cluster" />
            <ellipse cx="315" cy="82" rx="22" ry="16" fill="#388E3C" opacity="0.85" className="leaf-cluster" />
            </svg>

            <p className="tree-caption">
            {stats.noteCount === 0
                ? 'Create your first note to grow your tree!'
                : stats.noteCount < 3
                ? 'Your tree is just sprouting! Keep going!'
                : stats.noteCount < 6
                ? 'Looking good! Your tree is growing!'
                : 'Your mango tree is flourishing!'}
            </p>
        </div>
        </div>
    </>
  );
};

export default StudyStats;