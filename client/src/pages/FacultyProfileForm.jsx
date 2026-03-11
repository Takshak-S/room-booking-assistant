import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Loader2 } from "lucide-react";
import API_BASE_URL from "../lib/config";

function FacultyProfileForm() {
  const navigate = useNavigate();
  const { getToken, isSignedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  useEffect(() => {
    const runChecks = async () => {
      try {
        if (!isSignedIn) {
          navigate("/");
          return;
        }
        const token = await getToken();
        const res = await fetch(`${API_BASE_URL}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.role === "STUDENT") {
          navigate("/home");
          return;
        }
        if (json.role !== "FACULTY") {
          navigate("/");
          return;
        }
        setLoading(false);
      } catch {
        navigate("/");
      }
    };
    runChecks();
  }, [navigate, isSignedIn, getToken]);

  if (loading) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token) {
        navigate("/");
        return;
      }
      const res = await fetch(`${API_BASE_URL}/api/profile/faculty`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, mobile_number: mobileNumber }),
      });
      const json = await res.json();
      if (json.success) navigate("/home");
      else navigate("/");
    } catch {
      navigate("/");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

      <Card className="relative z-10 w-full max-w-md border-border bg-card/80 backdrop-blur-sm shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Faculty Profile
          </CardTitle>
          <CardDescription>
            Complete your faculty details to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default FacultyProfileForm;
