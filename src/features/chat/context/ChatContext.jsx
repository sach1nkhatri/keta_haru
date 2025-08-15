import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ref, 
  onValue, 
  push, 
  set, 
  remove, 
  update,
  get
} from 'firebase/database';
import { realtimeDb } from '../../../firebase';
import { useAuth } from '../../auth/context/AuthContext';
// import Swal from 'sweetalert2'; // Commented out as not currently used

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [messages, setMessages] = useState({});
  const [groupMessages, setGroupMessages] = useState({});
  const [typing, setTyping] = useState({});
  const [groups, setGroups] = useState([]);
  const [groupInvites, setGroupInvites] = useState([]);

  // Listen for friends changes
  useEffect(() => {
    if (!user) return;

    const friendsRef = ref(realtimeDb, `users/${user.uid}/friends`);
    const unsubscribe = onValue(friendsRef, (snapshot) => {
      const friendsData = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          friendsData.push({
            uid: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
      }
      setFriends(friendsData);
    });

    return () => unsubscribe();
  }, [user]);

  // Listen for friend requests
  useEffect(() => {
    if (!user) return;

    const requestsRef = ref(realtimeDb, `users/${user.uid}/friendRequests`);
    const unsubscribe = onValue(requestsRef, (snapshot) => {
      const requestsData = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          requestsData.push({
            uid: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
      }
      setFriendRequests(requestsData);
    });

    return () => unsubscribe();
  }, [user]);

  // Listen for pending requests
  useEffect(() => {
    if (!user) return;

    const pendingRef = ref(realtimeDb, `users/${user.uid}/pendingRequests`);
    const unsubscribe = onValue(pendingRef, (snapshot) => {
      const pendingData = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          pendingData.push({
            uid: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
      }
      setPendingRequests(pendingData);
    });

    return () => unsubscribe();
  }, [user]);

  // Listen for groups
  useEffect(() => {
    if (!user) return;

    const groupsRef = ref(realtimeDb, `users/${user.uid}/groups`);
    const unsubscribe = onValue(groupsRef, async (snapshot) => {
      if (snapshot.exists()) {
        // Collect all async operations
        const groupPromises = [];
        const userGroupDataMap = new Map();
        
        snapshot.forEach((childSnapshot) => {
          const userGroupData = childSnapshot.val();
          const groupId = childSnapshot.key;
          userGroupDataMap.set(groupId, userGroupData);
          
          // Create promise for fetching full group data
          const groupPromise = get(ref(realtimeDb, `groups/${groupId}`))
            .then((fullGroupSnapshot) => {
              if (fullGroupSnapshot.exists()) {
                const fullGroupData = fullGroupSnapshot.val();
                return {
                  groupId,
                  ...userGroupData,
                  createdBy: fullGroupData.createdBy,
                  name: fullGroupData.name || userGroupData.name
                };
              } else {
                // Fallback to user group data if full group data not found
                return {
                  groupId,
                  ...userGroupData
                };
              }
            })
            .catch((error) => {
              console.error('Error fetching full group data:', error);
              // Fallback to user group data
              return {
                groupId,
                ...userGroupData
              };
            });
          
          groupPromises.push(groupPromise);
        });
        
        // Wait for all async operations to complete
        try {
          const groupsData = await Promise.all(groupPromises);
          setGroups(groupsData);
        } catch (error) {
          console.error('Error loading groups:', error);
          // Fallback to user group data only
          const fallbackGroups = Array.from(userGroupDataMap.entries()).map(([groupId, userGroupData]) => ({
            groupId,
            ...userGroupData
          }));
          setGroups(fallbackGroups);
        }
      } else {
        setGroups([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Listen for group invites
  useEffect(() => {
    if (!user) return;

    const invitesRef = ref(realtimeDb, `users/${user.uid}/groupInvites`);
    const unsubscribe = onValue(invitesRef, (snapshot) => {
      const invitesData = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          invitesData.push({
            inviteId: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
      }
      setGroupInvites(invitesData);
    });

    return () => unsubscribe();
  }, [user]);

  // Listen for messages
  useEffect(() => {
    if (!user) return;

    const messagesRef = ref(realtimeDb, 'messages');
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messagesData = {};
      if (snapshot.exists()) {
        snapshot.forEach((chatSnapshot) => {
          const chatMessages = [];
          chatSnapshot.forEach((messageSnapshot) => {
            chatMessages.push({
              id: messageSnapshot.key,
              ...messageSnapshot.val()
            });
          });
          // Sort messages by timestamp
          chatMessages.sort((a, b) => a.timestamp - b.timestamp);
          messagesData[chatSnapshot.key] = chatMessages;
        });
      }
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [user]);

  // Listen for group messages
  useEffect(() => {
    if (!user) return;

    const groupMessagesRef = ref(realtimeDb, 'groupMessages');
    const unsubscribe = onValue(groupMessagesRef, (snapshot) => {
      const groupMessagesData = {};
      if (snapshot.exists()) {
        snapshot.forEach((groupSnapshot) => {
          const groupChatMessages = [];
          groupSnapshot.forEach((messageSnapshot) => {
            groupChatMessages.push({
              id: messageSnapshot.key,
              ...messageSnapshot.val()
            });
          });
          // Sort messages by timestamp
          groupChatMessages.sort((a, b) => a.timestamp - b.timestamp);
          groupMessagesData[groupSnapshot.key] = groupChatMessages;
        });
      }
      setGroupMessages(groupMessagesData);
    });

    return () => unsubscribe();
  }, [user]);

  // Listen for typing indicators
  useEffect(() => {
    if (!user) return;

    const typingRef = ref(realtimeDb, `typing/${user.uid}`);
    const unsubscribe = onValue(typingRef, (snapshot) => {
      const typingData = {};
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const typingInfo = childSnapshot.val();
          // Only show typing if it's recent (within 5 seconds)
          if (Date.now() - typingInfo.timestamp < 5000) {
            typingData[childSnapshot.key] = typingInfo;
          }
        });
      }
      setTyping(typingData);
    });

    return () => unsubscribe();
  }, [user]);

  // Search users
  const searchUsers = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const usersRef = ref(realtimeDb, 'users');
      const snapshot = await get(usersRef);
      const users = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val();
          if (childSnapshot.key !== user.uid) {
            users.push({
              uid: childSnapshot.key,
              ...userData
            });
          }
        });
      }

      // Filter users by displayName or email
      const filteredUsers = users.filter(userData => {
        const searchLower = searchTerm.toLowerCase();
        return (
          userData.displayName?.toLowerCase().includes(searchLower) ||
          userData.email?.toLowerCase().includes(searchLower)
        );
      });

      // Exclude existing friends and pending requests
      const existingFriendIds = friends.map(f => f.uid);
      const pendingRequestIds = pendingRequests.map(p => p.uid);
      
      const availableUsers = filteredUsers.filter(userData => 
        !existingFriendIds.includes(userData.uid) &&
        !pendingRequestIds.includes(userData.uid)
      );

      setSearchResults(availableUsers);
      setIsSearching(false);
    } catch (error) {
      console.error('Error searching users:', error);
      setIsSearching(false);
    }
  };

  // Send friend request
  const sendFriendRequest = async (targetUserId) => {
    if (!user) return;

    try {
      const requestData = {
        from: user.uid,
        fromDisplayName: user.displayName,
        fromEmail: user.email,
        timestamp: Date.now(),
        status: 'pending'
      };

      // Add to target user's friend requests
      await set(ref(realtimeDb, `users/${targetUserId}/friendRequests/${user.uid}`), requestData);
      
      // Add to current user's pending requests
      await set(ref(realtimeDb, `users/${user.uid}/pendingRequests/${targetUserId}`), {
        to: targetUserId,
        timestamp: Date.now(),
        status: 'pending'
      });

      // Remove from search results
      setSearchResults(prev => prev.filter(u => u.uid !== targetUserId));
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  // Accept friend request
  const acceptFriendRequest = async (requestUserId) => {
    if (!user) return;

    try {
      const requestData = friendRequests.find(r => r.uid === requestUserId);
      if (!requestData) return;

      // Add to current user's friends
      await set(ref(realtimeDb, `users/${user.uid}/friends/${requestUserId}`), {
        displayName: requestData.fromDisplayName,
        email: requestData.fromEmail,
        addedAt: Date.now()
      });

      // Add current user to requester's friends
      await set(ref(realtimeDb, `users/${requestUserId}/friends/${user.uid}`), {
        displayName: user.displayName,
        email: user.email,
        addedAt: Date.now()
      });

      // Remove friend request
      await remove(ref(realtimeDb, `users/${user.uid}/friendRequests/${requestUserId}`));
      
      // Remove pending request from requester
      await remove(ref(realtimeDb, `users/${requestUserId}/pendingRequests/${user.uid}`));
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  // Reject friend request
  const rejectFriendRequest = async (requestUserId) => {
    if (!user) return;

    try {
      // Remove friend request
      await remove(ref(realtimeDb, `users/${user.uid}/friendRequests/${requestUserId}`));
      
      // Remove pending request from requester
      await remove(ref(realtimeDb, `users/${requestUserId}/pendingRequests/${user.uid}`));
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  // Remove friend
  const removeFriend = async (friendId) => {
    if (!user) return;

    try {
      // Remove from current user's friends
      await remove(ref(realtimeDb, `users/${user.uid}/friends/${friendId}`));
      
      // Remove current user from friend's friends
      await remove(ref(realtimeDb, `users/${friendId}/friends/${user.uid}`));
      
      // Clear selected friend if it's the removed one
      if (selectedFriend?.uid === friendId) {
        setSelectedFriend(null);
      }
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  // Send message
  const sendMessage = async (content, recipientId, isGroup = false) => {
    console.log('=== sendMessage called ===');
    console.log('Content:', content);
    console.log('RecipientId:', recipientId);
    console.log('IsGroup:', isGroup);
    console.log('Timestamp:', Date.now());
    console.log('User:', user?.uid);
    
    if (!user || !content.trim()) {
      console.log('Early return - no user or empty content');
      return;
    }

    try {
      const messageData = {
        content: content.trim(),
        sender: user.uid,
        senderDisplayName: user.displayName,
        timestamp: Date.now(),
        read: false
      };

      console.log('Sending message to Firebase:', messageData);

      if (isGroup) {
        // Send group message
        const groupMessageRef = ref(realtimeDb, `groupMessages/${recipientId}`);
        await push(groupMessageRef, messageData);
        console.log('Group message sent to Firebase');
      } else {
        // Send direct message
        const chatId = [user.uid, recipientId].sort().join('_');
        const messageRef = ref(realtimeDb, `messages/${chatId}`);
        await push(messageRef, messageData);
        console.log('Direct message sent to Firebase, chatId:', chatId);
      }

      console.log('Message sent successfully');
      
      // Stop typing
      stopTyping(recipientId, isGroup);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (friendId, isGroup = false) => {
    if (!user) return;

    try {
      if (isGroup) {
        // Mark group messages as read
        const groupMessagesRef = ref(realtimeDb, `groupMessages/${friendId}`);
        const snapshot = await get(groupMessagesRef);
        if (snapshot.exists()) {
          const updates = {};
          snapshot.forEach((childSnapshot) => {
            const message = childSnapshot.val();
            if (message.sender !== user.uid && !message.read) {
              updates[`${childSnapshot.key}/read`] = true;
            }
          });
          if (Object.keys(updates).length > 0) {
            await update(groupMessagesRef, updates);
          }
        }
      } else {
        // Mark direct messages as read
        const chatId = [user.uid, friendId].sort().join('_');
        const messagesRef = ref(realtimeDb, `messages/${chatId}`);
        const snapshot = await get(messagesRef);
        if (snapshot.exists()) {
          const updates = {};
          snapshot.forEach((childSnapshot) => {
            const message = childSnapshot.val();
            if (message.sender !== user.uid && !message.read) {
              updates[`${childSnapshot.key}/read`] = true;
            }
          });
          if (Object.keys(updates).length > 0) {
            await update(messagesRef, updates);
          }
        }
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Start typing
  const startTyping = (recipientId, isGroup = false) => {
    if (!user) return;

    const typingData = {
      timestamp: Date.now(),
      isGroup
    };

    if (isGroup) {
      set(ref(realtimeDb, `typing/${recipientId}/${user.uid}`), typingData);
    } else {
      set(ref(realtimeDb, `typing/${recipientId}/${user.uid}`), typingData);
    }
  };

  // Stop typing
  const stopTyping = (recipientId, isGroup = false) => {
    if (!user) return;

    if (isGroup) {
      remove(ref(realtimeDb, `typing/${recipientId}/${user.uid}`));
    } else {
      remove(ref(realtimeDb, `typing/${recipientId}/${user.uid}`));
    }
  };

  // Create group
  const createGroup = async (groupName, memberIds) => {
    if (!user || !groupName.trim() || memberIds.length === 0) return;

    try {
      const groupData = {
        name: groupName.trim(),
        createdBy: user.uid,
        createdAt: Date.now(),
        members: {
          [user.uid]: {
            displayName: user.displayName,
            email: user.email,
            role: 'admin',
            joinedAt: Date.now()
          }
        }
      };

      // Add other members
      memberIds.forEach(memberId => {
        groupData.members[memberId] = {
          displayName: friends.find(f => f.uid === memberId)?.displayName || 'Unknown',
          email: friends.find(f => f.uid === memberId)?.email || 'unknown@email.com',
          role: 'member',
          joinedAt: Date.now()
        };
      });

      // Create group
      const groupRef = ref(realtimeDb, 'groups');
      const newGroupRef = push(groupRef);
      await set(newGroupRef, groupData);

      const groupId = newGroupRef.key;

      // Add group to all members' user profiles
      const memberUpdates = {};
      Object.keys(groupData.members).forEach(memberId => {
        memberUpdates[`users/${memberId}/groups/${groupId}`] = {
          name: groupData.name,
          role: groupData.members[memberId].role,
          joinedAt: groupData.members[memberId].joinedAt
        };
      });

      await update(ref(realtimeDb), memberUpdates);

      return groupId;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  };

  // Leave group
  const leaveGroup = async (groupId) => {
    if (!user) return;

    try {
      // Remove from user's groups
      await remove(ref(realtimeDb, `users/${user.uid}/groups/${groupId}`));
      
      // Remove from group members
      await remove(ref(realtimeDb, `groups/${groupId}/members/${user.uid}`));
      
      // Clear selected group if it's the current one
      if (selectedGroup?.groupId === groupId) {
        setSelectedGroup(null);
      }
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  // Invite user to group
  const inviteToGroup = async (groupId, targetUserId) => {
    if (!user) return;

    try {
      const inviteData = {
        groupId,
        groupName: groups.find(g => g.groupId === groupId)?.name || 'Unknown Group',
        from: user.uid,
        fromDisplayName: user.displayName,
        timestamp: Date.now(),
        status: 'pending'
      };

      // Add group invite to target user
      await set(ref(realtimeDb, `users/${targetUserId}/groupInvites/${groupId}`), inviteData);
    } catch (error) {
      console.error('Error inviting user to group:', error);
    }
  };

  // Accept group invite
  const acceptGroupInvite = async (groupId) => {
    if (!user) return;

    try {
      const inviteData = groupInvites.find(invite => invite.groupId === groupId);
      if (!inviteData) return;

      // Get group data
      const groupRef = ref(realtimeDb, `groups/${groupId}`);
      const groupSnapshot = await get(groupRef);
      if (groupSnapshot.exists()) {
        const groupData = groupSnapshot.val();
        
        // Add user to group members
        const memberData = {
          displayName: user.displayName,
          email: user.email,
          role: 'member',
          joinedAt: Date.now()
        };

        // Update group members
        await set(ref(realtimeDb, `groups/${groupId}/members/${user.uid}`), memberData);
        
        // Add group to user's groups
        await set(ref(realtimeDb, `users/${user.uid}/groups/${groupId}`), {
          name: groupData.name,
          role: 'member',
          joinedAt: Date.now()
        });
        
        // Remove group invite
        await remove(ref(realtimeDb, `users/${user.uid}/groupInvites/${groupId}`));
      }
    } catch (error) {
      console.error('Error accepting group invite:', error);
    }
  };

  // Reject group invite
  const rejectGroupInvite = async (groupId) => {
    if (!user) return;

    try {
      // Remove group invite
      await remove(ref(realtimeDb, `users/${user.uid}/groupInvites/${groupId}`));
    } catch (error) {
      console.error('Error rejecting group invite:', error);
    }
  };

  // Get group members
  const getGroupMembers = async (groupId) => {
    if (!groupId) return [];

    try {
      const groupRef = ref(realtimeDb, `groups/${groupId}/members`);
      const snapshot = await get(groupRef);
      
      if (snapshot.exists()) {
        const members = [];
        snapshot.forEach((childSnapshot) => {
          members.push({
            uid: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        return members;
      }
      return [];
    } catch (error) {
      console.error('Error getting group members:', error);
      throw error;
    }
  };

  // Add member to group
  const addMemberToGroup = async (groupId, memberId) => {
    if (!user || !groupId || !memberId) return;

    try {
      // Check if user is a member of the group
      const userGroupRef = ref(realtimeDb, `users/${user.uid}/groups/${groupId}`);
      const userGroupSnapshot = await get(userGroupRef);
      
      if (!userGroupSnapshot.exists()) {
        throw new Error('You are not a member of this group');
      }

      // Get friend data
      const friendRef = ref(realtimeDb, `users/${memberId}`);
      const friendSnapshot = await get(friendRef);
      
      if (!friendSnapshot.exists()) {
        throw new Error('User not found');
      }

      const friendData = friendSnapshot.val();

      // Add member to group
      const memberData = {
        displayName: friendData.displayName,
        email: friendData.email,
        role: 'member',
        joinedAt: Date.now()
      };

      await set(ref(realtimeDb, `groups/${groupId}/members/${memberId}`), memberData);

      // Add group to user's groups
      await set(ref(realtimeDb, `users/${memberId}/groups/${groupId}`), {
        name: groups.find(g => g.groupId === groupId)?.name || 'Unknown Group',
        role: 'member',
        joinedAt: Date.now()
      });

    } catch (error) {
      console.error('Error adding member to group:', error);
      throw error;
    }
  };

  // Remove member from group
  const removeMemberFromGroup = async (groupId, memberId) => {
    if (!user || !groupId || !memberId) return;

    try {
      // Check if user is admin of the group
      const userGroupRef = ref(realtimeDb, `users/${user.uid}/groups/${groupId}`);
      const userGroupSnapshot = await get(userGroupRef);
      
      if (!userGroupSnapshot.exists()) {
        throw new Error('You are not a member of this group');
      }

      const userRole = userGroupSnapshot.val().role;
      if (userRole !== 'admin') {
        throw new Error('Only admins can remove members');
      }

      // Check if trying to remove the group creator
      const groupRef = ref(realtimeDb, `groups/${groupId}`);
      const groupSnapshot = await get(groupRef);
      
      if (groupSnapshot.exists()) {
        const groupData = groupSnapshot.val();
        if (groupData.createdBy === memberId) {
          throw new Error('Cannot remove the group creator');
        }
      }

      // Remove member from group
      await remove(ref(realtimeDb, `groups/${groupId}/members/${memberId}`));

      // Remove group from user's groups
      await remove(ref(realtimeDb, `users/${memberId}/groups/${groupId}`));

    } catch (error) {
      console.error('Error removing member from group:', error);
      throw error;
    }
  };

  const value = {
    friends,
    friendRequests,
    pendingRequests,
    selectedFriend,
    selectedGroup,
    searchResults,
    isSearching,
    messages,
    groupMessages,
    typing,
    groups,
    groupInvites,
    setSelectedFriend,
    setSelectedGroup,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    sendMessage,
    markMessagesAsRead,
    startTyping,
    stopTyping,
    createGroup,
    leaveGroup,
    inviteToGroup,
    acceptGroupInvite,
    rejectGroupInvite,
    getGroupMembers,
    addMemberToGroup,
    removeMemberFromGroup
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 