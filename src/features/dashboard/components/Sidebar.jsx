import React, { useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useChat } from '../../chat/context/ChatContext';
import SearchBar from './SearchBar';
import ContactItem from './ContactItem';
import GroupModal from './GroupModal';
import '../css/Sidebar.css';

const Sidebar = ({ isDarkTheme, collapsed, onToggle }) => {
  const { user } = useAuth();
  const {
    friends, friendRequests, pendingRequests, groups, groupInvites,
    searchResults, selectedFriend, selectedGroup,
    setSelectedFriend, setSelectedGroup, searchUsers, sendFriendRequest,
    acceptFriendRequest, rejectFriendRequest, removeFriend,
    acceptGroupInvite, rejectGroupInvite, leaveGroup
  } = useChat();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('friends');
  const [showGroupModal, setShowGroupModal] = useState(false);

  const handleSearch = async (term) => {
    if (term.trim()) {
      await searchUsers(term);
    }
  };

  const handleAddFriend = async (targetUser) => {
    try {
      await sendFriendRequest(targetUser.uid);
      setSearchTerm('');
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
    setSelectedGroup(null);
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setSelectedFriend(null);
  };

  const handleLeaveGroup = async (groupId) => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      try {
        await leaveGroup(groupId);
      } catch (error) {
        console.error('Error leaving group:', error);
      }
    }
  };

  const isSelected = (item, type) => {
    if (type === 'friend') {
      return selectedFriend?.uid === item.uid;
    }
    if (type === 'group') {
      return selectedGroup?.groupId === item.groupId;
    }
    return false;
  };

  if (collapsed) {
    return (
      <aside className={`sidebar collapsed ${isDarkTheme ? 'dark' : ''}`}>
        <div className="sidebar-header">
          <button className="expand-button" onClick={onToggle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
        <div className="sidebar-content">
          <div className="collapsed-stats">
            <div className="stat-item">
              <span className="stat-number">{friends.length}</span>
              <span className="stat-label">Friends</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{groups.length}</span>
              <span className="stat-label">Groups</span>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`sidebar ${isDarkTheme ? 'dark' : ''}`}>
      <div className="sidebar-header">
        <h2>Chat</h2>
        <div className="sidebar-tabs">
          <button
            className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            Friends
          </button>
          <button
            className={`tab-button ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            Groups
          </button>
        </div>
        {activeTab === 'groups' && (
          <button
            className="create-group-btn"
            onClick={() => setShowGroupModal(true)}
            title="Create New Group"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="sidebar-content">
        {activeTab === 'friends' ? (
          <>
            {/* Search Section */}
            <div className="search-section">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                onSearch={handleSearch}
                placeholder="Search users..."
                isDarkTheme={isDarkTheme}
              />
              
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map(user => (
                    <div key={user.uid} className="search-result-item">
                      <div className="search-result-info">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`}
                          alt={user.displayName}
                        />
                        <div>
                          <div className="search-result-name">{user.displayName}</div>
                          <div className="search-result-email">{user.email}</div>
                        </div>
                      </div>
                      <button
                        className="add-friend-btn"
                        onClick={() => handleAddFriend(user)}
                      >
                        Add Friend
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Friend Requests Section */}
            {friendRequests.length > 0 && (
              <div className="friend-requests-section">
                <h3>Friend Requests ({friendRequests.length})</h3>
                {friendRequests.map(request => (
                  <div key={request.uid} className="friend-request-item">
                    <div className="request-info">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.displayName}`}
                        alt={request.displayName}
                      />
                      <div>
                        <div className="request-name">{request.displayName}</div>
                        <div className="request-email">{request.email}</div>
                      </div>
                    </div>
                    <div className="request-actions">
                      <button
                        className="accept-btn"
                        onClick={() => acceptFriendRequest(request.uid)}
                      >
                        Accept
                      </button>
                      <button
                        className="decline-btn"
                        onClick={() => rejectFriendRequest(request.uid)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pending Requests Section */}
            {pendingRequests.length > 0 && (
              <div className="pending-requests-section">
                <h3>Pending Requests ({pendingRequests.length})</h3>
                {pendingRequests.map(request => (
                  <div key={request.uid} className="pending-request-item">
                    <div className="request-info">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.displayName}`}
                        alt={request.displayName}
                      />
                      <div>
                        <div className="request-name">{request.displayName}</div>
                        <div className="request-email">{request.email}</div>
                      </div>
                    </div>
                    <div className="request-status">
                      <span className="status pending">Pending</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Friends List */}
            <div className="friends-section">
              <h3>Friends ({friends.length})</h3>
              {friends.length > 0 ? (
                friends.map(friend => (
                  <ContactItem
                    key={friend.uid}
                    contact={friend}
                    isSelected={isSelected(friend, 'friend')}
                    onClick={() => handleSelectFriend(friend)}
                    onRemove={() => removeFriend(friend.uid)}
                    isDarkTheme={isDarkTheme}
                  />
                ))
              ) : (
                <div className="no-friends">
                  <p>No friends yet. Search for users to add them!</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Group Invites Section */}
            {groupInvites.length > 0 && (
              <div className="group-invites-section">
                <h3>Group Invites ({groupInvites.length})</h3>
                {groupInvites.map(invite => (
                  <div key={invite.groupId} className="group-invite-item">
                    <div className="group-info">
                      <div className="group-avatar">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </div>
                      <div>
                        <div className="group-name">{invite.groupName}</div>
                        <div className="invite-from">Invited by {invite.invitedBy}</div>
                        <div className="invite-time">{new Date(invite.timestamp).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="invite-actions">
                      <button
                        className="accept-btn"
                        onClick={() => acceptGroupInvite(invite.groupId)}
                      >
                        Accept
                      </button>
                      <button
                        className="decline-btn"
                        onClick={() => rejectGroupInvite(invite.groupId)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Groups List */}
            <div className="groups-section">
              <h3>Groups ({groups.length})</h3>
              {groups.length > 0 ? (
                groups.map(group => (
                  <div
                    key={group.groupId}
                    className={`group-item ${isSelected(group, 'group') ? 'selected' : ''}`}
                    onClick={() => handleSelectGroup(group)}
                  >
                    <div className="group-avatar">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div className="group-info">
                      <div className="group-name">{group.name}</div>
                      <div className="group-role">{group.role}</div>
                    </div>
                    <div className="group-actions">
                      <button
                        className="leave-group-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeaveGroup(group.groupId);
                        }}
                        title="Leave Group"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-groups">
                  <p>No groups yet. Create one to get started!</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Group Modal */}
      <GroupModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        mode="create"
      />
    </aside>
  );
};

export default Sidebar; 