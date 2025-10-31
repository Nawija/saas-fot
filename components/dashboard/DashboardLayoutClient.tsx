"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardMenuButton from "@/components/navbar/DashboardMenuButton";

export default function DashboardLayoutClient({
    children,
    header,
}: {
    children: React.ReactNode;
    header: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [menuSlot, setMenuSlot] = useState<HTMLElement | null>(null);
    const pathname = usePathname();

    const isCollectionDetails = /^\/dashboard\/collections\/[^/]+$/.test(
        pathname ?? ""
    );

    useEffect(() => {
        // Find the menu slot in the header and mount the button there
        const slot = document.getElementById("dashboard-menu-slot");
        setMenuSlot(slot);
    }, []);

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {header}
            {menuSlot &&
                createPortal(
                    <DashboardMenuButton
                        isOpen={sidebarOpen}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    />,
                    menuSlot
                )}
            <div className="flex flex-1 overflow-hidden w-full">
                <DashboardSidebar
                    // Force the sidebar closed on collection details pages on large screens
                    isOpen={isCollectionDetails ? false : sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    className={`transition-transform duration-300 ease-in-out ${
                        isCollectionDetails ? "lg:-translate-x-full" : ""
                    }`}
                />
                <div
                    className={`flex-1 overflow-x-hidden h-full w-full border pb-24 border-gray-200 transition-all duration-300 ease-in-out ${
                        isCollectionDetails ? "lg:-ml-64" : "lg:w-full"
                    }`}
                >
                    <main>{children}</main>
                </div>
            </div>
        </div>
    );
}
