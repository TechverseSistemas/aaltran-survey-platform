"use client";

import React, { ReactNode, useEffect, useState } from 'react';
import { onAuthStateChanged, getAuth, User, signOut } from 'firebase/auth';
import { AuthContext } from './authContext';
import app from '@/lib/firebase/firebase-auth';
import { LucideLoader2 } from 'lucide-react';

interface AuthContextProviderProps {
  children: ReactNode;
}
const auth = getAuth(app);
export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children }) => {
  const [userAuth, setUserAuth] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (AuthCredentials: User | null) => {
      setUserAuth(AuthCredentials);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUserAuth(null);
  };

  return (
    <AuthContext.Provider value={{ userAuth, logout }}>
      {loading ? (
        <LucideLoader2 className="h-12 w-12 animate-spin text-primary fixed inset-0 m-auto" />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
export default AuthContextProvider;
