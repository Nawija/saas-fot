"use client";

import Link from "next/link";
import { LifeBuoy } from "lucide-react";

export default function FooterDashboard() {
    return (
        <footer className="bg-white border-t mt-12 border-gray-200 py-3 px-4 z-30">
            <div className="max-w-7xl mx-auto flex items-center justify-center">
                <Link
                    href="/support"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <LifeBuoy className="w-4 h-4" />
                    <span>Support</span>
                </Link>
            </div>
        </footer>
    );
}
