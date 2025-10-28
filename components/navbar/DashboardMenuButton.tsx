"use client";

import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardMenuButtonProps {
    isOpen: boolean;
    onClick: () => void;
}

export default function DashboardMenuButton({
    isOpen,
    onClick,
}: DashboardMenuButtonProps) {
    return (
        <button
            onClick={onClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
        >
            <motion.div
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
            >
                {isOpen ? (
                    <X className="w-5 h-5 text-gray-700" />
                ) : (
                    <Menu className="w-5 h-5 text-gray-700" />
                )}
            </motion.div>
        </button>
    );
}
