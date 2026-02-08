// app/page.tsx
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ShieldCheck, HelpCircle, FileText } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-red-900">
      {/* Navbar del boceto */}
      <nav className="border-b border-zinc-800 p-4 flex justify-between items-center bg-zinc-900/50 backdrop-blur">
        <div className="flex items-center gap-2 font-mono font-bold tracking-tighter">
          <div className="h-6 w-6 bg-white rounded-full text-black flex items-center justify-center text-xs">SCP</div>
          SITE-416 BANKING
        </div>
        <div className="flex gap-6 text-sm text-zinc-400">
          <Link href="#" className="hover:text-white transition">Home</Link>
          <Link href="#" className="hover:text-white transition">What is?</Link>
          <Link href="#" className="hover:text-white transition">FAQ</Link>
        </div>
        <Link href="/login">
          <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800 text-white">
            Access Terminal
          </Button>
        </Link>
      </nav>

      {/* Hero Section - "Site-416 Banks" */}
      <main className="flex flex-col items-center justify-center mt-20 text-center px-4">
        <div className="mb-4 px-3 py-1 border border-red-900/50 bg-red-900/10 text-red-500 text-xs font-mono rounded-full animate-pulse">
          AUTHORIZED PERSONNEL ONLY
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 mb-6">
          SITE-416<br />BANKS
        </h1>
        
        <p className="max-w-xl text-zinc-400 mb-10 text-lg">
          Secure centralized financial management for personnel and factions. 
          All transactions are logged, audited, and immutable.
        </p>

        <div className="flex gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="bg-white text-black hover:red font-bold px-8">
              LOGIN
            </Button>
          </Link>
          <Button size="lg" variant="ghost" className="text-zinc-400 hover:text-white">
            View Public Ledger
          </Button>
        </div>

        {/* Feature Icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full max-w-4xl">
          <FeatureCard icon={<ShieldCheck />} title="Secure" desc="Encryption level 5 compliant." />
          <FeatureCard icon={<FileText />} title="Auditable" desc="Full immutable transaction history." />
          <FeatureCard icon={<HelpCircle />} title="Support" desc="Administrative oversight available." />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-6 border border-zinc-800 bg-zinc-900/30 rounded-lg text-left">
      <div className="mb-4 text-zinc-300">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm">{desc}</p>
    </div>
  );
}