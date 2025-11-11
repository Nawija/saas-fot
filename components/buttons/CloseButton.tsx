"use client";

import { X } from "lucide-react";
import React from "react";

interface CloseButtonProps {
    onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
    size?: number;
    className?: string;
    ariaLabel?: string;
    stopPropagation?: boolean;
}

export default function CloseButton({
    onClick,
    size = 20,
    className = "ml-auto p-1 w-max hover:bg-gray-50 rounded-md transition-colors absolute top-4 right-4",
    ariaLabel = "Close",
    stopPropagation = true,
}: CloseButtonProps) {
    return (
        <button
            type="button"
            aria-label={ariaLabel}
            className={className}
            onClick={(e) => {
                if (stopPropagation) e.stopPropagation();
                if (onClick) onClick(e);
            }}
        >
            <X size={size} />
        </button>
    );
}
