"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Boxes,
  KeyRound,
  Trash2,
  ScrollText,
  ArrowRight,
  Activity,
  ShieldCheck,
} from "lucide-react";

export default function DashboardHome() {
  const [loading, setLoading] = useState(true);

  const [namespaces, setNamespaces] = useState<any[]>([]);
  const [keys, setKeys] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  async function load() {
    setLoading(true);

    try {
      const [nsRes, keyRes, logsRes] = await Promise.all([
        fetch("/api/dashboard/namespaces"),
        fetch("/api/dashboard/api-keys"),
        fetch("/api/dashboard/logs"),
      ]);

      const nsData = await nsRes.json();
      const keyData = await keyRes.json();
      const logsData = await logsRes.json();

      setNamespaces(nsData.namespaces || []);
      setKeys(keyData.keys || []);
      setLogs(logsData.logs || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const totalNamespaces = namespaces.length;
  const totalKeys = keys.length;
  const activeKeys = keys.filter((k) => k.isActive).length;

  const cards = [
    {
      href: "/dashboard/namespaces",
      title: "Namespaces",
      desc: "Create and manage Redis namespaces",
      icon: Boxes,
    },
    {
      href: "/dashboard/api-keys",
      title: "API Keys",
      desc: "Generate and manage keys",
      icon: KeyRound,
    },
    {
      href: "/dashboard/purge",
      title: "Purge",
      desc: "Purge by tag or key instantly",
      icon: Trash2,
    },
    {
      href: "/dashboard/logs",
      title: "Logs",
      desc: "View purge history",
      icon: ScrollText,
    },
  ];

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-white/60 max-w-2xl">
          Manage namespaces, generate API keys, purge cache, and view logs.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-md border border-white/10 bg-[#0b0b0b] p-5">
          <div className="text-xs text-white/40">Namespaces</div>
          <div className="mt-2 text-2xl font-semibold">
            {loading ? "—" : totalNamespaces}
          </div>
        </div>

        <div className="rounded-md border border-white/10 bg-[#0b0b0b] p-5">
          <div className="text-xs text-white/40">API Keys</div>
          <div className="mt-2 text-2xl font-semibold">
            {loading ? "—" : totalKeys}
          </div>
        </div>

        <div className="rounded-md border border-white/10 bg-[#0b0b0b] p-5">
          <div className="text-xs text-white/40 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-white/40" />
            Active Keys
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {loading ? "—" : activeKeys}
          </div>
        </div>
      </div>

      {/* Main cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;

          return (
            <Link
              key={c.href}
              href={c.href}
              className="group rounded-md border border-white/10 bg-[#0b0b0b] p-5 hover:bg-white/[0.04] hover:border-white/15 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="h-10 w-10 rounded-md border border-white/10 bg-white/5 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-white/70 group-hover:text-white transition" />
                </div>

                <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-white/60 transition mt-1" />
              </div>

              <div className="mt-4 font-semibold text-white/90">{c.title}</div>

              <div className="mt-1 text-sm text-white/55 leading-relaxed">
                {c.desc}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom section */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Quick actions */}
        <div className="rounded-md border border-white/10 bg-[#0b0b0b] p-5">
          <div className="font-medium text-white/90">Quick Actions</div>

          <div className="mt-4 flex flex-col gap-3">
            <Link
              href="/dashboard/namespaces"
              className="rounded-md border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition"
            >
              ➕ Create a Namespace
            </Link>

            <Link
              href="/dashboard/api-keys"
              className="rounded-md border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition"
            >
              🔑 Generate an API Key
            </Link>

            <Link
              href="/dashboard/purge"
              className="rounded-md border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition"
            >
              🗑️ Purge Cache Now
            </Link>
          </div>
        </div>

        {/* Recent logs */}
        <div className="rounded-md border border-white/10 bg-[#0b0b0b] p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="font-medium text-white/90 flex items-center gap-2">
              <Activity className="h-4 w-4 text-white/60" />
              Recent Activity
            </div>

            <Link
              href="/dashboard/logs"
              className="text-xs text-white/50 hover:text-white transition"
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-white/60">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="mt-4 text-sm text-white/60">No logs yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {logs.slice(0, 5).map((l: any) => (
                <div
                  key={l._id}
                  className="flex items-start justify-between gap-3 border border-white/10 rounded-md px-3 py-2 bg-black"
                >
                  <div>
                    <div className="text-xs text-white/50 font-mono">
                      {l.action}
                    </div>
                    <div className="text-sm text-white/80 font-mono truncate max-w-[280px]">
                      {l.value}
                    </div>
                  </div>

                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      l.status === "SUCCESS"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                        : "border-red-500/30 bg-red-500/10 text-red-200"
                    }`}
                  >
                    {l.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-white/35">
        Tip: start by creating a namespace, then generate API keys for it.
      </div>
    </div>
  );
}
