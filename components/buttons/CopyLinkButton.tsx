"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
    Copy,
    Check,
    Link as LinkIcon,
    Sparkles,
    CheckCircle,
} from "lucide-react";

interface CopyLinkButtonProps {
    url: string;
    showUrl?: boolean;
    label?: string;
    variant?: "default" | "outline";
}

interface Confetti {
    id: number;
    x: number;
    y: number;
    rotation: number;
    scale: number;
    color: string;
}

export default function CopyLinkButton({
    url,
    showUrl = false,
    label = "Kopiuj",
    variant = "default",
}: CopyLinkButtonProps) {
    const [copied, setCopied] = useState(false);
    const [confetti, setConfetti] = useState<Confetti[]>([]);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (copied && confetti.length > 0) {
            const timer = setTimeout(() => setConfetti([]), 1000);
            return () => clearTimeout(timer);
        }
    }, [copied, confetti]);

    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Link skopiowany do schowka");

            // Generate confetti - strzelają w boki
            const newConfetti: Confetti[] = [];
            const colors = [
                "#fb923c",
                "#fdba74",
                "#fbbf24",
                "#fcd34d",
                "#34d399",
                "#6ee7b7",
            ];

            for (let i = 0; i < 25; i++) {
                // Strzelają bardziej w boki (-90 do +90 stopni)
                const angle = (Math.random() - 0.5) * 180; // -90 do +90 stopni
                const distance = Math.random() * 120 + 40; // 40-160px
                const x = Math.sin((angle * Math.PI) / 180) * distance;
                const y =
                    -Math.abs(Math.cos((angle * Math.PI) / 180)) *
                    distance *
                    0.3; // lekko w górę

                newConfetti.push({
                    id: i,
                    x: x,
                    y: y,
                    rotation: Math.random() * 720,
                    scale: Math.random() * 0.8 + 0.5,
                    color: colors[Math.floor(Math.random() * colors.length)],
                });
            }
            setConfetti(newConfetti);

            setTimeout(() => setCopied(false), 2500);
        } catch {
            toast.error("Nie udało się skopiować linku");
        }
    }

    const buttonClasses = copied
        ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 hover:border-emerald-200"
        : "bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-300 hover:border-orange-200";

    return (
        <div className="flex items-center flex-col sm:flex-row gap-2">
            {showUrl && (
                <div
                    className={`relative flex w-full items-center gap-2 px-3 py-2 rounded-xl bg-white border-2 border-gray-200`}
                >
                    {copied && (
                        <div className="absolute inset-0 rounded-xl pointer-events-none animate-border-shimmer" />
                    )}
                    <LinkIcon className="w-4 h-4 text-gray-400 shrink-0 relative z-10" />
                    <p className="text-base text-gray-800 flex-1 truncate relative z-10">
                        {url}
                    </p>
                </div>
            )}
            <button
                ref={buttonRef}
                onClick={copyToClipboard}
                className={`relative flex items-center justify-center min-w-[140px] px-4 py-2.5 rounded-lg gap-2 text-sm font-medium transition-all duration-300 shadow-sm overflow-visible ${buttonClasses}`}
            >
                {/* Confetti */}
                {confetti.map((conf) => (
                    <span
                        key={conf.id}
                        className="absolute pointer-events-none"
                        style={
                            {
                                left: "50%",
                                top: "100%",
                                width: "6px",
                                height: "6px",
                                backgroundColor: conf.color,
                                borderRadius: "2px",
                                animation: `confetti-pop 1s ease-out forwards`,
                                "--conf-x": `${conf.x}px`,
                                "--conf-y": `${conf.y}px`,
                                "--conf-rotate": `${conf.rotation}deg`,
                                "--conf-scale": conf.scale,
                            } as React.CSSProperties
                        }
                    />
                ))}

                {/* Content with slide animation */}
                <div className="relative flex items-center justify-center gap-2 w-full h-5">
                    {/* Default state - slides up and fades */}
                    <div
                        className={`absolute inset-0 flex items-center justify-center gap-2 transition-all duration-400 ease-out ${
                            copied
                                ? "-translate-y-4 opacity-0"
                                : "translate-y-0 opacity-100"
                        }`}
                    >
                        <Copy size={15} className="shrink-0" />
                        <span>{label}</span>
                    </div>

                    {/* Copied state - slides up from bottom */}
                    <div
                        className={`absolute inset-0 flex items-center justify-center gap-2 transition-all duration-400 ease-out ${
                            copied
                                ? "translate-y-0 opacity-100"
                                : "translate-y-4 opacity-0"
                        }`}
                    >
                        <CheckCircle size={15} className="shrink-0" />
                        <span className="font-semibold">Skopiowano!</span>
                    </div>
                </div>
            </button>
        </div>
    );
}
