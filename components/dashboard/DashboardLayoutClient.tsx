"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardMenuButton from "@/components/navbar/DashboardMenuButton";
import SetUsernameModal from "@/components/auth/SetUsernameModal";

interface User {
    id: string;
    email: string;
    username?: string;
    is_username_set: boolean;
}

export default function DashboardLayoutClient({
    children,
    header,
    user,
}: {
    children: React.ReactNode;
    header: React.ReactNode;
    user: User | null;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [menuSlot, setMenuSlot] = useState<HTMLElement | null>(null);
    const pathname = usePathname();

    // Show modal ONLY if user is loaded and is_username_set is NOT true
    const showUsernameModal = user !== null && user.is_username_set !== true;

    const isCollectionDetails = /^\/dashboard\/collections\/[^/]+$/.test(
        pathname ?? ""
    );

    useEffect(() => {
        // Find the menu slot in the header and mount the button there
        const slot = document.getElementById("dashboard-menu-slot");
        setMenuSlot(slot);
    }, []);

    const handleUsernameSet = (username: string) => {
        // Reload page to refresh JWT token with updated user data
        window.location.reload();
    };

    return (
        <>
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
                        // allow mobile open/close, but hide on large screens for collection details
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                        className={`transition-transform duration-300 ease-in-out ${
                            isCollectionDetails ? "lg:-translate-x-full" : ""
                        }`}
                        username={user?.username}
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

            {/* Username Setup Modal - cannot be closed */}
            <SetUsernameModal
                open={showUsernameModal}
                onSuccess={handleUsernameSet}
            />
        </>
    );
}
