import Header from "@/components/navbar/Header";
import DashboardLayoutClient from "@/components/dashboard/DashboardLayoutClient";

export default function DashboardLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardLayoutClient header={<Header />}>
            {children}
        </DashboardLayoutClient>
    );
}
