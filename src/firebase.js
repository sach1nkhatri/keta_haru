// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD3XCiQvYzK41XhobNyj1MRcYMuYusb8Qk",
  authDomain: "stayfit-ad0e0.firebaseapp.com",
  databaseURL: "https://stayfit-ad0e0-default-rtdb.firebaseio.com",
  projectId: "stayfit-ad0e0",
  storageBucket: "stayfit-ad0e0.appspot.com",
  messagingSenderId: "430292836279",
  appId: "1:430292836279:web:66b800b43eb71163c99232",
  measurementId: "G-1MDLJWLDGR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Analytics is initialized but not exported since it's not used yet
getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);

export default app;