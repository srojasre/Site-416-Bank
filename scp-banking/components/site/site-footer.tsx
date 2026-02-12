import Link from "next/link";

const footerLinks = [
  { href: "/ledger", label: "Public Ledger" },
  { href: "/dashboard", label: "Player Console" },
  { href: "/factions", label: "Faction Vaults" },
  { href: "/admin", label: "Admin Console" },
  { href: "/faq", label: "FAQ" },
];

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-zinc-800/60 bg-zinc-950/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 text-sm text-zinc-400 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Site-416 Banking Division
          </div>
          <p className="max-w-md text-sm text-zinc-400">
            A controlled, auditable currency system designed for SCP roleplay
            operations. All activity is logged, immutable, and subject to
            administrative review.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.25em]">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
