import React from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import Message from './Message';
import '../css/MessageList.css';

const MessageList = ({ messages, contact, isDarkTheme }) => {
  const { user } = useAuth();

  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <div className="message-list">
      {messages.map((message) => {
        const isOwnMessage = message.sender === user.uid;
        const senderName = isOwnMessage 
          ? 'You' 
          : (contact.type === 'group' ? message.senderDisplayName : contact.displayName);

        return (
          <Message
            key={message.id}
            message={message}
            isOwnMessage={isOwnMessage}
            senderName={senderName}
            isGroup={contact.type === 'group'}
            isDarkTheme={isDarkTheme}
          />
        );
      })}
    </div>
  );
};

export default MessageList; 