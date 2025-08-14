import React, { useState, useEffect } from 'react';
import { useChat } from '../../chat/context/ChatContext';
import '../css/MessageInput.css';

const MessageInput = ({ friendId }) => {
  const { sendMessage, startTyping, stopTyping } = useChat();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let typingTimer;
    
    if (message.trim() && friendId) {
      setIsTyping(true);
      startTyping(friendId);
      
      // Clear typing indicator after 2 seconds of no typing
      typingTimer = setTimeout(() => {
        setIsTyping(false);
        stopTyping(friendId);
      }, 2000);
    } else {
      setIsTyping(false);
      if (friendId) {
        stopTyping(friendId);
      }
    }

    return () => {
      if (typingTimer) {
        clearTimeout(typingTimer);
      }
      if (isTyping && friendId) {
        stopTyping(friendId);
      }
    };
  }, [message, friendId, startTyping, stopTyping, isTyping]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !friendId) return;

    await sendMessage(friendId, message);
    setMessage('');
    setIsTyping(false);
    stopTyping(friendId);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="message-input-container">
      <form className="message-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="message-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={friendId ? "Type a message..." : "Select a friend to start chatting..."}
          disabled={!friendId}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!message.trim() || !friendId}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22,2 15,22 11,13 2,9"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default MessageInput; 