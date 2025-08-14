import React from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import Message from './Message';
import '../css/MessageList.css';

const MessageList = ({ messages }) => {
  const { user } = useAuth();

  console.log('🔍 MessageList render:', {
    messages,
    messageCount: messages?.length || 0,
    userUid: user?.uid
  });

  if (!messages || messages.length === 0) {
    console.log('🔍 MessageList: No messages to display');
    return null;
  }

  return (
    <div className="message-list">
      {messages.map((message) => {
        console.log('🔍 Rendering message:', message);
        return (
          <Message
            key={message.id}
            message={message}
            isOwnMessage={message.sender === user.uid}
          />
        );
      })}
    </div>
  );
};

export default MessageList; 