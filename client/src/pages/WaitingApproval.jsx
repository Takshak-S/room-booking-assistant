import { useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, LogOut } from "lucide-react";

function WaitingApproval() {
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-background to-background" />

      <Card className="relative z-10 w-full max-w-md border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Clock className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Waiting for Approval
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Your account has been registered successfully. An administrator
            needs to approve your access before you can use the portal.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pb-8">
          <p className="text-center text-sm text-muted-foreground">
            Please check back later or contact your administrator.
          </p>
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2 border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default WaitingApproval;
