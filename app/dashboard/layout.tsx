import DashboardLayoutWrapper from "@/components/dashboard/DashboardLayoutWrapper";
import type { Metadata } from "next";


export const metadata: Metadata = {
    title: "Dashboard - Seovileo",
    description: "Manage your photo galleries",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>
            </body>
        </html>
    );
}
