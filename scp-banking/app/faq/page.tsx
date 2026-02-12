import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteShell } from "@/components/site/site-shell";
import { SectionHeading } from "@/components/site/section-heading";

const faqs = [
  {
    question: "Why do players and factions share the same account model?",
    answer:
      "A single account model prevents duplicated logic and guarantees that every balance change follows the same auditing rules.",
  },
  {
    question: "Can administrators edit balances without a transaction?",
    answer:
      "No. Every adjustment is written as a transaction and also logged in the admin action log with a justification.",
  },
  {
    question: "How is abuse prevented?",
    answer:
      "Accounts can be frozen instantly, transfers are logged, and audit scans flag suspicious behavior for review.",
  },
  {
    question: "Are tax rules mandatory?",
    answer:
      "Tax rules are configurable per account type. They can be enabled or adjusted without changing the core model.",
  },
  {
    question: "Does the public ledger show private data?",
    answer:
      "Public views only surface non-sensitive identifiers while still proving transaction integrity.",
  },
];

export default function FaqPage() {
  return (
    <SiteShell>
      <section className="mx-auto w-full max-w-4xl px-6 py-20">
        <SectionHeading
          eyebrow="FAQ"
          title="Clear answers for personnel and moderators."
          description="If you need more detail, contact the banking division."
        />
        <div className="mt-10 space-y-4">
          {faqs.map((item) => (
            <Card key={item.question} className="border-zinc-800/80 bg-zinc-900/70">
              <CardContent className="space-y-2 p-6">
                <h3 className="text-lg font-semibold text-white">
                  {item.question}
                </h3>
                <p className="text-sm text-zinc-400">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/login">
            <Button className="bg-white text-black">Access Terminal</Button>
          </Link>
          <Link href="/ledger">
            <Button variant="outline" className="border-zinc-700">
              View Public Ledger
            </Button>
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
