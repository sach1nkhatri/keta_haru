import React from 'react';
import '../css/Message.css';

const Message = ({ message, isOwnMessage }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className={`message ${isOwnMessage ? 'own' : 'other'}`}>
      <div className="message-content">
        <div className="message-text">{message.text}</div>
        <div className="message-meta">
          <span className="message-time">{formatTime(message.timestamp)}</span>
          {isOwnMessage && (
            <span className="message-status">
              {message.read ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
      <div className="message-date">
        {formatDate(message.timestamp)}
      </div>
    </div>
  );
};

export default Message; 