"use client";

import { useEffect, useState } from "react";
import {
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Tag,
  KeyRound,
  ScrollText,
} from "lucide-react";

type LogRow = {
  _id: string;
  ownerUserId: string;
  namespaceId: string;
  apiKeyId?: string;

  action: "PURGE_TAG" | "PURGE_KEY";
  value: string;
  status: "SUCCESS" | "FAILED";
  message?: string;

  createdAt: string;
};

export default function LogsPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadLogs() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/dashboard/logs");
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to load logs");

      setLogs(data.logs || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  // Reusable button styles (same system)
  const secondaryBtn =
    "inline-flex items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 text-white px-3 py-2 text-sm font-medium hover:bg-white/10 transition disabled:opacity-60 disabled:cursor-not-allowed";

  function statusBadge(status: string) {
    if (status === "SUCCESS") {
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

  function actionBadge(action: string) {
    if (action === "PURGE_TAG") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-200">
          <Tag className="h-3.5 w-3.5" />
          PURGE_TAG
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-200">
        <KeyRound className="h-3.5 w-3.5" />
        PURGE_KEY
      </span>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Logs</h1>
          <p className="mt-2 text-sm text-white/60">
            Last 50 purge actions across all namespaces.
          </p>
        </div>

        <button onClick={loadLogs} disabled={loading} className={secondaryBtn}>
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

      {/* Table */}
      <div className="mt-6 rounded-md border border-white/10 bg-[#0b0b0b] p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-medium text-white/90 flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-white/60" />
            Activity
          </h2>

          <div className="text-xs text-white/40">
            {loading ? "Loading..." : `${logs.length} events`}
          </div>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-white/60">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="mt-4 text-sm text-white/60">No logs yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-white/10 text-white/60">
                  <th className="py-2 font-medium">Action</th>
                  <th className="py-2 font-medium">Value</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium">Message</th>
                  <th className="py-2 font-medium">Time</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="border-b border-white/5 hover:bg-white/[0.04] transition"
                  >
                    <td className="py-3">{actionBadge(log.action)}</td>

                    <td className="py-3 font-mono text-white/80">
                      {log.value}
                    </td>

                    <td className="py-3">{statusBadge(log.status)}</td>

                    <td className="py-3 text-white/50 max-w-[360px] truncate">
                      {log.message || "-"}
                    </td>

                    <td className="py-3 text-white/50">
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-3 text-xs text-white/35">
              Logs include both successful and failed purges.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
