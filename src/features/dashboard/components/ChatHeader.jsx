import React from 'react';
import '../css/ChatHeader.css';

const ChatHeader = ({ contact, isDarkTheme }) => {
  if (!contact) return null;

  const isGroup = contact.type === 'group';

  return (
    <div className="chat-header">
      <div className="chat-contact-info">
        <div className="contact-avatar">
          {isGroup ? (
            <div className="group-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          ) : (
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.displayName}`}
              alt={contact.displayName}
            />
          )}
        </div>
        
        <div className="contact-details">
          <h3 className="contact-name">{contact.name || contact.displayName}</h3>
          {isGroup ? (
            <p className="contact-status">Group • {contact.role}</p>
          ) : (
            <p className="contact-status">Online</p>
          )}
        </div>
      </div>
      
      <div className="chat-actions">
        {isGroup && (
          <button className="action-button" title="Group Info">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </button>
        )}
        
        <button className="action-button" title="More Options">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader; 