import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Header from "@/components/navbar/Header";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

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
                <div className="flex flex-col h-screen overflow-hidden">
                    <div className="flex flex-1 overflow-hidden">
                        <DashboardSidebar />
                        <div className="flex-1 overflow-y-auto bg-gray-50">
                            <Header />
                            <main className="border-l border-gray-200">{children}</main>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
