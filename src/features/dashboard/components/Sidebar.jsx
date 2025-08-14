import React, { useState } from 'react';
import { useChat } from '../../chat/context/ChatContext';
import ContactItem from './ContactItem';
import SearchBar from './SearchBar';
import '../css/Sidebar.css';

const Sidebar = ({ collapsed, onToggle, isDarkTheme }) => {
  const { 
    friends, 
    friendRequests, 
    pendingRequests, 
    selectedFriend, 
    setSelectedFriend,
    searchResults,
    isSearching,
    searchUsers,
    sendFriendRequest
  } = useChat();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim()) {
      searchUsers(value);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const handleAddFriend = async (userId, userData) => {
    const result = await sendFriendRequest(userId, userData);
    if (result.success) {
      setSearchTerm('');
      setShowSearchResults(false);
    }
  };

  const handleFriendSelect = (friend) => {
    setSelectedFriend(friend);
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${isDarkTheme ? 'dark' : ''}`}>
      <div className="sidebar-header">
        <h2>Friends</h2>
        <button className="sidebar-toggle-btn" onClick={onToggle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div className="search-section">
        <SearchBar 
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search users by name or email..."
        />
      </div>

      {showSearchResults && (
        <div className="search-results">
          <h3>Search Results</h3>
          {isSearching ? (
            <div className="loading">Searching...</div>
          ) : searchResults.length > 0 ? (
            <div className="search-results-list">
              {searchResults.map((user) => (
                <div key={user.uid} className="search-result-item">
                  <div className="user-info">
                    <img src={user.avatar} alt={user.displayName} className="user-avatar" />
                    <div className="user-details">
                      <div className="user-name">{user.displayName}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleAddFriend(user.uid, user)}
                  >
                    Add Friend
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">No users found</div>
          )}
        </div>
      )}

      {friendRequests.length > 0 && (
        <div className="friend-requests-section">
          <h3>Friend Requests ({friendRequests.length})</h3>
          <div className="friend-requests-list">
            {friendRequests.map((request) => (
              <FriendRequestItem key={request.id} request={request} />
            ))}
          </div>
        </div>
      )}

      {pendingRequests.length > 0 && (
        <div className="pending-requests-section">
          <h3>Pending Requests ({pendingRequests.length})</h3>
          <div className="pending-requests-list">
            {pendingRequests.map((request) => (
              <PendingRequestItem key={request.id} request={request} />
            ))}
          </div>
        </div>
      )}

      <div className="friends-section">
        <h3>Friends ({friends.length})</h3>
        {friends.length > 0 ? (
          <div className="friends-list">
            {friends.map((friend) => (
              <ContactItem
                key={friend.uid}
                contact={friend}
                isSelected={selectedFriend?.uid === friend.uid}
                onClick={() => handleFriendSelect(friend)}
                type="friend"
              />
            ))}
          </div>
        ) : (
          <div className="no-friends">
            <p>No friends yet</p>
            <p>Search for users to add them as friends!</p>
          </div>
        )}
      </div>
    </aside>
  );
};

// Friend Request Item Component
const FriendRequestItem = ({ request }) => {
  const { acceptFriendRequest, rejectFriendRequest } = useChat();

  const handleAccept = async () => {
    await acceptFriendRequest(request.id, request);
  };

  const handleReject = async () => {
    await rejectFriendRequest(request.id);
  };

  return (
    <div className="friend-request-item">
      <div className="request-info">
        <img 
          src={request.fromUserAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.fromUserDisplayName}`} 
          alt={request.fromUserDisplayName} 
          className="request-avatar"
        />
        <div className="request-details">
          <span className="request-name">{request.fromUserDisplayName}</span>
          <span className="request-email">{request.fromUserEmail}</span>
          <span className="request-time">{new Date(request.timestamp).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="request-actions">
        <button 
          className="btn btn-primary btn-sm"
          onClick={handleAccept}
        >
          Accept
        </button>
        <button 
          className="btn btn-outline btn-sm"
          onClick={handleReject}
        >
          Reject
        </button>
      </div>
    </div>
  );
};

// Pending Request Item Component
const PendingRequestItem = ({ request }) => {
  return (
    <div className="pending-request-item">
      <div className="request-info">
        <img 
          src={request.toUserAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.toUserDisplayName}`} 
          alt={request.toUserDisplayName} 
          className="request-avatar"
        />
        <div className="request-details">
          <span className="request-name">{request.toUserDisplayName}</span>
          <span className="request-email">{request.toUserEmail}</span>
          <span className="request-time">{new Date(request.timestamp).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="request-status">
        <span className="status pending">Pending</span>
      </div>
    </div>
  );
};

export default Sidebar; 