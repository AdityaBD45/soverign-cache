"use client";

import { useEffect, useState } from "react";
import {
  RefreshCcw,
  Tag,
  KeyRound,
  Trash2,
  Server,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type Namespace = {
  _id: string;
  name: string;
  slug: string;
};

export default function PurgePage() {
  const [loading, setLoading] = useState(true);
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [selectedNamespaceId, setSelectedNamespaceId] = useState("");

  const [tag, setTag] = useState("");
  const [key, setKey] = useState("");

  const [purgingTag, setPurgingTag] = useState(false);
  const [purgingKey, setPurgingKey] = useState(false);

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadNamespaces() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/dashboard/namespaces");
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to load namespaces");

      setNamespaces(data.namespaces || []);

      if (data.namespaces?.length > 0) {
        setSelectedNamespaceId(data.namespaces[0]._id);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function purgeTag() {
    if (!selectedNamespaceId) return alert("Select namespace first");
    if (!tag.trim()) return alert("Enter tag");

    setPurgingTag(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/dashboard/purge-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namespaceId: selectedNamespaceId,
          tag: tag.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Purge tag failed");

      setResult({ type: "TAG", ok: true, data });
      setTag("");
    } catch (e: any) {
      setError(e.message);
      setResult({ type: "TAG", ok: false, error: e.message });
    } finally {
      setPurgingTag(false);
    }
  }

  async function purgeKey() {
    if (!selectedNamespaceId) return alert("Select namespace first");
    if (!key.trim()) return alert("Enter key");

    setPurgingKey(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/dashboard/purge-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namespaceId: selectedNamespaceId,
          key: key.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Purge key failed");

      setResult({ type: "KEY", ok: true, data });
      setKey("");
    } catch (e: any) {
      setError(e.message);
      setResult({ type: "KEY", ok: false, error: e.message });
    } finally {
      setPurgingKey(false);
    }
  }

  useEffect(() => {
    loadNamespaces();
  }, []);

  // UI styles (same as other pages)
  const inputClass =
    "mt-1 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10";

  const primaryBtn =
    "inline-flex items-center justify-center gap-2 rounded-md bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 transition disabled:opacity-60 disabled:cursor-not-allowed";

  const secondaryBtn =
    "inline-flex items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 text-white px-3 py-2 text-sm font-medium hover:bg-white/10 transition disabled:opacity-60 disabled:cursor-not-allowed";

  function resultBadge() {
    if (!result) return null;

    if (result.ok) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Success
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-200">
        <XCircle className="h-3.5 w-3.5" />
        Failed
      </span>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Purge</h1>
          <p className="mt-2 text-sm text-white/60 max-w-2xl">
            Purge cache instantly by tag or key. This deletes keys directly from
            the Redis connected to the selected namespace.
          </p>
        </div>

        <button
          onClick={loadNamespaces}
          disabled={loading}
          className={secondaryBtn}
          title="Refresh namespaces"
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

      {/* Namespace selector */}
      <div className="mt-6 rounded-md border border-white/10 bg-[#0b0b0b] p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-medium text-white/90 flex items-center gap-2">
            <Server className="h-4 w-4 text-white/60" />
            Select Namespace
          </h2>

          <span className="text-xs text-white/40">
            {loading ? "Loading..." : `${namespaces.length} available`}
          </span>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-white/60">Loading...</p>
        ) : namespaces.length === 0 ? (
          <p className="mt-4 text-sm text-white/60">
            Create a namespace first.
          </p>
        ) : (
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
        )}
      </div>

      {/* Purge cards */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Purge by Tag */}
        <div className="rounded-md border border-white/10 bg-[#0b0b0b] p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-medium text-white/90 flex items-center gap-2">
              <Tag className="h-4 w-4 text-white/60" />
              Purge by Tag
            </h2>

            <span className="text-xs text-white/40">
              Deletes all keys linked to this tag
            </span>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-white/70">Tag</label>
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className={inputClass + " font-mono"}
              placeholder="products"
            />
            <p className="mt-2 text-xs text-white/35">
              Example: <span className="font-mono">products</span>
            </p>
          </div>

          <div className="mt-4">
            <button
              onClick={purgeTag}
              disabled={purgingTag}
              className={primaryBtn}
            >
              <Trash2 className="h-4 w-4" />
              {purgingTag ? "Purging..." : "Purge Tag"}
            </button>
          </div>
        </div>

        {/* Purge by Key */}
        <div className="rounded-md border border-white/10 bg-[#0b0b0b] p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-medium text-white/90 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-white/60" />
              Purge by Key
            </h2>

            <span className="text-xs text-white/40">
              Deletes a single cache key
            </span>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-white/70">Key</label>
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className={inputClass + " font-mono"}
              placeholder="GET:/api/products?page=1"
            />
            <p className="mt-2 text-xs text-white/35">
              Paste the full cache key exactly as stored.
            </p>
          </div>

          <div className="mt-4">
            <button
              onClick={purgeKey}
              disabled={purgingKey}
              className={primaryBtn}
            >
              <Trash2 className="h-4 w-4" />
              {purgingKey ? "Purging..." : "Purge Key"}
            </button>
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="mt-6 rounded-md border border-white/10 bg-[#0b0b0b] p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-medium text-white/90">Result</h2>
            {resultBadge()}
          </div>

          <pre className="mt-4 text-xs bg-black p-4 rounded-md overflow-x-auto border border-white/10 text-white/80">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
