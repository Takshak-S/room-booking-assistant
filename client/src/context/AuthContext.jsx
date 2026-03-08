import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth, useUser, useClerk } from "@clerk/clerk-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

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
  const [authError, setAuthError] = useState(null); 
  const { signOut } = useClerk();

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
        if (res.status === 403) {
          setAuthError("domain");
        }
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

  
  useEffect(() => {
    if (!authLoaded || !userLoaded) return;
    fetchProfile();
  }, [authLoaded, userLoaded, isSignedIn, fetchProfile]);

  const refreshProfile = useCallback(async () => {
    setLoading(true);
    await fetchProfile();
  }, [fetchProfile]);

  const value = {
    profile, 
    loading, 
    isSignedIn, 
    clerkUser, 
    refreshProfile,
    clearProfile: () => {
      setProfile(null);
      clearCache();
    },
  };

  const handleSignOut = async () => {
    setAuthError(null);
    await signOut();
    clearCache();
    setProfile(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthErrorDialog
        open={authError === "domain"}
        onSignOut={handleSignOut}
      />
    </AuthContext.Provider>
  );
}

function AuthErrorDialog({ open, onSignOut }) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md border-zinc-800 bg-zinc-950 text-foreground"
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-900/20 text-red-500">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-bold">
            Unauthorized Domain
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-400">
            Your email domain is not authorized to access this portal. Please
            sign in using your{" "}
            <span className="text-zinc-200 font-medium">University Email</span>{" "}
            account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            className="w-full bg-red-600 hover:bg-red-700 font-bold"
            onClick={onSignOut}
          >
            Back
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useAppAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAppAuth must be inside <AuthProvider>");
  return ctx;
}
