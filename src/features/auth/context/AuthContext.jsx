import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, realtimeDb } from '../../../firebase';
import Swal from 'sweetalert2';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Secret codes for registration
  const VALID_SECRET_CODES = ['9810392313', '9851044587'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get additional user data from Realtime Database
        try {
          const userRef = ref(realtimeDb, `users/${firebaseUser.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: userData.displayName || firebaseUser.displayName || 'User',
              ...userData
            });
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'User'
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'User'
          });
        }
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password, displayName, secretCode) => {
    try {
      // Validate secret code
      if (!VALID_SECRET_CODES.includes(secretCode)) {
        throw new Error('Invalid secret code. Please use one of the provided codes.');
      }

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, { displayName });

      // Save user data to Realtime Database
      const userRef = ref(realtimeDb, `users/${firebaseUser.uid}`);
      await set(userRef, {
        displayName,
        email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        secretCode: secretCode // Store which secret code was used
      });

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Account Created!',
        text: `Welcome to Ketaharu, ${displayName}!`,
        confirmButtonColor: '#6366f1'
      });

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      
      let errorMessage = 'An error occurred during signup.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email or try logging in.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (error.message.includes('secret code')) {
        errorMessage = error.message;
      }

      await Swal.fire({
        icon: 'error',
        title: 'Signup Failed',
        text: errorMessage,
        confirmButtonColor: '#ef4444'
      });

      return { success: false, error: errorMessage };
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update last login time in Realtime Database
      const userRef = ref(realtimeDb, `users/${firebaseUser.uid}/lastLogin`);
      await set(userRef, new Date().toISOString());

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Welcome Back!',
        text: `Hello, ${firebaseUser.displayName || 'User'}!`,
        timer: 2000,
        showConfirmButton: false,
        confirmButtonColor: '#6366f1'
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Invalid email or password.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }

      await Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: errorMessage,
        confirmButtonColor: '#ef4444'
      });

      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You will be logged out of your account.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Yes, logout!'
      });

      if (result.isConfirmed) {
        await signOut(auth);
        
        await Swal.fire({
          icon: 'success',
          title: 'Logged Out!',
          text: 'You have been successfully logged out.',
          timer: 2000,
          showConfirmButton: false,
          confirmButtonColor: '#6366f1'
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Logout Failed',
        text: 'An error occurred during logout. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 