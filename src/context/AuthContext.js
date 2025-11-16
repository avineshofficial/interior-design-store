import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const createUserDocument = async (user, additionalData) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
        const userData = {
            uid: user.uid, email: user.email,
            displayName: additionalData?.displayName || user.displayName || 'New User',
            photoURL: user.photoURL || '', role: 'customer',
        };
        await setDoc(userRef, userData);
        setUserProfile(userData); // Set profile immediately after creation
    }
  };
  
  const refreshUserProfile = useCallback(async (userId) => {
    if (!userId) return;
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      setUserProfile(userDocSnap.data());
    } else {
      // If user is authenticated but has no profile, create it.
      const user = auth.currentUser;
      if(user) await createUserDocument(user);
    }
  }, []);

  async function signUp(email, password, displayName) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await createUserDocument(user, { displayName });
    return user;
  }
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }
  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithRedirect(auth, provider);
  }
  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    // This is the main listener for all authentication changes.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // When a user logs in, refresh their profile from Firestore.
        await refreshUserProfile(user.uid);
      } else {
        // When a user logs out, clear their profile.
        setUserProfile(null);
      }
      setLoading(false); // Set loading to false once the initial check is complete.
    });

    // Check for a redirect result from Google Sign-In when the app first loads.
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          // User has just signed in via redirect. Make sure their doc exists.
          await createUserDocument(result.user);
          await refreshUserProfile(result.user.uid); // Re-fetch profile after creation
        }
      })
      .catch((error) => console.error("Error processing redirect result:", error));
    
    // Cleanup the listener when the component unmounts
    return unsubscribe;
    
  // --- THIS IS THE FIX: 'loading' has been removed from the dependency array ---
  }, [refreshUserProfile]);


  const value = {
    currentUser,
    userProfile,
    loading,
    refreshUserProfile,
    login,
    logout,
    signUp,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};