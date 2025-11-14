import type { Metadata } from "next";
import "./globals.css";
import AppToaster from "@/components/ui/AppToaster";
import { Analytics } from "@vercel/analytics/next";
import { ClientProviders } from "@/components/ClientProviders";
import { Inter, Playfair_Display, Poppins } from "next/font/google";

// Preload common site fonts globally so they're available to the app and
// copied into the preview iframe (next/font injects the @font-face rules).
const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"] });
const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "600", "700"],
});
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

export const metadata: Metadata = {
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
        <html lang="en" className={inter.className}>
            <body className={`antialiased`}>
                <Analytics />
                <AppToaster />
                <ClientProviders>
                    <main>{children}</main>
                </ClientProviders>
            </body>
        </html>
    );
}
