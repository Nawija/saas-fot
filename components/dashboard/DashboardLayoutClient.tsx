"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
                <div className="flex-1 overflow-y-auto border border-gray-200">
                    <main>{children}</main>
                </div>
            </div>
        </div>
    );
}
