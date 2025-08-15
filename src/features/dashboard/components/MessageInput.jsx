import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../chat/context/ChatContext';
import '../css/MessageInput.css';

const MessageInput = ({ contact, isDarkTheme }) => {
  const [message, setMessage] = useState('');
  const { sendMessage, startTyping, stopTyping } = useChat();
  
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (message.trim() && !isTypingRef.current) {
      isTypingRef.current = true;
      if (contact.type === 'group') {
        startTyping(contact.groupId, true);
      } else {
        startTyping(contact.uid, false);
      }
    }

    if (message.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        if (contact.type === 'group') {
          stopTyping(contact.groupId, true);
        } else {
          stopTyping(contact.uid, false);
        }
      }, 2000);
    } else {
      isTypingRef.current = false;
      if (contact.type === 'group') {
        stopTyping(contact.groupId, true);
      } else {
        stopTyping(contact.uid, false);
      }
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, contact, startTyping, stopTyping]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('=== handleSubmit called ===');
    console.log('Message:', message);
    console.log('Contact:', contact);
    
    if (!message.trim() || !contact) {
      console.log('Early return - no message or contact');
      return;
    }

    try {
      console.log('About to send message...');
      
      // Stop typing immediately when sending message
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      
      isTypingRef.current = false;
      if (contact.type === 'group') {
        stopTyping(contact.groupId, true);
      } else {
        stopTyping(contact.uid, false);
      }
      
      if (contact.type === 'group') {
        console.log('Sending group message to:', contact.groupId);
        await sendMessage(message, contact.groupId, true);
      } else {
        console.log('Sending direct message to:', contact.uid);
        await sendMessage(message, contact.uid, false);
      }
      
      console.log('Message sent successfully, clearing input');
      setMessage('');
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