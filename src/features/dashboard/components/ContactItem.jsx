import React, { useState } from 'react';
import { useChat } from '../../chat/context/ChatContext';
import '../css/ContactItem.css';

const ContactItem = ({ contact, isSelected, onClick, type = 'friend' }) => {
  const { removeFriend, messages } = useChat();
  const [showOptions, setShowOptions] = useState(false);

  const handleRemoveFriend = async () => {
    if (type === 'friend') {
      await removeFriend(contact.uid);
    }
    setShowOptions(false);
  };

  // Get last message for this friend
  const chatId = contact.uid ? [contact.uid, contact.uid].sort().join('_') : null;
  const friendMessages = messages[chatId] || [];
  const lastMessage = friendMessages[friendMessages.length - 1];

  return (
    <div 
      className={`contact-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="contact-avatar">
        <img src={contact.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.displayName}`} alt={contact.displayName} />
        <div className={`status-dot ${contact.online ? 'online' : 'offline'}`}></div>
      </div>
      
      <div className="contact-info">
        <div className="contact-name">{contact.displayName}</div>
        {lastMessage && (
          <div className="contact-last-message">
            {lastMessage.sender === contact.uid ? lastMessage.text : `You: ${lastMessage.text}`}
          </div>
        )}
        {lastMessage && (
          <div className="contact-time">
            {new Date(lastMessage.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>

      {type === 'friend' && (
        <div className="contact-actions">
          <button 
            className="options-button"
            onClick={(e) => {
              e.stopPropagation();
              setShowOptions(!showOptions);
            }}
            aria-label="More options"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>
          
          {showOptions && (
            <div className="options-menu" onClick={(e) => e.stopPropagation()}>
              <button 
                className="option-item remove-friend"
                onClick={handleRemoveFriend}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
                Remove Friend
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactItem; 