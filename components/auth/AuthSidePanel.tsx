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
    title = "Seovileo",
    subtitle = "We make it easy for you to manage your account",
}: AuthSidePanelProps) {
    return (
        <div
            className={`hidden lg:flex h-screen flex-col justify-center items-center w-1/2 bg-linear-to-t from-blue-200 via-pink-50 to-blue-100 text-gray-600 p-10`}
        >
            <div className="text-center">
                <div className="bg-white border border-gray-200 p-3 rounded-full w-max mx-auto mb-4">
                    <Image src="/logo.svg" alt="Logo" width={60} height={60} />
                </div>
                <h2 className="text-2xl font-semibold">{title}</h2>
                {subtitle && (
                    <p className="mt-4 max-w-60 mx-auto px-2">{subtitle}</p>
                )}
            </div>
        </div>
    );
}
