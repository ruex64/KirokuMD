"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUser, createUser } from "@/lib/users";
import { AppUser } from "@/types/user";

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshAppUser: () => Promise<void>;
  isAdmin: boolean;
  isApproved: boolean;
  canCreateDocuments: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAppUser = async (firebaseUser: User) => {
    try {
      let userData = await getUser(firebaseUser.uid);
      
      // If user doesn't exist in our users collection, create them
      if (!userData) {
        await createUser(
          firebaseUser.uid,
          firebaseUser.email || "",
          firebaseUser.displayName
        );
        userData = await getUser(firebaseUser.uid);
      }
      
      setAppUser(userData);
    } catch (error) {
      console.error("Error fetching app user:", error);
      setAppUser(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        await fetchAppUser(firebaseUser);
      } else {
        setAppUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshAppUser = async () => {
    if (user) {
      await fetchAppUser(user);
    }
  };

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await fetchAppUser(result.user);
  };

  const signUp = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Create user record in Firestore
    await createUser(result.user.uid, email, null);
    await fetchAppUser(result.user);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await fetchAppUser(result.user);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setAppUser(null);
  };

  const isAdmin = appUser?.role === "admin" && appUser?.status === "approved";
  const isApproved = appUser?.status === "approved";
  const canCreateDocuments = isApproved && (appUser?.role === "admin" || appUser?.role === "owner");

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        appUser, 
        loading, 
        signIn, 
        signUp, 
        signInWithGoogle, 
        signOut,
        refreshAppUser,
        isAdmin,
        isApproved,
        canCreateDocuments,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
