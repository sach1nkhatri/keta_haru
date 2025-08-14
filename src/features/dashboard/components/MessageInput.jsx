import React, { useState, useEffect } from 'react';
import { useChat } from '../../chat/context/ChatContext';
import '../css/MessageInput.css';

const MessageInput = ({ contact, isDarkTheme }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { sendMessage, startTyping, stopTyping } = useChat();

  useEffect(() => {
    let typingTimeout;
    
    if (message.trim() && !isTyping) {
      setIsTyping(true);
      if (contact.type === 'group') {
        startTyping(contact.groupId, true);
      } else {
        startTyping(contact.uid, false);
      }
    }

    if (message.trim()) {
      typingTimeout = setTimeout(() => {
        setIsTyping(false);
        if (contact.type === 'group') {
          stopTyping(contact.groupId, true);
        } else {
          stopTyping(contact.uid, false);
        }
      }, 2000);
    } else {
      setIsTyping(false);
      if (contact.type === 'group') {
        stopTyping(contact.groupId, true);
      } else {
        stopTyping(contact.uid, false);
      }
    }

    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [message, contact, isTyping, startTyping, stopTyping]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !contact) return;

    try {
      if (contact.type === 'group') {
        await sendMessage(message, contact.groupId, true);
      } else {
        await sendMessage(message, contact.uid, false);
      }
      setMessage('');
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!contact) return null;

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-form">
        <div className="input-wrapper">
          <textarea
            className="message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              contact.type === 'group' 
                ? `Message ${contact.name}...`
                : `Message ${contact.displayName}...`
            }
            rows="1"
            maxLength="1000"
          />
          <button
            type="submit"
            className="send-button"
            disabled={!message.trim()}
            title="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput; 