import Link from "next/link";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SiteShell } from "@/components/site/site-shell";
import { SectionHeading } from "@/components/site/section-heading";
import { Landmark, Users } from "lucide-react";

const signers = [
  { name: "Commander Iris", role: "Primary Signer" },
  { name: "Lt. Novak", role: "Co-Signer" },
  { name: "Ops Chief Hana", role: "Auditor" },
];

const factionTransactions = [
  {
    id: "FX-9921",
    action: "Transfer",
    target: "Containment Supply",
    amount: "-4,500",
    status: "Completed",
  },
  {
    id: "FX-9920",
    action: "Deposit",
    target: "Council Budget",
    amount: "+12,000",
    status: "Completed",
  },
  {
    id: "FX-9919",
    action: "Tax",
    target: "Site-416 Treasury",
    amount: "-600",
    status: "Completed",
  },
];

export default function FactionsPage() {
  return (
    <SiteShell>
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <SectionHeading
          eyebrow="Faction Vaults"
          title="Shared accounts with controlled authorization."
          description="Faction balances are handled through the same immutable ledger, with signer permissions tracked at all times."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Card className="border-zinc-800/80 bg-zinc-900/70">
              <CardHeader>
                <CardTitle className="text-white">
                  MTF Gamma-13 Vault
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Shared funding pool for operational deployments.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Vault Balance", value: "84,200 Credits" },
                  { label: "Authorized Signers", value: "3" },
                  { label: "Monthly Transfers", value: "9" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 px-4 py-3"
                  >
                    <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                      {stat.label}
                    </div>
                    <div className="text-lg font-semibold text-white">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-zinc-800/80 bg-zinc-900/70">
              <CardHeader>
                <CardTitle className="text-white">
                  Recent Vault Activity
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Transactions linked to this faction account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {factionTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium text-white">
                          {tx.id}
                        </TableCell>
                        <TableCell>{tx.action}</TableCell>
                        <TableCell>{tx.target}</TableCell>
                        <TableCell className="text-white">
                          {tx.amount}
                        </TableCell>
                        <TableCell>
                          <span className="rounded-full border border-zinc-700/80 px-2 py-1 text-xs text-zinc-300">
                            {tx.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="border-zinc-800/80 bg-zinc-900/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Landmark className="h-5 w-5 text-red-300" />
                  Request Vault Transfer
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Submit a transfer on behalf of the faction.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination Account</Label>
                  <Input id="destination" placeholder="Account number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" placeholder="Credits" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="approval">Signer Code</Label>
                  <Input id="approval" placeholder="Signer clearance code" />
                </div>
                <Button className="w-full bg-white text-black">
                  Submit Transfer
                </Button>
              </CardContent>
            </Card>
            <Card className="border-zinc-800/80 bg-zinc-900/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-5 w-5 text-red-300" />
                  Authorized Signers
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Players with approval rights for this vault.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-300">
                {signers.map((signer) => (
                  <div
                    key={signer.name}
                    className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-3 py-2"
                  >
                    <span className="font-medium text-white">
                      {signer.name}
                    </span>
                    <span className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                      {signer.role}
                    </span>
                  </div>
                ))}
                <Link href="/admin">
                  <Button variant="outline" className="mt-2 border-zinc-700">
                    Request Role Change
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
