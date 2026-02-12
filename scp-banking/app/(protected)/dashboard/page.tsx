"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import { ArrowUpRight, ShieldCheck, Wallet } from "lucide-react";
import { createTransaction, getBalance, getTransactions } from "@/lib/api";

export default function DashboardPage() {
  const [account, setAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transferDestination, setTransferDestination] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferDescription, setTransferDescription] = useState("");
  const [transferStatus, setTransferStatus] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("scp_auth");
    if (!token) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [accountData, transactionData] = await Promise.all([
          getBalance(token),
          getTransactions(token),
        ]);
        setAccount(accountData);
        setTransactions(transactionData);
      } catch (err) {
        setError("No se pudo cargar la informacion del usuario.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const formattedTransactions = useMemo(() => {
    if (!account) return [];
    return transactions.map((tx) => {
      const isSource = tx.source_account_id === account.id;
      const counterparty = isSource
        ? tx.destination_account_id
        : tx.source_account_id ?? "SYSTEM";
      const amountPrefix = isSource ? "-" : "+";
      return {
        id: tx.id,
        type: tx.type,
        counterparty,
        amount: `${amountPrefix}${tx.amount.toLocaleString()}`,
        status: tx.status ?? "COMPLETED",
      };
    });
  }, [account, transactions]);

  const handleTransfer = async () => {
    const token = window.localStorage.getItem("scp_auth");
    if (!token) return;
    setTransferStatus(null);

    const amountValue = Number(transferAmount);
    if (!transferDestination || !amountValue) {
      setTransferStatus("Completa todos los campos.");
      return;
    }

    try {
      const newTx = await createTransaction(token, {
        destination_account_id: transferDestination,
        amount: amountValue,
        type: "TRANSFER",
        description: transferDescription,
      });
      setTransactions((prev) => [newTx, ...prev]);
      setAccount((prev: any) =>
        prev ? { ...prev, balance: prev.balance - amountValue } : prev
      );
      setTransferAmount("");
      setTransferDestination("");
      setTransferDescription("");
      setTransferStatus("Transferencia enviada.");
    } catch (err) {
      setTransferStatus("No se pudo procesar la transferencia.");
    }
  };

  return (
    <SiteShell>
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <SectionHeading
          eyebrow="Player Console"
          title="Monitor your balance and initiate transfers."
          description="Every credit and debit routes through the unified account model."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Current Balance",
                  value: account
                    ? `${account.balance.toLocaleString()} Credits`
                    : loading
                      ? "Loading..."
                      : "0 Credits",
                },
                {
                  label: "Monthly Transfers",
                  value: formattedTransactions.length.toString(),
                },
                {
                  label: "Account Status",
                  value: account?.is_frozen ? "Frozen" : "Active",
                },
              ].map((stat) => (
                <Card
                  key={stat.label}
                  className="border-zinc-800/80 bg-zinc-900/70"
                >
                  <CardContent className="space-y-2 p-5">
                    <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                      {stat.label}
                    </div>
                    <div className="text-xl font-semibold text-white">
                      {stat.value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="border-zinc-800/80 bg-zinc-900/70">
              <CardHeader>
                <CardTitle className="text-white">
                  Recent Transactions
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Latest movements tied to your account.
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
                      <TableHead>Type</TableHead>
                      <TableHead>Counterparty</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formattedTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell className="text-zinc-500" colSpan={5}>
                          No hay movimientos disponibles.
                        </TableCell>
                      </TableRow>
                    ) : (
                      formattedTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-medium text-white">
                            {tx.id}
                          </TableCell>
                          <TableCell>{tx.type}</TableCell>
                          <TableCell>{tx.counterparty}</TableCell>
                          <TableCell className="text-white">
                            {tx.amount}
                          </TableCell>
                          <TableCell>
                            <span className="rounded-full border border-zinc-700/80 px-2 py-1 text-xs text-zinc-300">
                              {tx.status}
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
                <CardTitle className="text-white">Quick Transfer</CardTitle>
                <CardDescription className="text-zinc-400">
                  Send funds to another account or faction.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination Account</Label>
                  <Input
                    id="destination"
                    placeholder="Account number"
                    value={transferDestination}
                    onChange={(event) =>
                      setTransferDestination(event.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    placeholder="Credits"
                    value={transferAmount}
                    onChange={(event) => setTransferAmount(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Description</Label>
                  <Input
                    id="reason"
                    placeholder="Transfer reason"
                    value={transferDescription}
                    onChange={(event) =>
                      setTransferDescription(event.target.value)
                    }
                  />
                </div>
                <Button className="w-full bg-white text-black" onClick={handleTransfer}>
                  Submit Transfer
                </Button>
                {transferStatus ? (
                  <div className="rounded-lg border border-zinc-800/70 bg-zinc-950/60 px-3 py-2 text-xs text-zinc-300">
                    {transferStatus}
                  </div>
                ) : null}
              </CardContent>
            </Card>
            <Card className="border-zinc-800/80 bg-zinc-900/70">
              <CardHeader>
                <CardTitle className="text-white">Account Health</CardTitle>
                <CardDescription className="text-zinc-400">
                  Compliance checks and security safeguards.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-300">
                <div className="flex items-center justify-between">
                  <span>Freeze state</span>
                  <span className="font-semibold text-emerald-300">
                    {account?.is_frozen ? "Frozen" : "Unfrozen"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last audit</span>
                  <span className="font-semibold text-white">12 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax rate</span>
                  <span className="font-semibold text-white">3%</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  Audit chain verified
                </div>
              </CardContent>
            </Card>
            <Card className="border-zinc-800/80 bg-zinc-900/70">
              <CardHeader>
                <CardTitle className="text-white">Faction Access</CardTitle>
                <CardDescription className="text-zinc-400">
                  Switch to a faction vault if you have clearance.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-red-300" />
                  <div>
                    <div className="text-sm font-semibold text-white">
                      MTF Gamma-13 Vault
                    </div>
                    <div className="text-xs text-zinc-400">
                      Authorized signer
                    </div>
                  </div>
                </div>
                <Link href="/factions">
                  <Button variant="outline" className="border-zinc-700">
                    Open
                    <ArrowUpRight className="h-4 w-4" />
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
