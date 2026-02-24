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
import { Lock, Terminal, User } from "lucide-react";
import { login } from "@/lib/api";
import { writeSession } from "@/lib/auth";

const accessNotes = [
  "Only username and password are required for now.",
  "All logins are audited in the backend.",
  "Failed attempts trigger automated review.",
];

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("demo");
  const [password, setPassword] = useState("demo123");

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await login(username, password);
      writeSession(response.access_token, response.user);
      router.push("/dashboard");
    } catch (err) {
      setError("Backend unavailable or invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteShell>
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <SectionHeading
          eyebrow="Access Terminal"
          title="Secure login for Site-416 banking."
          description="Choose the correct console and validate your identity before handling funds."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-zinc-800/80 bg-zinc-900/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Terminal className="h-5 w-5 text-red-300" />
                System Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="demo_user"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  className="bg-white text-black"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? "Authenticating..." : "Authenticate"}
                </Button>
                <Link href="/faq">
                  <Button variant="outline" className="border-zinc-700">
                    View Access Guide
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
                  Demo credentials
                </div>
                <p className="mt-2 text-emerald-100/80">
                  Player: <span className="font-semibold">demo</span> /
                  <span className="font-semibold">demo123</span>
                </p>
                <p className="mt-2 text-emerald-100/80">
                  Faction: <span className="font-semibold">faction</span> /
                  <span className="font-semibold">faction123</span>
                </p>
                <p className="mt-2 text-emerald-100/80">
                  Admin: <span className="font-semibold">admin</span> /
                  <span className="font-semibold">admin123</span>
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-zinc-800/80 bg-zinc-900/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Lock className="h-5 w-5 text-red-300" />
                Access Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-zinc-300">
              {accessNotes.map((note) => (
                <div key={note} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-red-500/80" />
                  <span>{note}</span>
                </div>
              ))}
              <div className="mt-6 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4">
                <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                  System Status
                </div>
                <div className="mt-3 space-y-2 text-sm text-zinc-400">
                  <div className="flex items-center justify-between">
                    <span>Audit sync</span>
                    <span className="font-semibold text-white">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Fraud scanner</span>
                    <span className="font-semibold text-white">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Ledger hash</span>
                    <span className="font-semibold text-white">Verified</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </SiteShell>
  );
}
