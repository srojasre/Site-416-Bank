"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getProfile } from "@/lib/api";
import { clearSession, readProfile, readToken, writeSession } from "@/lib/auth";
import type { UserRole } from "@/lib/api";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [authorized, setAuthorized] = useState(true);

  useEffect(() => {
    const token = readToken();
    if (!token) {
      setReady(true);
      router.replace("/login");
      return;
    }

    const load = async () => {
      try {
        let profile = readProfile();
        const freshProfile = await getProfile(token);
        profile = freshProfile ?? profile;
        if (profile) {
          writeSession(token, profile);
        }
        setAuthed(true);

        const role = profile.role as UserRole;
        const path = pathname ?? "";
        let allowed = true;
        if (path.startsWith("/admin")) {
          allowed = role === "ADMIN";
        } else if (path.startsWith("/factions")) {
          allowed = role === "FACTION";
        }
        setAuthorized(allowed);
        if (!allowed) {
          router.replace("/dashboard");
        }
      } catch (err) {
        clearSession();
        router.replace("/login");
      } finally {
        setReady(true);
      }
    };

    load();
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-200">
        Validating access...
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-200">
        Redirecting to login...
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-200">
        Access level not permitted for this console.
      </div>
    );
  }

  return <>{children}</>;
}
