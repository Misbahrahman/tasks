// src/firebase/auth.js
import { 
    getAuth, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail
  } from 'firebase/auth';
  import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
  import { db } from './config';
  
  const auth = getAuth();
  
  // Settings for email link sign in
  const actionCodeSettings = {
    url: window.location.origin + '/login',
    handleCodeInApp: true,
  };
  
  export const authService = {
    // Regular email/password registration
    register: async (email, password, displayName, role) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update user profile with display name
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
        
        // Create user document in Firestore
        const userDoc = doc(db, 'users', userCredential.user.uid);
        const month = new Date().toLocaleString('default', { month: 'long' });
        const year = new Date().getFullYear();
        
        await setDoc(userDoc, {
          id: userCredential.user.uid,
          name: displayName,
          email: email,
          role: role || "Team Member",
          joinDate: `${month} ${year}`,
          avatarColor: "blue", // Default color
          initials: displayName
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          metrics: {
            tasksCompleted: 0,
            activeProjects: 0,
            avgResponseTime: "0d",
            totalProjects: 0,
            totalTasks: 0,
            completionRate: 0
          },
          preferences: {
            notifications: {
              email: true,
              push: true,
              taskAssigned: true,
              taskDue: true,
              projectUpdates: true
            },
            theme: "light"
          },
          status: "active"
        });
  
        return userCredential.user;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  
    // Regular email/password login
    login: async (email, password) => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  
    // Passwordless email link sign in - Step 1: Send link
    sendSignInLink: async (email) => {
      try {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        // Save email to localStorage for step 2
        localStorage.setItem('emailForSignIn', email);
      } catch (error) {
        throw new Error(error.message);
      }
    },
  
    // Passwordless email link sign in - Step 2: Complete sign in
    completeSignInWithEmailLink: async () => {
      try {
        if (!isSignInWithEmailLink(auth, window.location.href)) {
          return null;
        }
  
        let email = localStorage.getItem('emailForSignIn');
        if (!email) {
          // If email not found in localStorage, ask user for it
          email = window.prompt('Please provide your email for confirmation');
        }
  
        const result = await signInWithEmailLink(auth, email, window.location.href);
        localStorage.removeItem('emailForSignIn');
        return result.user;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  
    // Password reset
    resetPassword: async (email) => {
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (error) {
        throw new Error(error.message);
      }
    },
  
    // Logout
    logout: async () => {
      try {
        await signOut(auth);
      } catch (error) {
        throw new Error(error.message);
      }
    },
  
    // Get current user
    getCurrentUser: () => {
      return auth.currentUser;
    },
  
    // Auth state change listener
    onAuthStateChange: (callback) => {
      return onAuthStateChanged(auth, callback);
    }
  };