import React, { useState } from 'react';
import { useChat } from '../../chat/context/ChatContext';
import '../css/GroupModal.css';

const GroupModal = ({ isOpen, onClose, mode = 'create', group = null }) => {
  const { friends, createGroup } = useChat();
  
  const [groupName, setGroupName] = useState(group?.name || '');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || selectedMembers.length === 0) return;

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await createGroup(groupName, selectedMembers);
        onClose();
      }
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMemberToggle = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const filteredFriends = friends.filter(friend =>
    friend.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="group-modal-overlay" onClick={onClose}>
      <div className="group-modal" onClick={e => e.stopPropagation()}>
        <div className="group-modal-header">
          <h2>{mode === 'create' ? 'Create New Group' : 'Edit Group'}</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="group-modal-form">
          <div className="form-group">
            <label htmlFor="groupName">Group Name</label>
            <input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              required
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label>Select Members ({selectedMembers.length} selected)</label>
            <div className="member-search">
              <input
                type="text"
                placeholder="Search friends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="member-search-input"
              />
            </div>
            
            <div className="member-list">
              {filteredFriends.map(friend => (
                <div
                  key={friend.uid}
                  className={`member-item ${selectedMembers.includes(friend.uid) ? 'selected' : ''}`}
                  onClick={() => handleMemberToggle(friend.uid)}
                >
                  <div className="member-avatar">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.displayName}`}
                      alt={friend.displayName}
                    />
                  </div>
                  <div className="member-info">
                    <div className="member-name">{friend.displayName}</div>
                    <div className="member-email">{friend.email}</div>
                  </div>
                  <div className="member-checkbox">
                    {selectedMembers.includes(friend.uid) && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!groupName.trim() || selectedMembers.length === 0 || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : mode === 'create' ? 'Create Group' : 'Update Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupModal; 