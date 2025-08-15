import React from 'react';
import '../css/Header.css';

const Header = ({ user, onLogout, onProfileClick, onToggleTheme, isDarkTheme, onToggleSidebar }) => {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          title="Toggle Sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1 className="app-title">Ketaharu</h1>
      </div>
      
      <div className="header-right">
        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          title={isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkTheme ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
        
        <button
          className="profile-button"
          onClick={onProfileClick}
          title="Profile"
        >
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'User'}`}
            alt={user?.displayName || 'User'}
          />
        </button>
        
        <button
          className="logout-button"
          onClick={onLogout}
          title="Logout"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header; 