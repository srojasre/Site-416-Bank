import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteShell } from "@/components/site/site-shell";
import { SectionHeading } from "@/components/site/section-heading";
import { ShieldCheck, ShieldAlert, Sliders } from "lucide-react";

const adminActions = [
  {
    id: "AD-1209",
    action: "Account freeze",
    target: "Operative J-14",
    reason: "Suspicious transfers",
    status: "Approved",
  },
  {
    id: "AD-1208",
    action: "Balance adjustment",
    target: "Gamma-13 Vault",
    reason: "Raid reward correction",
    status: "Approved",
  },
  {
    id: "AD-1207",
    action: "Tax rule update",
    target: "Faction accounts",
    reason: "Inflation control",
    status: "Pending",
  },
];

const watchlist = [
  { account: "Delta-4 Logistics", note: "Rapid accumulation" },
  { account: "Operative K-92", note: "High outbound volume" },
  { account: "Site-416 Vault", note: "Manual review" },
];

export default function AdminPage() {
  return (
    <SiteShell>
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <SectionHeading
          eyebrow="Admin Console"
          title="Full oversight of the SCP banking economy."
          description="Freeze accounts, adjust balances, and tune tax rules with mandatory justification."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card className="border-zinc-800/80 bg-zinc-900/70">
              <CardHeader>
                <CardTitle className="text-white">
                  Account Intervention
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Freeze or adjust balances with a documented reason.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="account">Account ID</Label>
                  <Input id="account" placeholder="Account number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action">Action Type</Label>
                  <Input id="action" placeholder="Freeze / Adjust / Unfreeze" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Adjustment Amount</Label>
                  <Input id="amount" placeholder="Credits (optional)" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Justification</Label>
                  <Input id="reason" placeholder="Required for all actions" />
                </div>
                <Button className="bg-white text-black">Submit Action</Button>
                <Button variant="outline" className="border-zinc-700">
                  Schedule Review
                </Button>
              </CardContent>
            </Card>
            <Card className="border-zinc-800/80 bg-zinc-900/70">
              <CardHeader>
                <CardTitle className="text-white">Admin Action Log</CardTitle>
                <CardDescription className="text-zinc-400">
                  Separate audit trail for moderation activity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminActions.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium text-white">
                          {log.id}
                        </TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.target}</TableCell>
                        <TableCell>{log.reason}</TableCell>
                        <TableCell>
                          <span className="rounded-full border border-zinc-700/80 px-2 py-1 text-xs text-zinc-300">
                            {log.status}
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
                  <Sliders className="h-5 w-5 text-red-300" />
                  Tax Rules
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Configure taxation parameters per account type.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="personal-tax">Personal Tax Rate</Label>
                  <Input id="personal-tax" placeholder="3%" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faction-tax">Faction Tax Rate</Label>
                  <Input id="faction-tax" placeholder="5%" />
                </div>
                <Button className="w-full bg-white text-black">
                  Update Tax Rules
                </Button>
              </CardContent>
            </Card>
            <Card className="border-zinc-800/80 bg-zinc-900/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ShieldAlert className="h-5 w-5 text-red-300" />
                  Watchlist
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Accounts flagged for manual investigation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-300">
                {watchlist.map((item) => (
                  <div
                    key={item.account}
                    className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-3 py-2"
                  >
                    <div className="font-medium text-white">{item.account}</div>
                    <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                      {item.note}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-zinc-800/80 bg-zinc-900/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ShieldCheck className="h-5 w-5 text-red-300" />
                  Compliance Pulse
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Automated checks executed in the last 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-300">
                <div className="flex items-center justify-between">
                  <span>Transactions scanned</span>
                  <span className="font-semibold text-white">4,208</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Flags opened</span>
                  <span className="font-semibold text-white">6</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Resolved alerts</span>
                  <span className="font-semibold text-emerald-300">4</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
