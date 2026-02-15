import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";

import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Server,
  Boxes,
  BookOpen,
  Trash2,
  KeyRound,
} from "lucide-react";

export default async function Home() {
  const { userId } = await auth();

  if (userId) redirect("/dashboard");

  const features = [
    {
      icon: Boxes,
      title: "Centralized Cache",
      desc: "Share cache across multiple Next.js servers using a single Redis.",
    },
    {
      icon: Trash2,
      title: "Purge by Tag / Key",
      desc: "Instantly invalidate cache using tags or single keys from the dashboard.",
    },
    {
      icon: KeyRound,
      title: "API Keys + Logs",
      desc: "Generate secure keys, disable anytime, and track purge history.",
    },
    {
      icon: Server,
      title: "BYO Redis",
      desc: "Use Upstash, Redis Cloud, or your own Redis server. Full control.",
    },
    {
      icon: ShieldCheck,
      title: "Redis URL Encrypted",
      desc: "Redis URLs are stored encrypted. Even admins cannot view them.",
    },
    {
      icon: Zap,
      title: "Next.js 15 Cache Handler",
      desc: "Drop-in cache handler package that stores Next.js cache in Redis.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#EDEDED]">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          
          <Image
            src="/logo1.png"
            alt="Sovereign Cache"
            width={180}
            height={80}
            className="object-contain rounded-xl border border-white/20"
            priority
          />
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm text-white/60 hover:text-white transition px-3 py-2"
          >
            Sign in
          </Link>

          <Link
            href="/sign-up"
            className="text-sm bg-white text-black px-5 py-2 rounded-lg font-semibold hover:bg-white/90 transition"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="px-6 pb-16 pt-12 max-w-6xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white/70">
            <Server className="h-4 w-4" />
            Centralized Cache + BYO Redis
          </div>

          <h1 className="mt-7 text-4xl sm:text-5xl font-bold tracking-tight">
            Centralized Cache for Next.js
          </h1>

          <p className="mt-5 text-base sm:text-lg text-white/55 max-w-3xl mx-auto leading-relaxed">
            Build your own distributed Next.js caching system using Redis.
            Works across multiple servers and supports instant purge by{" "}
            <span className="font-mono text-white/80">tag</span> or{" "}
            <span className="font-mono text-white/80">key</span>.
          </p>

          {/* CTA */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-black font-semibold hover:bg-white/90 transition w-full sm:w-auto"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/15 bg-white/5 text-white font-medium hover:bg-white/10 transition w-full sm:w-auto"
            >
              Go to dashboard
            </Link>
          </div>

          {/* Docs hint */}
          <div className="mt-4 text-sm text-white/40 flex items-center justify-center gap-2">
            <BookOpen className="h-4 w-4 text-white/40" />
            Docs available inside dashboard after login.
          </div>
        </div>

        {/* Features */}
        <section className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="rounded-xl border border-white/10 bg-[#0b0b0b] p-6 hover:bg-white/[0.03] transition"
              >
                <div className="h-10 w-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-white/70" />
                </div>

                <div className="mt-4 font-semibold text-white/90">
                  {f.title}
                </div>

                <p className="mt-2 text-sm text-white/55 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </section>

        {/* Quick start */}
        <section className="mt-14 rounded-xl border border-white/10 bg-[#0b0b0b] p-7">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="h-5 w-5 text-white/70" />
                Quick Start
              </h3>
              <p className="mt-2 text-sm text-white/55">
                Install the handler package, set Redis URL + namespace, and
                you’re done.
              </p>
            </div>

            <Link
              href="/sign-up"
              className="text-sm px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
            >
              View docs inside dashboard →
            </Link>
          </div>

          <pre className="mt-5 text-xs bg-black p-4 rounded-lg overflow-x-auto border border-white/10 text-white/80">
            <code>{`npm i @adityabd/sovereign-cache-handler

# .env.local
REDIS_URL="rediss://..."
SOVEREIGN_NAMESPACE="myapp"`}</code>
          </pre>

          <p className="mt-3 text-xs text-white/35">
            Tip: Use different namespaces to share one Redis across multiple
            Next.js apps.
          </p>
        </section>

        {/* Footer */}
        <footer className="mt-14 text-center text-xs text-white/30">
          Built for Next.js • Cache Handler + Purge Dashboard
        </footer>
      </main>
    </div>
  );
}
