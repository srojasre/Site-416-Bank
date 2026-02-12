// app/page.tsx
import Link from "next/link";
import {
  ShieldCheck,
  ScrollText,
  Users,
  Landmark,
  SquareGanttChart,
  Lock,
  FileText,
  Vault,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiteShell } from "@/components/site/site-shell";
import { SectionHeading } from "@/components/site/section-heading";

const pillars = [
  {
    icon: <Vault className="h-5 w-5" />,
    title: "Unified Account Model",
    description:
      "A single account abstraction for players and factions keeps every balance change consistent and traceable.",
  },
  {
    icon: <ScrollText className="h-5 w-5" />,
    title: "Immutable Transactions",
    description:
      "Transfers, deposits, taxes, and admin adjustments are all logged with source, destination, and audit metadata.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Administrative Oversight",
    description:
      "Every manual intervention requires justification and remains visible to the moderation team.",
  },
  {
    icon: <SquareGanttChart className="h-5 w-5" />,
    title: "Future-Ready Rules",
    description:
      "Tax rules and admin action logs are already modeled for controlled economic tuning later on.",
  },
];

const personas = [
  {
    icon: <Users className="h-5 w-5" />,
    title: "Players",
    description:
      "Check balances instantly, send payments, and track every credit or debit in a clear personal ledger.",
  },
  {
    icon: <Landmark className="h-5 w-5" />,
    title: "Factions",
    description:
      "Operate shared vaults with authorized signers and ensure every faction movement is accountable.",
  },
  {
    icon: <Lock className="h-5 w-5" />,
    title: "Administrators",
    description:
      "Freeze accounts, adjust balances with documented reasons, and define tax policy from one console.",
  },
];

export default function LandingPage() {
  return (
    <SiteShell>
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 py-20 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-red-200">
              Authorized Personnel Only
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-white md:text-6xl">
              Site-416 Banking Command
            </h1>
            <p className="max-w-xl text-lg text-zinc-400">
              A centralized currency system for a 10k+ member SCP roleplay
              community. Built for clarity, auditability, and fast moderation
              response.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-black">
                  Enter Player Console
                </Button>
              </Link>
              <Link href="/ledger">
                <Button size="lg" variant="outline" className="border-zinc-700">
                  View Public Ledger
                </Button>
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Registered Users", value: "10,000+" },
                { label: "Active Players", value: "2,000+" },
                { label: "Tracked Transfers", value: "100%" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-zinc-800/70 bg-zinc-900/50 px-4 py-3"
                >
                  <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                    {stat.label}
                  </div>
                  <div className="text-2xl font-semibold text-white">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            <Card className="border-zinc-800/80 bg-zinc-900/70">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Live Account Snapshot
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Unified balance ledger for personnel and faction holdings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-zinc-400">
                  <div className="flex items-center justify-between">
                    <span>Personal Accounts</span>
                    <span className="font-semibold text-white">8,462</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Faction Vaults</span>
                    <span className="font-semibold text-white">128</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Frozen Accounts</span>
                    <span className="font-semibold text-white">14</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Audit Sync</span>
                    <span className="font-semibold text-white">3 min ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-zinc-800/80 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Transaction Integrity
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Every credit, debit, and tax is reconciled against immutable
                  logs.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-zinc-400">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Multi-step verification for large transfers.
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-emerald-400" />
                  Admin adjustments require justification.
                </div>
                <div className="flex items-center gap-3">
                  <ScrollText className="h-4 w-4 text-emerald-400" />
                  Full exportable ledger history.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="system" className="mx-auto w-full max-w-6xl px-6 py-16">
        <SectionHeading
          eyebrow="Core Architecture"
          title="Simple models, absolute traceability."
          description="The system avoids economic complexity while guaranteeing that every balance change can be audited."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {pillars.map((pillar) => (
            <Card
              key={pillar.title}
              className="border-zinc-800/80 bg-zinc-900/60"
            >
              <CardHeader>
                <div className="flex items-center gap-3 text-red-200">
                  {pillar.icon}
                  <CardTitle className="text-base text-white">
                    {pillar.title}
                  </CardTitle>
                </div>
                <CardDescription className="text-zinc-400">
                  {pillar.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <SectionHeading
          eyebrow="User Stories"
          title="Built for players, factions, and overseers."
          description="Every role has dedicated controls without duplicating financial logic."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {personas.map((persona) => (
            <Card
              key={persona.title}
              className="border-zinc-800/80 bg-zinc-900/60"
            >
              <CardHeader>
                <div className="flex items-center gap-3 text-red-200">
                  {persona.icon}
                  <CardTitle className="text-base text-white">
                    {persona.title}
                  </CardTitle>
                </div>
                <CardDescription className="text-zinc-400">
                  {persona.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <SectionHeading
          eyebrow="Operational Flow"
          title="Clear steps, zero ambiguity."
          description="From transfer request to audit completion, every action follows a predictable pipeline."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            "Player or faction initiates transfer.",
            "System validates account status and limits.",
            "Transaction record is written and sealed.",
            "Balance changes propagate and appear in ledgers.",
          ].map((step, index) => (
            <div
              key={step}
              className="rounded-xl border border-zinc-800/70 bg-zinc-900/60 p-5 text-sm text-zinc-300"
            >
              <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                Step {index + 1}
              </div>
              <p className="mt-3 text-base text-white">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <SectionHeading
          eyebrow="Admin Controls"
          title="Moderation tools that stay accountable."
          description="Administrative actions are logged separately and never bypass the transaction ledger."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-zinc-800/80 bg-zinc-900/60">
            <CardHeader>
              <CardTitle className="text-white">
                Intervention Capabilities
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Freeze accounts, enforce tax rules, and correct illicit gains.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-zinc-300">
              {[
                "Freeze or unfreeze any account with a mandatory reason.",
                "Perform balance adjustments that create a matching transaction.",
                "Apply configurable tax rules per account type.",
                "Review every admin action with timestamp and operator ID.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-red-500/80" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-zinc-800/80 bg-gradient-to-br from-zinc-900/70 to-zinc-950/90">
            <CardHeader>
              <CardTitle className="text-white">Audit Snapshot</CardTitle>
              <CardDescription className="text-zinc-400">
                Latest moderation activity across the economy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-zinc-400">
              {[
                {
                  label: "Flagged Accounts",
                  value: "6 under review",
                },
                {
                  label: "Tax Rules Active",
                  value: "3 policies",
                },
                {
                  label: "Admin Actions Today",
                  value: "12 approved",
                },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span>{item.label}</span>
                  <span className="font-semibold text-white">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <Card className="border-zinc-800/80 bg-zinc-900/70">
          <CardContent className="grid gap-6 p-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div className="space-y-4">
              <div className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                Ready for Deployment
              </div>
              <h3 className="text-3xl font-semibold text-white">
                Launch the banking console for your SCP community.
              </h3>
              <p className="text-base text-zinc-400">
                Every currency movement is centralized, auditable, and built to
                scale as the roleplay economy evolves.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/login">
                <Button size="lg" className="bg-white text-black">
                  Access Terminal
                </Button>
              </Link>
              <Link href="/admin">
                <Button size="lg" variant="outline" className="border-zinc-700">
                  Review Admin Console
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </SiteShell>
  );
}
