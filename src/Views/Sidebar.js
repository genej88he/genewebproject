import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import orangeSidebar from '../assets/images/orangesidebar.png';
import mangoSeed from '../assets/images/mangoseed.png';

const Sidebar = ({isCollapsed, setIsCollapsed}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'workspace', label: 'Workspace', path: '/workspace' },
    { id: 'test-gen', label: 'Test Generator', path: '/test-generator' },
    { id: 'stats', label: 'Study Stats', path: '/stats', disabled: true },
    { id: 'settings', label: 'Settings', path: '/settings', disabled: true },
  ];

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