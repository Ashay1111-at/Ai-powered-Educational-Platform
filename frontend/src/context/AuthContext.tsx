"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  AuthProvider
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import api from "../lib/api";

interface AuthContextType {
  user: User | null;
  dbUser: any | null; // Database user with roles etc
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  dbUser: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  registerWithEmail: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProviderContext = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Sync with our backend to get role and DB user info
        try {
          // Check for a pending role in localStorage (set during registration)
          const pendingRole = localStorage.getItem("pendingRole");
          
          const response = await api.post("/users/sync", {
            email: currentUser.email,
            name: currentUser.displayName,
            firebaseUid: currentUser.uid,
            role: pendingRole || undefined, // Only send if explicitly selected during registration
          });

          // Clear the pending role once synced
          if (pendingRole) {
            localStorage.removeItem("pendingRole");
          }

          setDbUser(response.data);
          console.log("User synced with DB. Role:", response.data.role);
        } catch (error) {
          console.error("Failed to sync user with DB", error);
        }
      } else {
        setUser(null);
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) {
      console.error("Firebase Auth not initialized");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.warn("Sign-in popup closed by user");
        return;
      }
      console.error("Error signing in with Google", error);
      throw error;
    }
  };
  
  const signInWithEmail = async (email: string, pass: string) => {
    if (!auth) return;
    const { signInWithEmailAndPassword } = await import("firebase/auth");
    await signInWithEmailAndPassword(auth, email, pass);
  };
  
  const registerWithEmail = async (email: string, pass: string, name: string, role: string) => {
    if (!auth) return;
    const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, { displayName: name });
    
    // Set the role in localStorage for sync
    localStorage.setItem("pendingRole", role);
    
    // Trigger sync immediately if needed, but onAuthStateChanged will handle it too
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, loading, signInWithGoogle, signInWithEmail, registerWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
