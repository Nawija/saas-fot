import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/navbar/Header";
import AppToaster from "@/components/ui/AppToaster";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "SaaS",
    description: "",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={` antialiased`}>
                <AppToaster />
                <main>{children}</main>
            </body>
        </html>
    );
}
