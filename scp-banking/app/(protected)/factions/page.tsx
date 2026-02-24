"use client";

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
import { Landmark, Users } from "lucide-react";
import {
  createFactionTransaction,
  getFactionTransactions,
  getFactionVault,
  type FactionVault,
  type Transaction,
} from "@/lib/api";

export default function FactionsPage() {
  const [vault, setVault] = useState<FactionVault | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [transferStatus, setTransferStatus] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("scp_auth");
    if (!token) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [vaultData, txData] = await Promise.all([
          getFactionVault(token),
          getFactionTransactions(token),
        ]);
        setVault(vaultData);
        setTransactions(txData);
      } catch (err) {
        setError("Unable to load faction data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const formattedTransactions = useMemo(() => {
    if (!vault) return [];
    return transactions.map((tx) => {
      const isSource = tx.source_account_id === vault.account_id;
      const counterparty = isSource
        ? tx.destination_account_id
        : tx.source_account_id ?? "SYSTEM";
      const amountPrefix = isSource ? "-" : "+";
      return {
        id: tx.id,
        action: tx.type,
        target: counterparty,
        amount: `${amountPrefix}${tx.amount.toLocaleString()}`,
        status: tx.status ?? "COMPLETED",
      };
    });
  }, [transactions, vault]);

  const handleTransfer = async () => {
    const token = window.localStorage.getItem("scp_auth");
    if (!token) return;
    setTransferStatus(null);

    const amountValue = Number(amount);
    if (!destination || !amountValue) {
      setTransferStatus("Complete all required fields.");
      return;
    }

    try {
      const newTx = await createFactionTransaction(token, {
        destination_account_id: destination,
        amount: amountValue,
        type: "TRANSFER",
        description,
      });
      setTransactions((prev) => [newTx, ...prev]);
      setVault((prev) =>
        prev ? { ...prev, balance: prev.balance - amountValue } : prev
      );
      setDestination("");
      setAmount("");
      setDescription("");
      setTransferStatus("Transfer submitted.");
    } catch (err) {
      setTransferStatus("Unable to process transfer.");
    }
  };

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
                  {vault?.name ?? "Faction Vault"}
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Shared funding pool for operational deployments.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    label: "Vault Balance",
                    value: vault
                      ? `${vault.balance.toLocaleString()} Credits`
                      : loading
                        ? "Loading..."
                        : "0 Credits",
                  },
                  {
                    label: "Authorized Signers",
                    value: vault
                      ? vault.authorized_signers.length.toString()
                      : "0",
                  },
                  {
                    label: "Monthly Transfers",
                    value: vault ? vault.monthly_transfers.toString() : "0",
                  },
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
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formattedTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell className="text-zinc-500" colSpan={5}>
                          No transactions available.
                        </TableCell>
                      </TableRow>
                    ) : (
                      formattedTransactions.map((tx) => (
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
                  <Input
                    id="destination"
                    placeholder="Account number"
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    placeholder="Credits"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Transfer reason"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
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
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-5 w-5 text-red-300" />
                  Authorized Signers
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Players with approval rights for this vault.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-300">
                {(vault?.authorized_signers ?? []).map((signer) => (
                  <div
                    key={signer.id}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
