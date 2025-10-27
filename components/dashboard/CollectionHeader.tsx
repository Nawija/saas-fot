"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Link as LinkIcon,
    Lock,
    Globe,
    Eye,
    Check,
    Copy,
} from "lucide-react";

interface Collection {
    id: number;
    name: string;
    slug: string;
    description?: string;
    hero_image?: string;
    is_public: boolean;
    password_plain?: string;
    created_at: string;
    photo_count: number;
}

interface Photo {
    id: number;
    file_path: string;
    file_name: string;
    file_size: number;
    created_at: string;
}

interface Props {
    collection: Collection;
    photos: Photo[];
}

function formatFileSize(bytes: number): string {
    const numBytes = Number(bytes) || 0;
    if (!numBytes) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = numBytes;
    let i = 0;
    while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
    }
    return `${size.toFixed(size >= 100 ? 0 : 1)} ${units[i]}`;
}

export default function PremiumCollectionHeader({ collection, photos }: Props) {
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const [origin, setOrigin] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") setOrigin(window.location.origin);
    }, []);

    const galleryUrl = useMemo(
        () => `${origin}/gallery/${collection.slug}`,
        [origin, collection.slug]
    );
    const totalSize = useMemo(
        () => photos.reduce((sum, p) => sum + p.file_size, 0),
        [photos]
    );

    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(galleryUrl);
            setCopied(true);
            toast.success("Link skopiowany");
            setTimeout(() => setCopied(false), 1500);
        } catch {
            toast.error("Nie udało się skopiować linku");
        }
    }

    return (
        <section className="mb-8">
            {/* Powrót i status */}
            <div className="flex items-center justify-between mb-3">
                <button
                    onClick={() => router.push("/dashboard/collections")}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Powrót
                </button>
                <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm select-none whitespace-nowrap
            ${
                collection.is_public
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-amber-50 text-amber-800"
            }`}
                >
                    {collection.is_public ? (
                        <>
                            <Globe className="w-4 h-4" /> Publiczna
                        </>
                    ) : (
                        <>
                            <Lock className="w-4 h-4" /> Chroniona
                        </>
                    )}
                </div>
            </div>

            {/* Hero */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
                {/* Hero */}
                <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
                    {collection.hero_image ? (
                        <div className="relative h-40 sm:h-48 md:h-56 lg:h-80">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out scale-100 hover:scale-105"
                                style={{
                                    backgroundImage: `url(${collection.hero_image})`,
                                }}
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/30 to-transparent" />

                            {/* Tekst hero */}
                            <div className="absolute bottom-4 left-1/2 sm:left-6 transform -translate-x-1/2 sm:translate-x-0 text-center sm:text-left text-white px-4 sm:px-0 max-w-[90%] sm:max-w-lg">
                                <motion.h1
                                    className="text-xl sm:text-2xl font-bold tracking-tight mb-1 drop-shadow-md"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    {collection.name}
                                </motion.h1>
                                {collection.description && (
                                    <motion.p
                                        className="text-xs sm:text-sm opacity-90 line-clamp-2 leading-snug"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{
                                            delay: 0.15,
                                            duration: 0.4,
                                        }}
                                    >
                                        {collection.description}
                                    </motion.p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-32 sm:h-40 text-slate-500 bg-slate-50">
                            <LinkIcon className="w-6 h-6 mb-1 opacity-60" />
                            <p className="text-sm">Brak zdjęcia głównego</p>
                        </div>
                    )}
                </div>

                <div className="p-5 space-y-5">
                    {/* Sekcja udostępnienia */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <LinkIcon className="w-4 h-4 text-slate-500 shrink-0" />
                            <code className="flex-1 text-xs sm:text-sm text-slate-700 truncate">
                                {galleryUrl}
                            </code>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <motion.button
                                onClick={copyToClipboard}
                                whileTap={{ scale: 0.96 }}
                                className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition ${
                                    copied
                                        ? "bg-emerald-600"
                                        : "bg-indigo-600 hover:bg-indigo-700"
                                }`}
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.span
                                        key={copied ? "copied" : "copy"}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-4 h-4" />{" "}
                                                Skopiowano
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />{" "}
                                                Kopiuj
                                            </>
                                        )}
                                    </motion.span>
                                </AnimatePresence>
                            </motion.button>
                            <a
                                href={galleryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition flex items-center justify-center gap-2"
                            >
                                <Eye className="w-4 h-4" /> Zobacz
                            </a>
                        </div>
                    </div>

                    {/* Hasło */}
                    {!collection.is_public && collection.password_plain && (
                        <div className="flex items-center justify-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4" /> Hasło:
                            </div>
                            <span className="font-mono font-semibold break-all">
                                {collection.password_plain}
                            </span>
                        </div>
                    )}

                    {/* Statystyki */}
                    <div className="grid grid-cols-3 gap-4 text-center bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4">
                        <div>
                            <div className="text-sm sm:text-lg font-bold text-slate-900">
                                {collection.photo_count}
                            </div>
                            <div className="text-xs text-slate-500">Zdjęć</div>
                        </div>
                        <div>
                            <div className="text-sm sm:text-lg font-bold text-slate-900">
                                {formatFileSize(totalSize)}
                            </div>
                            <div className="text-xs text-slate-500">
                                Rozmiar
                            </div>
                        </div>
                        <div>
                            <div className="text-sm sm:text-lg font-bold text-slate-900">
                                {new Date(
                                    collection.created_at
                                ).toLocaleDateString("pl-PL")}
                            </div>
                            <div className="text-xs text-slate-500">
                                Utworzona
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
