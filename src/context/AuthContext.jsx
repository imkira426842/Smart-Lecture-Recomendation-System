import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, apiConfig } from '../services/api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'learnpilot_auth';
const GUEST_KEY = 'learnpilot_guest';
const ONBOARDING_KEY = 'learnpilot_onboarded';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // authenticated user
  const [guest, setGuest] = useState(null);     // guest session
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const guestStored = localStorage.getItem(GUEST_KEY);
        const onboardedStored = localStorage.getItem(ONBOARDING_KEY);

        if (stored) {
          const parsed = JSON.parse(stored);
          // If backend is configured, refresh user data from /auth/me
          if (apiConfig.isConfigured && parsed.token) {
            try {
              const fresh = await authAPI.me();
              const refreshed = { ...parsed, ...fresh, token: parsed.token };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(refreshed));
              setUser(refreshed);
              // Sync onboarded state from backend
              if (fresh.onboarded) {
                localStorage.setItem(ONBOARDING_KEY, 'true');
                setOnboarded(true);
              }
            } catch {
              // Token expired or invalid — clear session
              localStorage.removeItem(STORAGE_KEY);
            }
          } else {
            setUser(parsed);
          }
        } else if (guestStored) {
          const parsed = JSON.parse(guestStored);
          setGuest(parsed);
        }

        if (onboardedStored) setOnboarded(true);
      } catch {
        // corrupt storage, clear it
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(GUEST_KEY);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const login = (userData, token) => {
    const session = { ...userData, token };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    localStorage.removeItem(GUEST_KEY);
    setUser(session);
    setGuest(null);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_KEY);
    setUser(null);
    setOnboarded(false);
  };

  const enterAsGuest = (prefs = {}) => {
    const guestSession = {
      id: 'guest',
      name: prefs.name || 'Guest Student',
      isGuest: true,
      ...prefs,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(GUEST_KEY, JSON.stringify(guestSession));
    setGuest(guestSession);
  };

  const updateGuestProfile = (prefs) => {
    const updated = { ...guest, ...prefs };
    localStorage.setItem(GUEST_KEY, JSON.stringify(updated));
    setGuest(updated);
  };

  const updateUser = (updates) => {
    if (user) {
      const updated = { ...user, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setUser(updated);
    } else if (guest) {
      updateGuestProfile(updates);
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setOnboarded(true);
  };

  const exitGuest = () => {
    localStorage.removeItem(GUEST_KEY);
    localStorage.removeItem(ONBOARDING_KEY);
    setGuest(null);
    setOnboarded(false);
  };

  const currentUser = user || guest;
  const isAuthenticated = !!user;
  const isGuest = !!guest && !user;
  const isLoggedIn = !!currentUser;

  return (
    <AuthContext.Provider value={{
      user: currentUser,
      isAuthenticated,
      isGuest,
      isLoggedIn,
      loading,
      onboarded,
      login,
      logout,
      exitGuest,
      enterAsGuest,
      updateUser,
      updateGuestProfile,
      completeOnboarding,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
