import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Navbar from "../components/Navbar";
import {
  CalendarDays,
  Search,
  Zap,
  History,
  Shield,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Building2,
} from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Easy Scheduling",
    desc: "Book classrooms, labs, and seminar halls with just a few clicks. View real-time availability.",
  },
  {
    icon: Search,
    title: "Smart Search",
    desc: "Filter facilities by type, capacity, location, and amenities to find the perfect space.",
  },
  {
    icon: Zap,
    title: "Instant Confirmation",
    desc: "Get immediate booking confirmations and manage reservations from your dashboard.",
  },
  {
    icon: History,
    title: "Booking History",
    desc: "Track all your past and upcoming bookings. Edit or cancel reservations as needed.",
  },
  {
    icon: Shield,
    title: "Secure Access",
    desc: "Google OAuth ensures secure authentication with your institutional credentials.",
  },
  {
    icon: Smartphone,
    title: "Responsive Design",
    desc: "Access from any device — desktop, tablet, or mobile — with a seamless experience.",
  },
];

const benefits = [
  "Eliminate scheduling conflicts with real-time availability",
  "Save time with quick and efficient booking process",
  "Find the right facility with advanced filtering options",
  "Stay organized with booking history and management tools",
  "Access from anywhere, anytime with cloud-based system",
  "Designed for students, faculty, and administrative staff",
];

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl space-y-20 px-4 pb-20 pt-24">
        {}
        <section className="flex flex-col items-center space-y-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="h-8 w-8" />
          </div>

          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            VITMAS Room Booking Assistant
          </h1>

          <p className="max-w-lg text-lg text-muted-foreground">
            Streamline your facility reservations with our intelligent booking
            system. Find, book, and manage spaces effortlessly.
          </p>

          <Button
            size="lg"
            className="mt-2 gap-2 text-base"
            onClick={() => navigate("/dashboard")}
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </section>

        <Separator />

        {}
        <section className="space-y-10">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Key Features
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card
                key={f.title}
                className="border-zinc-800 bg-zinc-950/60 transition-colors hover:border-zinc-700"
              >
                <CardHeader className="space-y-1 pb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {f.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {}
        <section className="space-y-8">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Why Use VITMAS?
          </h2>

          <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
            {benefits.map((b) => (
              <div
                key={b}
                className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 transition-colors hover:border-zinc-700"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <span className="text-sm text-muted-foreground">{b}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
