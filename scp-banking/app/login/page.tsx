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

const accessNotes = [
  "Solo se solicita usuario y contrasena por ahora.",
  "Todos los accesos quedan auditados en el backend.",
  "Los intentos fallidos activan revision automatica.",
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
      window.localStorage.setItem("scp_auth", response.access_token ?? "demo");
      window.localStorage.setItem("scp_user", username);
      router.push("/dashboard");
    } catch (err) {
      setError("Backend no disponible o credenciales invalidas.");
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
                Acceso al sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  placeholder="usuario_demo"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contrasena</Label>
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
                  Datos falsos para pruebas
                </div>
                <p className="mt-2 text-emerald-100/80">
                  Usuario: <span className="font-semibold">demo</span> -
                  Contrasena: <span className="font-semibold">demo123</span>
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-zinc-800/80 bg-zinc-900/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Lock className="h-5 w-5 text-red-300" />
                Protocolo de acceso
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
                  Estado del sistema
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
