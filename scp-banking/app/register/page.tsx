"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteShell } from "@/components/site/site-shell";
import { SectionHeading } from "@/components/site/section-heading";
import { BadgePlus, Terminal, User } from "lucide-react";
import { registerAccount } from "@/lib/api";
import { writeSession } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!name || !username || !password) {
      setError("Complete all required fields.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await registerAccount({ name, username, password });
      writeSession(response.access_token, response.user);
      router.push("/dashboard");
    } catch (err) {
      setError("Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteShell>
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <SectionHeading
          eyebrow="New Account"
          title="Create a player account for Site-416 banking."
          description="Accounts are tied to a personal ledger and audited from day one."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-zinc-800/80 bg-zinc-900/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BadgePlus className="h-5 w-5 text-red-300" />
                Create Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Operative Name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="your_username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  className="bg-white text-black"
                  onClick={handleRegister}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Account"}
                </Button>
                <Link href="/login">
                  <Button variant="outline" className="border-zinc-700">
                    Go to Login
                  </Button>
                </Link>
              </div>
              {error ? (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                  {error}
                </div>
              ) : null}
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                <div className="flex items-center gap-2 font-semibold">
                  <User className="h-4 w-4" />
                  Player account only
                </div>
                <p className="mt-2 text-emerald-100/80">
                  Faction and admin roles are assigned by the system after
                  review.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-zinc-800/80 bg-zinc-900/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Terminal className="h-5 w-5 text-red-300" />
                Onboarding Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-zinc-300">
              {[
                "Your account starts with a zero balance.",
                "All activity is monitored for audit compliance.",
                "You can request faction access after approval.",
              ].map((note) => (
                <div key={note} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-red-500/80" />
                  <span>{note}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </SiteShell>
  );
}
