import { useNavigate } from "react-router-dom";
import { useSignIn, useAuth } from "@clerk/clerk-react";
import { useAppAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Loader2 } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { signIn, isLoaded } = useSignIn();
  const { profile } = useAppAuth();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (isSignedIn && profile) {
      navigate(profile.role === "ADMIN" ? "/admin" : "/home");
    }
  }, [isSignedIn, profile, navigate]);

  const handleGoogleSignIn = async () => {
    if (!isLoaded || signingIn) return;
    setSigningIn(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/home",
      });
    } catch (err) {
      console.error("Google sign-in error:", err);
      setSigningIn(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/50 via-background to-background" />

      <Card className="relative z-10 w-full max-w-md border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            VITMAS Portal
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Room Booking Assistant — Sign in to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-8">
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-3 border-zinc-700 bg-zinc-900 py-6 text-base font-semibold hover:bg-zinc-800"
            onClick={handleGoogleSignIn}
            disabled={signingIn || !isLoaded}
          >
            {signingIn ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {signingIn ? "Redirecting…" : "Sign in with Google"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
