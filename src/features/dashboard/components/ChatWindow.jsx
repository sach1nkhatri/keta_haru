import React from 'react';
import { useChat } from '../../chat/context/ChatContext';
import { useAuth } from '../../auth/context/AuthContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import '../css/ChatWindow.css';

const ChatWindow = ({ contact, isDarkTheme }) => {
  const { user } = useAuth();
  const { messages, groupMessages, typing } = useChat();

  if (!contact) {
    return (
      <div className="chat-window">
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M13 8H7" />
              <path d="M17 12H7" />
            </svg>
          </div>
          <h3>Welcome to Ketaharu!</h3>
          <p>
            {contact?.type === 'group' 
              ? 'Select a group to start collaborating with your team'
              : 'Select a friend to start chatting'
            }
          </p>
        </div>
      </div>
    );
  }

  // Get messages for the selected contact
  const getCurrentChatMessages = () => {
    if (!contact || !user) return [];

    if (contact.type === 'group') {
      return groupMessages[contact.groupId] || [];
    } else {
      const chatId = [user.uid, contact.uid].sort().join('_');
      return messages[chatId] || [];
    }
  };

  const currentMessages = getCurrentChatMessages();
  const isTyping = contact && typing[contact.type === 'group' ? contact.groupId : contact.uid];

  return (
    <div className="chat-window">
      <ChatHeader contact={contact} isDarkTheme={isDarkTheme} />
      
      <div className="chat-messages">
        {currentMessages.length > 0 ? (
          <MessageList 
            messages={currentMessages} 
            contact={contact}
            isDarkTheme={isDarkTheme}
          />
        ) : (
          <div className="empty-messages">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <path d="M13 8H7" />
                <path d="M17 12H7" />
              </svg>
            </div>
            <h3>No messages yet</h3>
            <p>
              {contact.type === 'group' 
                ? 'Start the conversation in your group!'
                : 'Start the conversation with your friend!'
              }
            </p>
          </div>
        )}
      </div>

      {isTyping && (
        <div className="typing-indicator">
          <div className="typing-text">
            {contact.type === 'group' ? 'Someone is typing...' : `${contact.displayName} is typing...`}
          </div>
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}

      <MessageInput 
        contact={contact}
        isDarkTheme={isDarkTheme}
      />
    </div>
  );
};

export default ChatWindow; 