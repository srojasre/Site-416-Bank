"use client";

import { useEffect, useState } from "react";
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
import {
  createAdminAction,
  getAdminActions,
  getAdminWatchlist,
  getComplianceStats,
  getTaxRules,
  updateTaxRules,
  type AdminAction,
  type ComplianceStats,
  type TaxRules,
  type WatchlistItem,
} from "@/lib/api";

export default function AdminPage() {
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [taxRules, setTaxRules] = useState<TaxRules | null>(null);
  const [compliance, setCompliance] = useState<ComplianceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [taxStatus, setTaxStatus] = useState<string | null>(null);

  const [targetAccount, setTargetAccount] = useState("");
  const [actionType, setActionType] = useState("");
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [justification, setJustification] = useState("");

  const [personalRate, setPersonalRate] = useState("");
  const [factionRate, setFactionRate] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("scp_auth");
    if (!token) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [actions, watchlistData, rules, complianceData] =
          await Promise.all([
            getAdminActions(token),
            getAdminWatchlist(token),
            getTaxRules(token),
            getComplianceStats(token),
          ]);
        setAdminActions(actions);
        setWatchlist(watchlistData);
        setTaxRules(rules);
        setCompliance(complianceData);
        setPersonalRate((rules.personal_rate * 100).toString());
        setFactionRate((rules.faction_rate * 100).toString());
      } catch (err) {
        setError("Unable to load admin data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleActionSubmit = async () => {
    const token = window.localStorage.getItem("scp_auth");
    if (!token) return;

    if (!targetAccount || !actionType || !justification) {
      setActionStatus("Complete all required fields.");
      return;
    }

    setActionStatus(null);

    try {
      const newAction = await createAdminAction(token, {
        action: actionType,
        target: targetAccount,
        reason: justification,
        amount: adjustmentAmount ? Number(adjustmentAmount) : undefined,
      });
      setAdminActions((prev) => [newAction, ...prev]);
      setTargetAccount("");
      setActionType("");
      setAdjustmentAmount("");
      setJustification("");
      setActionStatus("Admin action submitted.");
    } catch (err) {
      setActionStatus("Unable to submit admin action.");
    }
  };

  const handleTaxUpdate = async () => {
    const token = window.localStorage.getItem("scp_auth");
    if (!token) return;

    const personalValue = Number(personalRate);
    const factionValue = Number(factionRate);
    if (Number.isNaN(personalValue) || Number.isNaN(factionValue)) {
      setTaxStatus("Enter valid numeric rates.");
      return;
    }

    setTaxStatus(null);

    try {
      const updated = await updateTaxRules(token, {
        personal_rate: personalValue / 100,
        faction_rate: factionValue / 100,
      });
      setTaxRules(updated);
      setTaxStatus("Tax rules updated.");
    } catch (err) {
      setTaxStatus("Unable to update tax rules.");
    }
  };

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
                  <Input
                    id="account"
                    placeholder="Account number"
                    value={targetAccount}
                    onChange={(event) => setTargetAccount(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action">Action Type</Label>
                  <Input
                    id="action"
                    placeholder="Freeze / Adjust / Unfreeze"
                    value={actionType}
                    onChange={(event) => setActionType(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Adjustment Amount</Label>
                  <Input
                    id="amount"
                    placeholder="Credits (optional)"
                    value={adjustmentAmount}
                    onChange={(event) => setAdjustmentAmount(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Justification</Label>
                  <Input
                    id="reason"
                    placeholder="Required for all actions"
                    value={justification}
                    onChange={(event) => setJustification(event.target.value)}
                  />
                </div>
                <Button className="bg-white text-black" onClick={handleActionSubmit}>
                  Submit Action
                </Button>
                <Button variant="outline" className="border-zinc-700">
                  Schedule Review
                </Button>
                {actionStatus ? (
                  <div className="sm:col-span-2 rounded-lg border border-zinc-800/70 bg-zinc-950/60 px-3 py-2 text-xs text-zinc-300">
                    {actionStatus}
                  </div>
                ) : null}
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
                {error ? (
                  <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {error}
                  </div>
                ) : null}
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
                    {adminActions.length === 0 ? (
                      <TableRow>
                        <TableCell className="text-zinc-500" colSpan={5}>
                          No admin actions available.
                        </TableCell>
                      </TableRow>
                    ) : (
                      adminActions.map((log) => (
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
                      ))
                    )}
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
                  <Label htmlFor="personal-tax">Personal Tax Rate (%)</Label>
                  <Input
                    id="personal-tax"
                    placeholder="3"
                    value={personalRate}
                    onChange={(event) => setPersonalRate(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faction-tax">Faction Tax Rate (%)</Label>
                  <Input
                    id="faction-tax"
                    placeholder="5"
                    value={factionRate}
                    onChange={(event) => setFactionRate(event.target.value)}
                  />
                </div>
                <Button className="w-full bg-white text-black" onClick={handleTaxUpdate}>
                  Update Tax Rules
                </Button>
                {taxStatus ? (
                  <div className="rounded-lg border border-zinc-800/70 bg-zinc-950/60 px-3 py-2 text-xs text-zinc-300">
                    {taxStatus}
                  </div>
                ) : null}
                {taxRules ? (
                  <div className="text-xs text-zinc-500">
                    Last updated {new Date(taxRules.updated_at).toLocaleString()}
                  </div>
                ) : null}
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
                {watchlist.length === 0 ? (
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-3 py-2 text-zinc-500">
                    No watchlist entries.
                  </div>
                ) : (
                  watchlist.map((item) => (
                    <div
                      key={item.account}
                      className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-3 py-2"
                    >
                      <div className="font-medium text-white">
                        {item.account}
                      </div>
                      <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                        {item.note}
                      </div>
                    </div>
                  ))
                )}
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
                  <span className="font-semibold text-white">
                    {compliance?.transactions_scanned ?? (loading ? "..." : "0")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Flags opened</span>
                  <span className="font-semibold text-white">
                    {compliance?.flags_opened ?? (loading ? "..." : "0")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Resolved alerts</span>
                  <span className="font-semibold text-emerald-300">
                    {compliance?.resolved_alerts ?? (loading ? "..." : "0")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
