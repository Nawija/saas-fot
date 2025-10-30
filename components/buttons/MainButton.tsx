"use client";

import React from "react";
import Link from "next/link";

interface MainButtonProps {
    label?: string;
    href?: string;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    loading?: boolean;
    loadingText?: string;
    icon?: React.ReactNode;
    variant?: "primary" | "secondary" | "danger" | "success" | "orange";
    className?: string;
    target?: "_blank" | "_self" | "_parent" | "_top";
}

const variantStyles: Record<string, string> = {
    primary:
        "bg-blue-50 hover:bg-blue-100 text-blue-800 hover:text-blue-600 border border-blue-300 hover:border-blue-200",
    orange: "bg-orange-50 hover:bg-orange-100 text-orange-800 hover:text-orange-600 border border-orange-300 hover:border-orange-200",
    success:
        "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 hover:text-emerald-600 border border-emerald-300 hover:border-emerald-200",
    secondary:
        "bg-gray-50 hover:bg-gray-100 text-gray-800 hover:text-gray-600 border border-gray-300 hover:border-gray-200",
    danger: "bg-red-50 hover:bg-red-100 text-red-800 hover:text-red-600 border border-red-300 hover:border-red-200",
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
    target,
}) => {
    const isDisabled = disabled || loading;

    const baseClasses = `
    inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg font-medium transition-all
    focus:outline-none
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
            {label && <span>{label}</span>}
        </>
    );

    if (href && !isDisabled) {
        const linkProps =
            target === "_blank"
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {};

        return (
            <Link href={href} className={baseClasses} {...linkProps}>
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
