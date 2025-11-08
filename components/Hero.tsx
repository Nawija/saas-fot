"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import MainButton from "@/components/buttons/MainButton";

type CTA = {
    label: string;
    href: string;
    variant?: string;
    icon?: ReactNode;
    className?: string;
};

interface HeroProps {
    badge?: string;
    badgeIcon?: ReactNode;
    // simple title string (recommended) or full ReactNode for custom cases
    title: string | ReactNode;
    // optional highlighted fragment — will be wrapped with the gradient class
    highlight?: string;
    subtitle?: string;
    cta?: CTA[];
    className?: string;
}

export default function Hero({
    badge,
    badgeIcon,
    title,
    highlight,
    subtitle,
    cta,
    className,
}: HeroProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`text-center space-y-6 pt-8 ${className || ""}`}
        >
            {badge && (
                <div className="inline-flex items-center text-blue-600 gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
                    {badgeIcon}
                    <span className="text-sm font-medium">{badge}</span>
                </div>
            )}

            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
                {typeof title === "string" ? (
                    highlight ? (
                        <>
                            {title}{" "}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-400 via-indigo-500 to-pink-500">
                                {highlight}
                            </span>
                        </>
                    ) : (
                        title
                    )
                ) : (
                    title
                )}
            </h1>

            {subtitle && (
                <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
                    {subtitle}
                </p>
            )}

            {cta && cta.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                    {cta.map((c, i) => (
                        <MainButton
                            key={i}
                            href={c.href}
                            variant={(c.variant as any) || "primary"}
                            icon={c.icon}
                            label={c.label}
                            className={c.className}
                        />
                    ))}
                </div>
            )}
        </motion.section>
    );
}
