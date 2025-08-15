import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useChat } from '../../chat/context/ChatContext';
import GroupMembersModal from './GroupMembersModal';
import '../css/ChatHeader.css';

const ChatHeader = ({ contact, isDarkTheme }) => {
  const { user } = useAuth();
  const { groups } = useChat();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showGroupMembersModal, setShowGroupMembersModal] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!contact) return null;

  const isGroup = contact.type === 'group';
  
  // Get current user's role in the group
  const currentUserGroup = isGroup ? groups.find(g => g.groupId === contact.groupId) : null;
  const isAdmin = currentUserGroup?.role === 'admin';
  const canRemoveMembers = isAdmin && contact?.createdBy && contact.createdBy !== user?.uid;

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleAddMembers = () => {
    setShowGroupMembersModal(true);
    setShowDropdown(false);
  };

  const handleManageMembers = () => {
    setShowGroupMembersModal(true);
    setShowDropdown(false);
  };

  return (
    <>
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
              <p className="contact-status">Group • {currentUserGroup?.role || 'member'}</p>
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
          
          <div className="dropdown-container" ref={dropdownRef}>
            <button 
              className="action-button" 
              title="More Options"
              onClick={toggleDropdown}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>
            
            {showDropdown && (
              <div className={`dropdown-menu ${isDarkTheme ? 'dark' : ''}`}>
                {isGroup && (
                  <>
                    <button 
                      className="dropdown-item"
                      onClick={handleAddMembers}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Add Members
                    </button>
                    {canRemoveMembers && (
                      <button 
                        className="dropdown-item"
                        onClick={handleManageMembers}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        Manage Members
                      </button>
                    )}
                  </>
                )}
                <button className="dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10,9 9,9 8,9" />
                  </svg>
                  View Chat History
                </button>
                <button className="dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Report Issue
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Group Members Modal */}
      {isGroup && (
        <GroupMembersModal
          isOpen={showGroupMembersModal}
          onClose={() => setShowGroupMembersModal(false)}
          group={contact}
        />
      )}
    </>
  );
};

export default ChatHeader; 