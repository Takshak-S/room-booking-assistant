import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth, useUser } from "@clerk/clerk-react";

const AuthContext = createContext(null);

const CACHE_KEY = "rba_profile";
const API_BASE = "http://localhost:5000";

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(profile) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

function clearCache() {
  localStorage.removeItem(CACHE_KEY);
}

export function AuthProvider({ children }) {
  const { getToken, isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();

  const [profile, setProfile] = useState(readCache);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!isSignedIn) {
      setProfile(null);
      clearCache();
      setLoading(false);
      return;
    }

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setProfile(null);
        clearCache();
        setLoading(false);
        return;
      }

      const data = await res.json();
      setProfile(data);
      writeCache(data);
    } catch {
      setProfile(null);
      clearCache();
    }

    setLoading(false);
  }, [isSignedIn, getToken]);

  // Fetch profile when auth state changes
  useEffect(() => {
    if (!authLoaded || !userLoaded) return;
    fetchProfile();
  }, [authLoaded, userLoaded, isSignedIn, fetchProfile]);

  const refreshProfile = useCallback(async () => {
    setLoading(true);
    await fetchProfile();
  }, [fetchProfile]);

  const value = {
    profile, // { id, role, approved, name, email, mobileNumber } or null
    loading, // true while fetching
    isSignedIn, // Clerk sign-in state
    clerkUser, // raw Clerk user object
    refreshProfile,
    clearProfile: () => {
      setProfile(null);
      clearCache();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAppAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAppAuth must be inside <AuthProvider>");
  return ctx;
}
