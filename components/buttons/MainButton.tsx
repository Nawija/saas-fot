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
    variant?:
        | "primary"
        | "secondary"
        | "danger"
        | "success"
        | "orange"
        | "purple"
        | "teal"
        | "ghost";
    className?: string;
    target?: "_blank" | "_self" | "_parent" | "_top";
}

const variantStyles: Record<string, string> = {
    primary:
        "bg-gray-900 hover:bg-gray-800 text-white border border-gray-900 shadow-sm hover:shadow-md",
    secondary:
        "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-gray-300 shadow-sm",
    ghost: "bg-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-200",
    danger: "bg-white hover:bg-red-50 text-red-600 border border-gray-200 hover:border-red-200 shadow-sm",
    success:
        "bg-white hover:bg-green-50 text-gray-900 border border-gray-200 hover:border-green-200 shadow-sm",
    orange: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-gray-300 shadow-sm",
    purple: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-gray-300 shadow-sm",
    teal: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-gray-300 shadow-sm",
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
    inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2
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
