import React, { useState, useEffect } from 'react';
import { useChat } from '../../chat/context/ChatContext';
import '../css/GroupMembersModal.css';
import { useAuth } from '../../auth/context/AuthContext';

const GroupMembersModal = ({ isOpen, onClose, group }) => {
  const { friends, addMemberToGroup, removeMemberFromGroup, getGroupMembers } = useChat();
  const { user } = useAuth();
  
  const [groupMembers, setGroupMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if current user can remove members (admin and not group creator)
  const canRemoveMembers = group?.role === 'admin' && group?.createdBy && group.createdBy !== user?.uid;

  useEffect(() => {
    if (isOpen && group) {
      loadGroupMembers();
    }
  }, [isOpen, group]);

  const loadGroupMembers = async () => {
    if (!group) return;
    
    setIsLoading(true);
    try {
      const members = await getGroupMembers(group.groupId);
      setGroupMembers(members);
    } catch (error) {
      console.error('Error loading group members:', error);
      setError('Failed to load group members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (friendId) => {
    if (!group) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await addMemberToGroup(group.groupId, friendId);
      setSuccess('Member added successfully!');
      await loadGroupMembers(); // Reload members
    } catch (error) {
      setError(error.message || 'Failed to add member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!group) return;
    
    if (!window.confirm('Are you sure you want to remove this member from the group?')) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await removeMemberFromGroup(group.groupId, memberId);
      setSuccess('Member removed successfully!');
      await loadGroupMembers(); // Reload members
    } catch (error) {
      setError(error.message || 'Failed to remove member');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFriends = friends.filter(friend => {
    const isAlreadyMember = groupMembers.some(member => member.uid === friend.uid);
    const matchesSearch = friend.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         friend.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return !isAlreadyMember && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="group-members-modal-overlay" onClick={onClose}>
      <div className="group-members-modal" onClick={e => e.stopPropagation()}>
        <div className="group-members-modal-header">
          <h2>Manage Group Members</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="group-members-modal-content">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <div className="group-info">
            <h3>{group?.name}</h3>
            <p>Current Members: {groupMembers.length}</p>
          </div>

          {/* Current Members Section */}
          <div className="current-members-section">
            <h4>Current Members</h4>
            {isLoading ? (
              <div className="loading">Loading members...</div>
            ) : groupMembers.length > 0 ? (
              <div className="members-list">
                {groupMembers.map(member => (
                  <div key={member.uid} className="member-item">
                    <div className="member-info">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.displayName}`}
                        alt={member.displayName}
                        className="member-avatar"
                      />
                      <div className="member-details">
                        <div className="member-name">{member.displayName}</div>
                        <div className="member-email">{member.email}</div>
                        <div className="member-role">{member.role}</div>
                      </div>
                    </div>
                    {canRemoveMembers && (
                      <button
                        className="remove-member-btn"
                        onClick={() => handleRemoveMember(member.uid)}
                        disabled={isLoading}
                        title="Remove member"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-members">No members found</div>
            )}
          </div>

          {/* Add Members Section */}
          <div className="add-members-section">
            <h4>Add New Members</h4>
            <div className="member-search">
              <input
                type="text"
                placeholder="Search friends to add..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="member-search-input"
              />
            </div>
            
            {filteredFriends.length > 0 ? (
              <div className="available-friends-list">
                {filteredFriends.map(friend => (
                  <div key={friend.uid} className="friend-item">
                    <div className="friend-info">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.displayName}`}
                        alt={friend.displayName}
                        className="friend-avatar"
                      />
                      <div className="friend-details">
                        <div className="friend-name">{friend.displayName}</div>
                        <div className="friend-email">{friend.email}</div>
                      </div>
                    </div>
                    <button
                      className="add-member-btn"
                      onClick={() => handleAddMember(friend.uid)}
                      disabled={isLoading}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="no-results">No friends found matching your search</div>
            ) : (
              <div className="no-friends">No friends available to add</div>
            )}
          </div>
        </div>

        <div className="group-members-modal-actions">
          <button
            className="btn btn-primary"
            onClick={onClose}
            disabled={isLoading}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupMembersModal; 