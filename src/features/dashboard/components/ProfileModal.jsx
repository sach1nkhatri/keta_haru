import React from 'react';
import '../css/ProfileModal.css';

const ProfileModal = ({ isOpen, user, onClose, isDarkTheme }) => {
  // Debug log to check modal state
  console.log('ProfileModal render:', { isOpen, user: user?.displayName });

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Don't render if modal is not open
  if (!isOpen) {
    console.log('ProfileModal: Not rendering - isOpen is false');
    return null;
  }

  return (
    <div className="profile-modal-backdrop" onClick={handleBackdropClick}>
      <div className={`profile-modal ${isDarkTheme ? 'dark' : ''}`}>
        <div className="modal-header">
          <h2>Profile</h2>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-content">
          <div className="profile-section">
            <div className="profile-avatar-large">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'default'}`} 
                alt="Profile" 
              />
            </div>
            <h3 className="profile-name">{user?.displayName || 'User'}</h3>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-email">
              Member since {new Date(user?.metadata?.creationTime || Date.now()).toLocaleDateString()}
            </p>
          </div>

          <div className="settings-section">
            <h4>Settings</h4>
            <div className="setting-item">
              <span>Notifications</span>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
            
            <div className="setting-item">
              <span>Sound</span>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
            
            <div className="setting-item">
              <span>Dark Mode</span>
              <label className="toggle">
                <input type="checkbox" checked={isDarkTheme} readOnly />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="account-section">
            <h4>Account</h4>
            <button className="btn btn-outline w-full mb-4">
              Change Password
            </button>
            <button className="btn btn-outline w-full mb-4">
              Edit Profile
            </button>
            <button className="btn btn-outline w-full">
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal; 