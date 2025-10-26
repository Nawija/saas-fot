"use client";

import Image from "next/image";
import React from "react";

type AuthSidePanelProps = {
    title?: string;
    subtitle?: React.ReactNode;
    /**
     * Tailwind classes controlling the gradient background.
     * Example: "from-blue-400 to-blue-700". Direction defaults to bg-linear-to-tl.
     */
    gradientFrom?: string;
    gradientTo?: string;
};

export default function AuthSidePanel({
    title = "SEOVILEO",
    subtitle = "We make it easy for you to manage your account",
    gradientFrom = "from-blue-400",
    gradientTo = "to-blue-700",
}: AuthSidePanelProps) {
    return (
        <div
            className={`hidden md:flex h-screen flex-col justify-center items-center w-1/2 bg-linear-to-tl ${gradientFrom} ${gradientTo} text-white p-10`}
        >
            <div className="text-center">
                <div className="bg-white p-3 rounded-full w-max mx-auto mb-4">
                    <Image src="/logo.svg" alt="Logo" width={60} height={60} />
                </div>
                <h2 className="text-2xl font-semibold">{title}</h2>
                {subtitle ? (
                    <p className="mt-4 text-blue-100">{subtitle}</p>
                ) : null}
            </div>
        </div>
    );
}
