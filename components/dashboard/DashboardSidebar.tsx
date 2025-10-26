"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Images, CreditCard, User, Menu, X } from "lucide-react";
import Image from "next/image";
import LogoutButton from "../buttons/LogoutButton";

const menuItems = [
    {
        label: "Galerie",
        href: "/dashboard/collections",
        icon: Images,
    },
    {
        label: "Rozliczenia",
        href: "/dashboard/billing",
        icon: CreditCard,
    },
    {
        label: "Profil",
        href: "/dashboard/profile",
        icon: User,
    },
];

export default function DashboardSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 lg:hidden p-4 bg-linear-to-br from-blue-600 to-blue-700 rounded-full shadow-xl border-2 border-blue-500 hover:shadow-2xl hover:scale-105 transition-all duration-200"
                aria-label="Toggle menu"
            >
                <motion.div
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {isOpen ? (
                        <X className="w-6 h-6 text-white" />
                    ) : (
                        <Menu className="w-6 h-6 text-white" />
                    )}
                </motion.div>
            </button>

            {/* Overlay dla mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 lg:border-none  z-40 lg:static lg:shadow-none transition-transform duration-300 ease-in-out ${
                    isOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                }`}
            >
                {" "}
                <Link
                    href="/dashboard"
                    className="text-base p-8 font-semibold flex items-center gap-2 text-gray-700"
                >
                    <Image
                        src="/logo.svg"
                        alt="Logo"
                        className="h-7 w-auto"
                        height={20}
                        width={20}
                    />
                    <span>Seovileo</span>
                </Link>
                <div className="flex flex-col h-full">
                    {/* Navigation */}
                    <nav className="flex-1 p-4 overflow-y-auto">
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
                                            onClick={() => setIsOpen(false)}
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
                </div>
            </aside>
        </>
    );
}
