import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, set, push, onValue, off, get } from 'firebase/database';
import { realtimeDb } from '../../../firebase';
import { useAuth } from '../../auth/context/AuthContext';
import Swal from 'sweetalert2';

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
  const [messages, setMessages] = useState({});
  const [typing, setTyping] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Listen to friends list when user is authenticated
  useEffect(() => {
    if (!user) return;

    // Listen to friends list
    const friendsRef = ref(realtimeDb, `users/${user.uid}/friends`);
    const friendsListener = onValue(friendsRef, (snapshot) => {
      if (snapshot.exists()) {
        const friendsData = snapshot.val();
        const friendsList = Object.keys(friendsData).map(friendId => ({
          uid: friendId,
          ...friendsData[friendId]
        }));
        setFriends(friendsList);
      } else {
        setFriends([]);
      }
    });

    // Listen to incoming friend requests
    const requestsRef = ref(realtimeDb, `users/${user.uid}/friendRequests`);
    const requestsListener = onValue(requestsRef, (snapshot) => {
      if (snapshot.exists()) {
        const requestsData = snapshot.val();
        const requestsList = Object.keys(requestsData).map(requestId => ({
          id: requestId,
          ...requestsData[requestId]
        }));
        setFriendRequests(requestsList);
      } else {
        setFriendRequests([]);
      }
    });

    // Listen to pending friend requests (sent by current user)
    const pendingRef = ref(realtimeDb, `users/${user.uid}/pendingRequests`);
    const pendingListener = onValue(pendingRef, (snapshot) => {
      if (snapshot.exists()) {
        const pendingData = snapshot.val();
        const pendingList = Object.keys(pendingData).map(requestId => ({
          id: requestId,
          ...pendingData[requestId]
        }));
        setPendingRequests(pendingList);
      } else {
        setPendingRequests([]);
      }
    });

    return () => {
      off(friendsRef, 'value', friendsListener);
      off(requestsRef, 'value', requestsListener);
      off(pendingRef, 'value', pendingListener);
    };
  }, [user]);

  // Listen to real-time messages from Realtime Database when user is authenticated
  useEffect(() => {
    if (!user) return;

    console.log('🔍 Setting up message listener for user:', user.uid);

    // Set up real-time listener for messages
    const messagesRef = ref(realtimeDb, 'messages');
    
    const handleMessagesChange = (snapshot) => {
      console.log('🔍 Message listener triggered:', snapshot.exists());
      
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        console.log('🔍 Raw messages data:', messagesData);
        
        const newMessages = {};
        
        Object.keys(messagesData).forEach(messageId => {
          const message = messagesData[messageId];
          const chatId = message.chatId;
          
          if (!newMessages[chatId]) {
            newMessages[chatId] = [];
          }
          newMessages[chatId].push({
            id: messageId,
            ...message
          });
        });
        
        // Sort messages by timestamp within each chat
        Object.keys(newMessages).forEach(chatId => {
          newMessages[chatId].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        });
        
        console.log('🔍 Processed messages:', newMessages);
        setMessages(newMessages);
      } else {
        console.log('🔍 No messages found');
        setMessages({});
      }
    };

    onValue(messagesRef, handleMessagesChange);

    return () => {
      off(messagesRef, 'value', handleMessagesChange);
    };
  }, [user]);

  // Add typing indicator functionality
  const startTyping = (friendId) => {
    if (!user || !friendId) return;
    
    const typingRef = ref(realtimeDb, `typing/${friendId}/${user.uid}`);
    set(typingRef, {
      userId: user.uid,
      displayName: user.displayName,
      timestamp: new Date().toISOString()
    });
  };

  const stopTyping = (friendId) => {
    if (!user || !friendId) return;
    
    const typingRef = ref(realtimeDb, `typing/${friendId}/${user.uid}`);
    set(typingRef, null);
  };

  // Listen to typing indicators
  useEffect(() => {
    if (!user) return;

    const typingRef = ref(realtimeDb, `typing/${user.uid}`);
    
    const handleTypingChange = (snapshot) => {
      if (snapshot.exists()) {
        const typingData = snapshot.val();
        const newTyping = {};
        
        Object.keys(typingData).forEach(typingUserId => {
          const typingInfo = typingData[typingUserId];
          // Only show typing if it's recent (within last 5 seconds)
          const isRecent = (new Date() - new Date(typingInfo.timestamp)) < 5000;
          if (isRecent) {
            newTyping[typingUserId] = typingInfo;
          }
        });
        
        setTyping(newTyping);
      } else {
        setTyping({});
      }
    };

    onValue(typingRef, handleTypingChange);

    return () => {
      off(typingRef, 'value', handleTypingChange);
    };
  }, [user]);

  // Search for users by display name or email
  const searchUsers = async (searchTerm) => {
    if (!searchTerm.trim() || !user) return;
    
    setIsSearching(true);
    setSearchResults([]);

    try {
      // Get all users and filter locally since Realtime Database doesn't support complex queries like Firestore
      const usersRef = ref(realtimeDb, 'users');
      
      const snapshot = await get(usersRef);
      const results = [];

      if (snapshot.exists()) {
        const usersData = snapshot.val();
        
        Object.keys(usersData).forEach(userId => {
          const userData = usersData[userId];
          
          // Skip current user
          if (userId === user.uid) return;
          
          // Check if already a friend
          if (isFriend(userId)) return;
          
          // Check if there's a pending request
          if (hasPendingRequest(userId)) return;
          
          // Search by display name (case-insensitive)
          const displayNameMatch = userData.displayName && 
            userData.displayName.toLowerCase().includes(searchTerm.toLowerCase());
          
          // Search by email (case-insensitive)
          const emailMatch = userData.email && 
            userData.email.toLowerCase().includes(searchTerm.toLowerCase());
          
          if (displayNameMatch || emailMatch) {
            results.push({
              uid: userId,
              displayName: userData.displayName,
              email: userData.email,
              avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.displayName}`
            });
          }
        });
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Check if user is already a friend
  const isFriend = (userId) => {
    return friends.some(friend => friend.uid === userId);
  };

  // Check if there's a pending request
  const hasPendingRequest = (userId) => {
    return pendingRequests.some(request => request.toUserId === userId);
  };

  // Send friend request
  const sendFriendRequest = async (toUserId, toUserData) => {
    if (!user || !toUserId) return;

    try {
      const requestId = push(ref(realtimeDb, 'friendRequests')).key;
      const requestData = {
        fromUserId: user.uid,
        fromUserDisplayName: user.displayName,
        fromUserEmail: user.email,
        toUserId: toUserId,
        toUserDisplayName: toUserData.displayName,
        toUserEmail: toUserData.email,
        status: 'pending',
        timestamp: new Date().toISOString()
      };

      // Add to recipient's friend requests
      await set(ref(realtimeDb, `users/${toUserId}/friendRequests/${requestId}`), requestData);
      
      // Add to sender's pending requests
      await set(ref(realtimeDb, `users/${user.uid}/pendingRequests/${requestId}`), requestData);

      // Show success notification
      await Swal.fire({
        icon: 'success',
        title: 'Friend Request Sent!',
        text: `Friend request sent to ${toUserData.displayName}`,
        timer: 2000,
        showConfirmButton: false,
        confirmButtonColor: '#6366f1'
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending friend request:', error);
      
      // Show error notification
      await Swal.fire({
        icon: 'error',
        title: 'Failed to Send Request',
        text: 'An error occurred while sending the friend request. Please try again.',
        confirmButtonColor: '#ef4444'
      });

      return { success: false, error: 'Failed to send friend request' };
    }
  };

  // Accept friend request
  const acceptFriendRequest = async (requestId, requestData) => {
    if (!user) return;

    try {
      const { fromUserId, fromUserDisplayName, fromUserEmail } = requestData;

      // Add to current user's friends list
      await set(ref(realtimeDb, `users/${user.uid}/friends/${fromUserId}`), {
        uid: fromUserId,
        displayName: fromUserDisplayName,
        email: fromUserEmail,
        addedAt: new Date().toISOString()
      });

      // Add current user to requester's friends list
      await set(ref(realtimeDb, `users/${fromUserId}/friends/${user.uid}`), {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        addedAt: new Date().toISOString()
      });

      // Remove the request from both users
      await set(ref(realtimeDb, `users/${user.uid}/friendRequests/${requestId}`), null);
      await set(ref(realtimeDb, `users/${fromUserId}/pendingRequests/${requestId}`), null);

      // Show success notification
      await Swal.fire({
        icon: 'success',
        title: 'Friend Added!',
        text: `${fromUserDisplayName} is now your friend!`,
        timer: 2000,
        showConfirmButton: false,
        confirmButtonColor: '#6366f1'
      });

      return { success: true };
    } catch (error) {
      console.error('Error accepting friend request:', error);
      
      // Show error notification
      await Swal.fire({
        icon: 'error',
        title: 'Failed to Accept Request',
        text: 'An error occurred while accepting the friend request. Please try again.',
        confirmButtonColor: '#ef4444'
      });

      return { success: false, error: 'Failed to accept friend request' };
    }
  };

  // Reject friend request
  const rejectFriendRequest = async (requestId) => {
    if (!user) return;

    try {
      // Remove the request from current user
      await set(ref(realtimeDb, `users/${user.uid}/friendRequests/${requestId}`), null);

      // Show success notification
      await Swal.fire({
        icon: 'success',
        title: 'Request Rejected',
        text: 'Friend request has been rejected.',
        timer: 2000,
        showConfirmButton: false,
        confirmButtonColor: '#6366f1'
      });

      return { success: true };
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      
      // Show error notification
      await Swal.fire({
        icon: 'error',
        title: 'Failed to Reject Request',
        text: 'An error occurred while rejecting the friend request. Please try again.',
        confirmButtonColor: '#ef4444'
      });

      return { success: false, error: 'Failed to reject friend request' };
    }
  };

  // Remove friend
  const removeFriend = async (friendId) => {
    if (!user) return;

    try {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: 'Remove Friend?',
        text: "Are you sure you want to remove this friend? This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Yes, remove!'
      });

      if (!result.isConfirmed) {
        return { success: false, error: 'Cancelled' };
      }

      // Remove from current user's friends list
      await set(ref(realtimeDb, `users/${user.uid}/friends/${friendId}`), null);
      
      // Remove current user from friend's friends list
      await set(ref(realtimeDb, `users/${friendId}/friends/${user.uid}`), null);

      // Clear messages with this friend
      setMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[`${user.uid}_${friendId}`];
        delete newMessages[`${friendId}_${user.uid}`];
        return newMessages;
      });

      // Clear selected friend if it's the removed one
      if (selectedFriend?.uid === friendId) {
        setSelectedFriend(null);
      }

      // Show success notification
      await Swal.fire({
        icon: 'success',
        title: 'Friend Removed',
        text: 'Friend has been removed successfully.',
        timer: 2000,
        showConfirmButton: false,
        confirmButtonColor: '#6366f1'
      });

      return { success: true };
    } catch (error) {
      console.error('Error removing friend:', error);
      
      // Show error notification
      await Swal.fire({
        icon: 'error',
        title: 'Failed to Remove Friend',
        text: 'An error occurred while removing the friend. Please try again.',
        confirmButtonColor: '#ef4444'
      });

      return { success: false, error: 'Failed to remove friend' };
    }
  };

  const sendMessage = async (friendId, text) => {
    if (!text.trim() || !user) return;

    const chatId = [user.uid, friendId].sort().join('_');
    console.log('🔍 Sending message:', {
      friendId,
      text,
      chatId,
      userUid: user.uid
    });

    const newMessage = {
      text: text.trim(),
      sender: user.uid,
      senderName: user.displayName || 'User',
      chatId,
      timestamp: new Date().toISOString(),
      read: false
    };

    try {
      // Add message to Realtime Database
      const messagesRef = ref(realtimeDb, 'messages');
      const newMessageRef = push(messagesRef);
      await set(newMessageRef, newMessage);
      
      // Update the message with the generated ID
      newMessage.id = newMessageRef.key;
      console.log('🔍 Message sent to DB with ID:', newMessageRef.key);
      
      // Add to local state immediately for instant feedback
      setMessages(prev => {
        const updatedMessages = {
          ...prev,
          [chatId]: [...(prev[chatId] || []), { ...newMessage, id: newMessageRef.key }]
        };
        console.log('🔍 Updated local messages:', updatedMessages);
        return updatedMessages;
      });
      
      // Stop typing when message is sent
      stopTyping(friendId);
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback to local state if database fails
      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), { ...newMessage, id: Date.now() }]
      }));
    }
  };

  const markMessagesAsRead = async (friendId) => {
    const chatId = [user.uid, friendId].sort().join('_');
    
    // Mark messages as read locally
    setMessages(prev => ({
      ...prev,
      [chatId]: (prev[chatId] || []).map(msg => ({
        ...msg,
        read: msg.sender === friendId ? true : msg.read
      }))
    }));

    // Update read status in database for messages from friend
    try {
      const messagesRef = ref(realtimeDb, 'messages');
      const snapshot = await get(messagesRef);
      
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const updatePromises = [];
        
        Object.keys(messagesData).forEach(messageId => {
          const message = messagesData[messageId];
          if (message.chatId === chatId && message.sender === friendId && !message.read) {
            updatePromises.push(
              set(ref(realtimeDb, `messages/${messageId}`), {
                ...message,
                read: true
              })
            );
          }
        });
        
        if (updatePromises.length > 0) {
          await Promise.all(updatePromises);
        }
      }
    } catch (error) {
      console.error('Error updating read status:', error);
    }
  };

  const value = {
    friends,
    friendRequests,
    pendingRequests,
    selectedFriend,
    setSelectedFriend,
    messages,
    typing,
    searchResults,
    isSearching,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    sendMessage,
    markMessagesAsRead,
    startTyping,
    stopTyping
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 