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
import { SiteShell } from "@/components/site/site-shell";
import { SectionHeading } from "@/components/site/section-heading";
import { ScrollText, ShieldCheck } from "lucide-react";

const ledgerEntries = [
  {
    id: "TX-44821",
    source: "Site-416 Payroll",
    destination: "Operative K-92",
    amount: "3,400",
    type: "Deposit",
    time: "Today 08:14",
  },
  {
    id: "TX-44820",
    source: "Operative K-92",
    destination: "Alpha-19 Logistics",
    amount: "1,200",
    type: "Transfer",
    time: "Today 07:42",
  },
  {
    id: "TX-44819",
    source: "Beta-7 Medical",
    destination: "Site-416 Treasury",
    amount: "780",
    type: "Tax",
    time: "Yesterday 21:16",
  },
  {
    id: "TX-44818",
    source: "Admin Console",
    destination: "Containment Storage",
    amount: "2,000",
    type: "Adjustment",
    time: "Yesterday 17:55",
  },
];

export default function LedgerPage() {
  return (
    <SiteShell>
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <SectionHeading
          eyebrow="Public Ledger"
          title="Transparent transaction history for all personnel."
          description="Every change to any balance is recorded as an immutable transaction entry."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-zinc-800/80 bg-zinc-900/70">
            <CardHeader>
              <CardTitle className="text-white">Latest Entries</CardTitle>
              <CardDescription className="text-zinc-400">
                Recent movements across the economy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium text-white">
                        {entry.id}
                      </TableCell>
                      <TableCell>{entry.source}</TableCell>
                      <TableCell>{entry.destination}</TableCell>
                      <TableCell className="text-white">
                        {entry.amount}
                      </TableCell>
                      <TableCell>
                        <span className="rounded-full border border-zinc-700/80 px-2 py-1 text-xs text-zinc-300">
                          {entry.type}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card className="border-zinc-800/80 bg-zinc-900/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ScrollText className="h-5 w-5 text-red-300" />
                  Ledger Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-300">
                {[
                  "All transactions are immutable once committed.",
                  "Public ledger shows non-sensitive identifiers only.",
                  "Administrative adjustments are tagged and audited.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-red-500/80" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-zinc-800/80 bg-zinc-900/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ShieldCheck className="h-5 w-5 text-red-300" />
                  Integrity Check
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Ledger entries are chained and verified every hour.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-300">
                <div className="flex items-center justify-between">
                  <span>Last hash update</span>
                  <span className="font-semibold text-white">42 min ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Verified entries</span>
                  <span className="font-semibold text-white">94,102</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Audit alerts</span>
                  <span className="font-semibold text-emerald-300">0</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
