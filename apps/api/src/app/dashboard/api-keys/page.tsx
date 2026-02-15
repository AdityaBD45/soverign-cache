"use client";

import { useEffect, useState } from "react";
import {
  Copy,
  KeyRound,
  Plus,
  ShieldCheck,
  ShieldOff,
  RefreshCcw,
} from "lucide-react";

type Namespace = {
  _id: string;
  name: string;
  slug: string;
};

type ApiKeyRow = {
  id?: string;
  _id?: string;

  namespaceId: string;
  namespaceSlug: string | null;
  namespaceName: string | null;

  keyPrefix: string;
  isActive: boolean;
  createdAt: string;
};

export default function ApiKeysPage() {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);

  const [selectedNamespaceId, setSelectedNamespaceId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [rawKey, setRawKey] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const [nsRes, keyRes] = await Promise.all([
        fetch("/api/dashboard/namespaces"),
        fetch("/api/dashboard/api-keys"),
      ]);

      const nsData = await nsRes.json();
      const keyData = await keyRes.json();

      if (!nsRes.ok)
        throw new Error(nsData?.error || "Failed to load namespaces");
      if (!keyRes.ok)
        throw new Error(keyData?.error || "Failed to load api keys");

      setNamespaces(nsData.namespaces || []);
      setKeys(keyData.keys || []);

      // auto-select first namespace
      if (!selectedNamespaceId && nsData.namespaces?.length > 0) {
        setSelectedNamespaceId(nsData.namespaces[0]._id);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    if (!selectedNamespaceId) {
      alert("Select a namespace first");
      return;
    }

    setCreating(true);
    setError(null);
    setRawKey(null);

    try {
      const res = await fetch("/api/dashboard/api-keys/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namespaceId: selectedNamespaceId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to create API key");

      setRawKey(data?.apiKey?.rawKey || null);

      await loadData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function toggleKey(keyId: string, nextValue: boolean) {
    const label = nextValue ? "Enable" : "Disable";
    if (!confirm(`${label} this API key?`)) return;

    try {
      const res = await fetch(`/api/dashboard/api-keys/${keyId}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextValue }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to update key");

      await loadData();
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function copyRawKey() {
    if (!rawKey) return;
    await navigator.clipboard.writeText(rawKey);
    alert("Copied!");
  }

  async function copyPrefix(prefix: string) {
    await navigator.clipboard.writeText(prefix);
    alert("Copied!");
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reusable UI styles (same as Namespaces page)
  const inputClass =
    "mt-1 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10";

  const primaryBtn =
    "inline-flex items-center justify-center gap-2 rounded-md bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 transition disabled:opacity-60 disabled:cursor-not-allowed";

  const secondaryBtn =
    "inline-flex items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 text-white px-3 py-2 text-sm font-medium hover:bg-white/10 transition disabled:opacity-60 disabled:cursor-not-allowed";

  const miniBtn =
    "inline-flex items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition";

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
          <p className="mt-2 text-sm text-white/60 max-w-2xl">
            Generate keys for your namespaces. Keys are shown only once. You can
            disable keys anytime.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className={secondaryBtn}
          title="Refresh"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-5 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Create key */}
      <div className="mt-6 rounded-md border border-white/10 bg-[#0b0b0b] p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-medium text-white/90">Generate New API Key</h2>
          <span className="text-xs text-white/40">
            Keys are shown only once
          </span>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-white/60">Loading...</p>
        ) : namespaces.length === 0 ? (
          <p className="mt-4 text-sm text-white/60">
            Create a namespace first.
          </p>
        ) : (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-white/80">
                Namespace
              </label>

              <select
                value={selectedNamespaceId}
                onChange={(e) => setSelectedNamespaceId(e.target.value)}
                className={inputClass}
              >
                {namespaces.map((ns) => (
                  <option key={ns._id} value={ns._id}>
                    {ns.name} ({ns.slug})
                  </option>
                ))}
              </select>
            </div>

            <button onClick={createKey} disabled={creating} className={primaryBtn}>
              <Plus className="h-4 w-4" />
              {creating ? "Generating..." : "Generate Key"}
            </button>
          </div>
        )}

        {/* Raw key box */}
        {rawKey && (
          <div className="mt-5 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-4">
            <div className="text-sm font-semibold text-yellow-200">
              ⚠️ Copy now — this key will not be shown again.
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input
                value={rawKey}
                readOnly
                className="w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm font-mono text-white"
              />
              <button type="button" onClick={copyRawKey} className={secondaryBtn}>
                <Copy className="h-4 w-4" />
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keys list */}
      <div className="mt-6 rounded-md border border-white/10 bg-[#0b0b0b] p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-medium text-white/90">Your API Keys</h2>
          <div className="text-xs text-white/40">
            {loading ? "Loading..." : `${keys.length} total`}
          </div>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-white/60">Loading...</p>
        ) : keys.length === 0 ? (
          <p className="mt-4 text-sm text-white/60">No keys yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-white/10 text-white/60">
                  <th className="py-2 font-medium">Namespace</th>
                  <th className="py-2 font-medium">Key Prefix</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium">Created</th>
                  <th className="py-2 font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {keys.map((k) => {
                  const keyId = k.id || k._id || "";

                  return (
                    <tr
                      key={keyId}
                      className="border-b border-white/5 hover:bg-white/[0.04] transition"
                    >
                      <td className="py-3">
                        <div className="font-medium text-white/90">
                          {k.namespaceName || "Unknown"}
                        </div>
                        <div className="text-xs text-white/40 font-mono">
                          {k.namespaceSlug ? `(${k.namespaceSlug})` : ""}
                        </div>
                      </td>

                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-white/80">
                            {k.keyPrefix}
                          </span>
                          <button
                            className={miniBtn}
                            onClick={() => copyPrefix(k.keyPrefix)}
                            title="Copy key prefix"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3">
                        {k.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-200">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-zinc-500/30 bg-zinc-500/10 px-2 py-0.5 text-xs font-medium text-zinc-200">
                            <ShieldOff className="h-3.5 w-3.5" />
                            Disabled
                          </span>
                        )}
                      </td>

                      <td className="py-3 text-white/50">
                        {k.createdAt
                          ? new Date(k.createdAt).toLocaleString()
                          : "-"}
                      </td>

                      <td className="py-3">
                        {k.isActive ? (
                          <button
                            onClick={() => toggleKey(keyId, false)}
                            className={miniBtn}
                          >
                            Disable
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleKey(keyId, true)}
                            className={miniBtn}
                          >
                            Enable
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <p className="mt-3 text-xs text-white/35">
              Tip: disable unused keys instead of deleting them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
