"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Images, CreditCard, LayoutDashboard, Globe } from "lucide-react";
import LogoutButton from "../buttons/LogoutButton";
import Logo from "../navbar/Logo";

const menuItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Galleries",
        href: "/dashboard/collections",
        icon: Images,
    },
    {
        label: "Billing",
        href: "/dashboard/billing",
        icon: CreditCard,
    },
];

interface DashboardSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    className?: string;
    username?: string;
}

export default function DashboardSidebar({
    isOpen,
    onClose,
    className = "",
    username,
}: DashboardSidebarProps) {
    const pathname = usePathname();

    // Generate public gallery URL
    const publicGalleryUrl = username
        ? `https://${encodeURIComponent(username)}.seovileo.pl/`
        : null;

    return (
        <div className={className}>
            {/* Overlay dla mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 w-64 bg-white z-40 lg:static lg:shadow-none transition-transform duration-300 ease-in-out h-full ${
                    isOpen ? "" : "-translate-x-full lg:translate-x-0"
                } `}
            >
                <div className="flex flex-col h-full">
                    {/* Navigation */}
                    <nav
                        className="flex-1 p-4 overflow-y-auto"
                        style={{ height: "calc(100vh - 73px)" }}
                    >
                        <div className="px-4 mb-6 lg:hidden">
                            <Logo href="/dashboard" />
                        </div>
                        <ul className="space-y-2">
                            {menuItems.map((item) => {
                                const isActive =
                                    item.href === "/dashboard"
                                        ? pathname === item.href
                                        : pathname?.startsWith(item.href);
                                const Icon = item.icon;

                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={onClose}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                                isActive
                                                    ? "bg-blue-50 text-blue-700 font-semibold"
                                                    : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                        >
                                            <Icon
                                                className={`w-5 h-5 ${
                                                    isActive
                                                        ? "text-blue-700"
                                                        : "text-gray-500"
                                                }`}
                                            />
                                            <span>{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="px-4 py-3">
                        {publicGalleryUrl && (
                            <a
                                href={publicGalleryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-between px-4 py-3 rounded-lg bg-linear-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 transition-all duration-200"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-md bg-white shadow-sm">
                                        <Globe className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900">
                                            Public Gallery
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {username}.seovileo.pl
                                        </span>
                                    </div>
                                </div>
                                <div className="text-blue-600 group-hover:translate-x-0.5 transition-transform">
                                    →
                                </div>
                            </a>
                        )}
                    </div>

                    {/* Public Gallery Link & Logout Button */}
                    <div className="p-4 border-t border-gray-200 space-y-2">
                        <LogoutButton />
                    </div>
                </div>
            </aside>
        </div>
    );
}
