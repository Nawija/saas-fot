"use client";

import React from "react";
import Link from "next/link";

interface MainButtonProps {
    label: string;
    href?: string;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    loading?: boolean;
    loadingText?: string;
    icon?: React.ReactNode;
    variant?: "primary" | "secondary" | "danger" | "success";
    className?: string;
}

const variantStyles: Record<string, string> = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    success:
        "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
    secondary:
        "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
};

const MainButton: React.FC<MainButtonProps> = ({
    label,
    href,
    onClick,
    type = "button",
    disabled = false,
    loading = false,
    loadingText = "Ładowanie...",
    icon,
    variant = "primary",
    className = "",
}) => {
    const isDisabled = disabled || loading;

    const baseClasses = `
    inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
    focus:outline-none shadow-sm
    ${variantStyles[variant] || variantStyles.primary}
    ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
    ${className}
  `;

    const spinner = (
        <span
            className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            role="status"
            aria-label="Loading"
        />
    );

    const content = loading ? (
        <>
            {spinner}
            <span>{loadingText}</span>
        </>
    ) : (
        <>
            {icon && <span className="text-lg">{icon}</span>}
            <span>{label}</span>
        </>
    );

    if (href && !isDisabled) {
        return (
            <Link href={href} className={baseClasses}>
                {content}
            </Link>
        );
    }

    return (
        <button
            type={type}
            onClick={!isDisabled ? onClick : undefined}
            disabled={isDisabled}
            className={baseClasses}
        >
            {content}
        </button>
    );
};

export default MainButton;
