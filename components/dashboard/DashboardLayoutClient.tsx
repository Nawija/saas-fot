"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardMenuButton from "@/components/navbar/DashboardMenuButton";
import SetUsernameModal from "@/components/auth/SetUsernameModal";

export default function DashboardLayoutClient({
    children,
    header,
}: {
    children: React.ReactNode;
    header: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [menuSlot, setMenuSlot] = useState<HTMLElement | null>(null);
    const [showUsernameModal, setShowUsernameModal] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const isCollectionDetails = /^\/dashboard\/collections\/[^/]+$/.test(
        pathname ?? ""
    );

    useEffect(() => {
        // Find the menu slot in the header and mount the button there
        const slot = document.getElementById("dashboard-menu-slot");
        setMenuSlot(slot);
    }, []);

    useEffect(() => {
        // Check if user has set username - ONLY ONCE on mount
        const checkUsername = async () => {
            try {
                const res = await fetch("/api/user/me", {
                    cache: "no-store",
                });
                if (res.ok) {
                    const data = await res.json();
                    const user = data.user;

                    // Show modal ONLY if is_username_set is NOT true
                    // getUser() already fetches this from database via JWT token
                    if (user.is_username_set !== true) {
                        setShowUsernameModal(true);
                    }
                }
            } catch (error) {
                console.error("Error checking username:", error);
            }
        };

        checkUsername();
    }, []); // Run only once on mount

    const handleUsernameSet = (username: string) => {
        // Close modal
        setShowUsernameModal(false);

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
