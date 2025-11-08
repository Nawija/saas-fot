"use client";

import Header from "@/components/navbar/Header";
import DashboardLayoutClient from "@/components/dashboard/DashboardLayoutClient";
import { useAuthUser } from "@/hooks";
import Loading from "@/components/ui/Loading";

export default function DashboardLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuthUser();

    if (loading) {
        return <Loading />;
    }

    return (
        <DashboardLayoutClient header={<Header />} user={user}>
            {children}
        </DashboardLayoutClient>
    );
}
