import React from 'react';
import '../css/ChatHeader.css';

const ChatHeader = ({ friend }) => {
  return (
    <div className="chat-header">
      <div className="chat-contact-info">
        <img 
          src={friend.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.displayName}`} 
          alt={friend.displayName} 
          className="chat-avatar"
        />
        <div className="contact-details">
          <h3 className="contact-name">{friend.displayName}</h3>
          <span className="contact-status">Friend</span>
        </div>
      </div>
      
      <div className="chat-actions">
        <button className="action-button" aria-label="Voice call">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        </button>
        
        <button className="action-button" aria-label="Video call">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 7a16 16 0 0 0-4.9-1.23L19 4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v3a4 4 0 0 0-4 4v1a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1a4 4 0 0 0 4-4v-1a1 1 0 0 0 1-1V7z"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </button>
        
        <button className="action-button" aria-label="More options">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="19" cy="12" r="1"></circle>
            <circle cx="5" cy="12" r="1"></circle>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader; 