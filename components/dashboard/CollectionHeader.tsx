// components/dashboard/CollectionHeader.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
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
    description: string;
    hero_image: string;
    hero_template?: string;
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

interface CollectionHeaderProps {
    collection: Collection;
    photos: Photo[];
}

function formatFileSize(bytes: number): string {
    const numBytes = typeof bytes === "string" ? parseInt(bytes) : bytes;
    if (numBytes > 1e10) {
        console.error("Suspicious file size:", numBytes, "original:", bytes);
        return "0 B (błąd)";
    }
    if (numBytes === 0 || !numBytes) return "0 B";
    if (isNaN(numBytes) || !isFinite(numBytes)) return "0 B";

    const units = ["B", "KB", "MB", "GB"];
    const k = 1024;
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    const size = numBytes / Math.pow(k, i);
    return `${size.toFixed(1)} ${units[i]}`;
}

export default function CollectionHeader({
    collection,
    photos,
}: CollectionHeaderProps) {
    const router = useRouter();
    const [copied, setCopied] = useState(false);

    const galleryUrl = `${
        typeof window !== "undefined" ? window.location.origin : ""
    }/gallery/${collection.slug}`;

    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(galleryUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (error) {
            toast.error("Nie udało się skopiować");
        }
    }

    const totalSize = photos.reduce((sum, p) => sum + p.file_size, 0);

    return (
        <div className="mb-8">
            <button
                onClick={() => router.push("/dashboard/collections")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Powrót do kolekcji
            </button>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {collection.name}
                            </h1>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    collection.is_public
                                        ? "bg-green-100 text-green-700"
                                        : "bg-orange-100 text-orange-700"
                                }`}
                            >
                                {collection.is_public ? (
                                    <span className="flex items-center gap-1">
                                        <Globe className="w-3 h-3" /> Publiczna
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        <Lock className="w-3 h-3" /> Chroniona
                                    </span>
                                )}
                            </span>
                        </div>

                        {collection.description && (
                            <p className="text-gray-600 mb-4">
                                {collection.description}
                            </p>
                        )}

                        {/* Hasło dla prywatnych galerii */}
                        {!collection.is_public && collection.password_plain && (
                            <div className="flex items-center justify-start gap-2 mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                <p className="text-sm text-orange-700 font-medium">
                                    Hasło dostępu dla klientów:
                                </p>
                                <code className="text-base font-mono text-orange-900 font-semibold">
                                    {collection.password_plain}
                                </code>
                            </div>
                        )}

                        {/* Link do udostępnienia */}
                        <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <LinkIcon className="w-4 h-4 text-gray-400" />
                            <code className="flex-1 text-sm text-gray-700 font-mono">
                                {galleryUrl}
                            </code>
                            <motion.button
                                onClick={copyToClipboard}
                                className={`relative overflow-hidden px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                                    copied
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-blue-500 hover:bg-blue-600"
                                }`}
                                animate={{ width: copied ? "auto" : "auto" }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 25,
                                }}
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.span
                                        key={copied ? "copied" : "label"}
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -10, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center justify-center gap-2 whitespace-nowrap"
                                    >
                                        {copied ? (
                                            <>
                                                <Check size={16} />
                                                Skopiowano
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={16} />
                                                Kopiuj
                                            </>
                                        )}
                                    </motion.span>
                                </AnimatePresence>
                                <AnimatePresence>
                                    {copied && (
                                        <motion.span
                                            className="absolute inset-0 rounded-lg bg-white/10"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    )}
                                </AnimatePresence>
                            </motion.button>
                            <a
                                href={galleryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <Eye className="w-4 h-4" />
                                Zobacz
                            </a>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                            {collection.photo_count}
                        </div>
                        <div className="text-sm text-gray-600">Zdjęć</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                            {formatFileSize(totalSize)}
                        </div>
                        <div className="text-sm text-gray-600">Rozmiar</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                            {new Date(collection.created_at).toLocaleDateString(
                                "pl-PL"
                            )}
                        </div>
                        <div className="text-sm text-gray-600">Utworzona</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
