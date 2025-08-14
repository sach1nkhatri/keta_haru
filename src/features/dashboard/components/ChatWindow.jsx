import React from 'react';
import { useChat } from '../../chat/context/ChatContext';
import { useAuth } from '../../auth/context/AuthContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import '../css/ChatWindow.css';

const ChatWindow = () => {
  const { selectedFriend, messages, typing } = useChat();
  const { user } = useAuth();

  // Get messages for the selected friend
  const getCurrentChatMessages = () => {
    if (!selectedFriend || !user) return [];
    
    const chatId = [user.uid, selectedFriend.uid].sort().join('_');
    console.log('🔍 Debug ChatWindow:', {
      userUid: user.uid,
      friendUid: selectedFriend.uid,
      chatId,
      allMessages: messages,
      chatMessages: messages[chatId]
    });
    return messages[chatId] || [];
  };

  const currentMessages = getCurrentChatMessages();
  const isTyping = selectedFriend && typing[selectedFriend.uid];

  if (!selectedFriend) {
    return (
      <div className="chat-window">
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <h3>Select a friend to start chatting</h3>
          <p>Choose someone from your friends list to begin a conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <ChatHeader friend={selectedFriend} />
      
      <div className="chat-messages">
        {currentMessages.length > 0 ? (
          <MessageList messages={currentMessages} />
        ) : (
          <div className="empty-messages">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3>No messages yet</h3>
            <p>Start the conversation by sending a message!</p>
          </div>
        )}
      </div>

      {isTyping && (
        <div className="typing-indicator">
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="typing-text">{selectedFriend.displayName} is typing...</span>
        </div>
      )}

      <MessageInput friendId={selectedFriend.uid} />
    </div>
  );
};

export default ChatWindow; 