"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Images, CreditCard, LifeBuoy } from "lucide-react";
import LogoutButton from "../buttons/LogoutButton";

const menuItems = [
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
    {
        label: "Support",
        href: "/support",
        icon: LifeBuoy,
    },
];

interface DashboardSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    className?: string;
}

export default function DashboardSidebar({
    isOpen,
    onClose,
    className = "",
}: DashboardSidebarProps) {
    const pathname = usePathname();

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
                        <ul className="space-y-2">
                            {menuItems.map((item) => {
                                const isActive =
                                    pathname === item.href ||
                                    pathname?.startsWith(item.href + "/");
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

                    {/* Logout Button */}
                    <div className="p-4 border-t border-gray-200">
                        <LogoutButton />
                    </div>
                </div>
            </aside>
        </div>
    );
}
