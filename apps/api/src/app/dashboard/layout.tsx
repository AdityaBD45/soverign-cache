"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";

import {
    LayoutDashboard,
    Boxes,
    KeyRound,
    Trash2,
    ScrollText,
    BookOpen 
} from "lucide-react";

const nav = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/namespaces", label: "Namespaces", icon: Boxes },
    { href: "/dashboard/api-keys", label: "API Keys", icon: KeyRound },
    { href: "/dashboard/purge", label: "Purge", icon: Trash2 },
    { href: "/dashboard/logs", label: "Logs", icon: ScrollText },
    { href: "/dashboard/docs", label: "Docs", icon: BookOpen },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-[#0B1220] text-[#E5E7EB]">
            {/* Topbar */}
            <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-[#15369a]">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <Image
                        src="/logo1.png"
                        alt="Sovereign Cache"
                        width={180}
                        height={80}
                        className="object-contain rounded-xl border border-white/20"
                        priority
                    />
                </Link>

                <UserButton
                    appearance={{
                        elements: {
                            userButtonAvatarBox: "h-9 w-9",
                        },
                    }}
                />
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 min-h-[calc(100vh-56px)] border-r border-white/10 bg-[#0F172A] p-4">
                    <div className="text-xs font-semibold tracking-widest text-white/40 mb-3 px-2">
                        DASHBOARD
                    </div>

                    <nav className="space-y-1">
                        {nav.map((item) => {
                            const isActive =
                                item.href === "/dashboard"
                                    ? pathname === "/dashboard"
                                    : pathname === item.href || pathname.startsWith(item.href + "/");


                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={[
                                        "group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition",
                                        "border",
                                        isActive
                                            ? "bg-white/10 border-white/20 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                                            : "border-transparent text-white/70 hover:text-white hover:bg-white/5 hover:border-white/10",
                                    ].join(" ")}
                                >
                                    <Icon
                                        className={[
                                            "h-4 w-4 transition",
                                            isActive
                                                ? "text-white"
                                                : "text-white/50 group-hover:text-white/80",
                                        ].join(" ")}
                                    />
                                    <span className="flex-1">{item.label}</span>

                                    {/* Active pill */}
                                    {isActive && (
                                        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer tiny */}
                    <div className="mt-6 pt-4 border-t border-white/10 text-xs text-white/40 px-2">
                        Sovereign Cache • BYO Redis
                    </div>
                </aside>

                {/* Main */}
                <main className="flex-1 p-6 bg-[#0B1220]">{children}</main>
            </div>
        </div>
    );
}
