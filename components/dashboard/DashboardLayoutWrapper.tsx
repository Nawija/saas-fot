import Header from "@/components/navbar/Header";
import DashboardLayoutClient from "@/components/dashboard/DashboardLayoutClient";
import { getUser } from "@/lib/auth/getUser";
import { useAuthUser } from "@/hooks";

export default async function DashboardLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getUser();

    return (
        <DashboardLayoutClient header={<Header />} user={user}>
            {children}
        </DashboardLayoutClient>
    );
}
