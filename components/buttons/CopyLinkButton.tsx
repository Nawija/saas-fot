"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Check, Link as LinkIcon } from "lucide-react";

interface CopyLinkButtonProps {
    url: string;
    showUrl?: boolean;
    label?: string;
    variant?: "default" | "outline";
}

export default function CopyLinkButton({
    url,
    showUrl = false,
    label = "Kopiuj",
    variant = "default",
}: CopyLinkButtonProps) {
    const [copied, setCopied] = useState(false);

    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Link skopiowany do schowka");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Nie udało się skopiować linku");
        }
    }

    const variantClasses =
        variant === "outline"
            ? "bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            : copied
            ? "bg-green-600 text-white"
            : "bg-gray-900 text-white hover:bg-gray-800";

    return (
        <div className="flex gap-2">
            {showUrl && (
                <div className="flex w-full items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200">
                    <LinkIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    <p className="text-base text-gray-800 flex-1">
                        {url}
                    </p>
                </div>
            )}
            <button
                onClick={copyToClipboard}
                className={`flex items-center justify-center w-40 rounded-lg gap-2 text-sm font-medium transition-all shadow-sm ${variantClasses}`}
            >
                {copied ? (
                    <>
                        <Check size={15} />
                        Skopiowano!
                    </>
                ) : (
                    <>
                        <Copy size={15} />
                        {label}
                    </>
                )}
            </button>
        </div>
    );
}
