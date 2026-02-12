import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Terminal } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#system", label: "System" },
  { href: "/factions", label: "Factions" },
  { href: "/ledger", label: "Ledger" },
  { href: "/admin", label: "Admin" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="relative z-20 border-b border-zinc-800/60 bg-zinc-950/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-white text-xs font-black text-black">
            SCP
          </div>
          <div className="text-sm font-semibold tracking-[0.22em] text-zinc-200">
            SITE-416 BANKING
          </div>
        </Link>
        <nav className="hidden items-center gap-5 text-xs uppercase tracking-[0.24em] text-zinc-400 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200 lg:flex">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure Channel
          </div>
          <Link href="/login">
            <Button variant="outline" className="border-zinc-700 text-white">
              <Terminal className="h-4 w-4" />
              Access Terminal
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 border-t border-zinc-900/80 bg-zinc-950/80 px-6 py-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500 md:hidden">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-white">
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
