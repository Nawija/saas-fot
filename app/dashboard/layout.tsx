import DashboardLayoutWrapper from "@/components/dashboard/DashboardLayoutWrapper";
import type { Metadata } from "next";
import { Geist } from "next/font/google";


const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Dashboard - SEOVILEO",
    description: "Manage your photo galleries",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} antialiased`}>
                <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>
            </body>
        </html>
    );
}
