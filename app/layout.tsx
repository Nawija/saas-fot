import type { Metadata } from "next";
import "./globals.css";
import AppToaster from "@/components/ui/AppToaster";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
    title: "Seovileo",
    description: "",
    viewport: {
        width: "device-width",
        initialScale: 1,
        maximumScale: 5,
        userScalable: true,
        viewportFit: "cover",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={` antialiased`}>
                <Analytics />
                <AppToaster />
                <main>{children}</main>
            </body>
        </html>
    );
}
