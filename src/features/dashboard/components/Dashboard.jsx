import React, { useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import ProfileModal from './ProfileModal';
import '../css/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleToggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    // Add dark theme class to body for global styling
    if (!isDarkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className={`dashboard ${isDarkTheme ? 'dark' : ''}`}>
      <header className="dashboard-header">
        <div className="header-left">
          <button 
            className="sidebar-toggle"
            onClick={handleToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            onClick={handleToggleTheme}
            aria-label="Toggle theme"
          >
            {isDarkTheme ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
          
          <button 
            className="profile-button"
            onClick={() => setShowProfileModal(true)}
            aria-label="Open profile"
          >
            <img 
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'default'}`} 
              alt="Profile" 
              className="profile-avatar"
            />
            <span className="profile-name">{user?.displayName || 'User'}</span>
          </button>
          
          <button 
            className="logout-button"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16,17 21,12 16,7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </header>
      
      <div className="dashboard-content">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={handleToggleSidebar}
          isDarkTheme={isDarkTheme}
        />
        <ChatWindow />
      </div>
      
      {showProfileModal && (
        <ProfileModal 
          user={user} 
          onClose={() => setShowProfileModal(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard; 