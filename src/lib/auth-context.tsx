'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './firebase-client';
import type { UserProfileData, SubscriptionStatus } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profile: UserProfileData | null;
  profileLoading: boolean;
  hasProfile: boolean;
  refreshProfile: () => Promise<void>;
  plan: 'free' | 'pro';
  subscription: SubscriptionStatus | null;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  profile: null,
  profileLoading: true,
  hasProfile: false,
  refreshProfile: async () => {},
  plan: 'free',
  subscription: null,
  refreshSubscription: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);

  const fetchProfileData = useCallback(async (currentUser: User) => {
    setProfileLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile || null);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const fetchSubscriptionData = useCallback(async (currentUser: User) => {
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/stripe/subscription', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfileData(user);
    }
  }, [user, fetchProfileData]);

  const refreshSubscription = useCallback(async () => {
    if (user) {
      await fetchSubscriptionData(user);
    }
  }, [user, fetchSubscriptionData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        fetchProfileData(u);
        fetchSubscriptionData(u);
      } else {
        setProfile(null);
        setProfileLoading(false);
        setSubscription(null);
      }
    });
    return unsubscribe;
  }, [fetchProfileData, fetchSubscriptionData]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        profile,
        profileLoading,
        hasProfile: profile !== null,
        refreshProfile,
        plan: subscription?.plan || 'free',
        subscription,
        refreshSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
