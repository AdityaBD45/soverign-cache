"use client";

import { useEffect, useState } from "react";
import { Copy, Plus, Server } from "lucide-react";

type Namespace = {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  ownerUserId?: string;
  createdAt?: string;
};

export default function NamespacesPage() {
  const [loading, setLoading] = useState(true);
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [namespaceName, setNamespaceName] = useState("");
  const [namespaceSlug, setNamespaceSlug] = useState("");
  const [redisUrl, setRedisUrl] = useState("");

  const [creating, setCreating] = useState(false);

  // show raw key once
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  function autoSlug(v: string) {
    return v
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  async function loadNamespaces() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/dashboard/namespaces");
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to load namespaces");

      setNamespaces(data.namespaces || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function createNamespace(e: React.FormEvent) {
    e.preventDefault();

    setCreating(true);
    setError(null);
    setCreatedKey(null);

    try {
      const res = await fetch("/api/namespaces/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namespaceName,
          namespaceSlug,
          redisUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to create namespace");

      setCreatedKey(data?.apiKey?.rawKey || null);

      // reset form
      setNamespaceName("");
      setNamespaceSlug("");
      setRedisUrl("");

      // refresh list
      await loadNamespaces();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function copyKey() {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey);
    alert("Copied!");
  }

  useEffect(() => {
    loadNamespaces();
  }, []);

  // Reusable UI styles
  const inputClass =
    "mt-1 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10";

  const primaryBtn =
    "inline-flex items-center justify-center gap-2 rounded-md bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 transition disabled:opacity-60 disabled:cursor-not-allowed";

  const secondaryBtn =
    "inline-flex items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 text-white px-3 py-2 text-sm font-medium hover:bg-white/10 transition disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Namespaces</h1>
          <p className="mt-2 text-sm text-white/60 max-w-2xl">
            A namespace isolates your cache. Each namespace stores its own Redis
            URL (Upstash, Redis Cloud, self-hosted).
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-white/40 mt-1">
          <Server className="h-4 w-4" />
          BYO Redis
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-5 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Create form */}
      <div className="mt-6 rounded-md border border-white/10 bg-[#0b0b0b] p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-medium text-white/90">Create Namespace</h2>
          <span className="text-xs text-white/40">
            Stored encrypted • never shown again
          </span>
        </div>

        <form onSubmit={createNamespace} className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-white/80">
              Namespace Name
            </label>
            <input
              value={namespaceName}
              onChange={(e) => {
                const v = e.target.value;
                setNamespaceName(v);
                setNamespaceSlug(autoSlug(v)); // ✅ always auto
              }}
              className={inputClass}
              placeholder="My Product"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white/80">
              Namespace Slug (auto)
            </label>
            <input
              value={namespaceSlug}
              readOnly
              className={inputClass + " font-mono text-white/70"}
              placeholder="auto-generated"
            />
            <p className="mt-1 text-xs text-white/40">
              Used inside Redis keys. Generated automatically.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-white/80">
              Redis URL
            </label>
            <input
              value={redisUrl}
              onChange={(e) => setRedisUrl(e.target.value)}
              className={inputClass + " font-mono"}
              placeholder="rediss://default:xxxx@xxx.upstash.io:6379"
              required
            />
            <p className="mt-1 text-xs text-white/40">
              Stored encrypted. Never shown again.
            </p>
          </div>

          <div className="pt-1">
            <button type="submit" disabled={creating} className={primaryBtn}>
              <Plus className="h-4 w-4" />
              {creating ? "Creating..." : "Create + Generate API Key"}
            </button>
          </div>
        </form>

        {/* Raw key box */}
        {createdKey && (
          <div className="mt-5 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-4">
            <div className="text-sm font-semibold text-yellow-200">
              ⚠️ Copy now — this key will not be shown again.
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input
                value={createdKey}
                readOnly
                className="w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm font-mono text-white"
              />
              <button type="button" onClick={copyKey} className={secondaryBtn}>
                <Copy className="h-4 w-4" />
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="mt-6 rounded-md border border-white/10 bg-[#0b0b0b] p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-medium text-white/90">Your Namespaces</h2>

          <div className="text-xs text-white/40">
            {loading ? "Loading..." : `${namespaces.length} total`}
          </div>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-white/60">Loading...</p>
        ) : namespaces.length === 0 ? (
          <p className="mt-4 text-sm text-white/60">
            No namespaces created yet.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-white/10 text-white/60">
                  <th className="py-2 font-medium">Name</th>
                  <th className="py-2 font-medium">Slug</th>
                  <th className="py-2 font-medium">Created</th>
                </tr>
              </thead>

              <tbody>
                {namespaces.map((ns: any) => (
                  <tr
                    key={ns._id || ns.id || ns.slug}
                    className="border-b border-white/5 hover:bg-white/[0.04] transition"
                  >
                    <td className="py-3 font-medium text-white/90">
                      {ns.name}
                    </td>

                    <td className="py-3 font-mono text-white/70">{ns.slug}</td>

                    <td className="py-3 text-white/50">
                      {ns.createdAt
                        ? new Date(ns.createdAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-3 text-xs text-white/35">
              Status will become real once we add Redis connection testing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
