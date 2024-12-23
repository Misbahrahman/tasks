// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBg9wgP1gDbCmvhqIAHCybtJi0cr1l629M",
  authDomain: "irpc-tasks.firebaseapp.com",
  projectId: "irpc-tasks",
  storageBucket: "irpc-tasks.firebasestorage.app",
  messagingSenderId: "833702447501",
  appId: "1:833702447501:web:f5b515bc5b1ae3a8d295c4",
  measurementId: "G-RGWBBYQZ5S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { app , db, auth, analytics };