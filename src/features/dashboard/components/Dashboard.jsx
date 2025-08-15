import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useChat } from '../../chat/context/ChatContext';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import ProfileModal from './ProfileModal';
import '../css/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { selectedFriend, selectedGroup } = useChat();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Debug log for modal state
  console.log('Dashboard render:', { showProfileModal, user: user?.displayName });

  const handleToggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    
    if (newTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };

  const handleToggleSidebar = () => {
    // On mobile, toggle the mobile sidebar
    if (isMobile) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      // On desktop, toggle the collapsed state
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleCloseMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getSelectedContact = () => {
    if (selectedFriend) {
      return { ...selectedFriend, type: 'friend' };
    }
    if (selectedGroup) {
      return { ...selectedGroup, type: 'group' };
    }
    return null;
  };

  const selectedContact = getSelectedContact();

  return (
    <div className={`dashboard ${isDarkTheme ? 'dark' : ''}`}>
      <header className="dashboard-header">
        <div className="header-left">
          <button
            className="sidebar-toggle"
            onClick={handleToggleSidebar}
            title={isMobile ? 'Toggle Sidebar' : (sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar')}
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
          <div className="user-info">
            <span className="user-name">{user?.displayName || 'User'}</span>
          </div>
          
          <button
            className="theme-toggle"
            onClick={handleToggleTheme}
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
            onClick={() => {
              console.log('Profile button clicked, setting showProfileModal to true');
              setShowProfileModal(true);
            }}
            title="Profile"
          >
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'User'}`}
              alt={user?.displayName || 'User'}
            />
          </button>
          
          <button
            className="logout-button"
            onClick={handleLogout}
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

      <div className="dashboard-content">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="mobile-sidebar-overlay" onClick={handleCloseMobileSidebar}></div>
        )}
        
        <Sidebar 
          isDarkTheme={isDarkTheme} 
          collapsed={sidebarCollapsed}
          onToggle={handleToggleSidebar}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={handleCloseMobileSidebar}
        />
        <ChatWindow 
          contact={selectedContact}
          isDarkTheme={isDarkTheme}
        />
      </div>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => {
          console.log('ProfileModal onClose called, setting showProfileModal to false');
          setShowProfileModal(false);
        }}
        user={user}
        isDarkTheme={isDarkTheme}
      />
    </div>
  );
};

export default Dashboard; 