"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Loading from "@/components/ui/Loading";
import {
    Plus,
    Image,
    ExternalLink,
    Settings,
    Trash2,
    Globe,
    Lock,
} from "lucide-react";

interface Collection {
    id: number;
    name: string;
    slug: string;
    description?: string;
    hero_image?: string;
    is_public: boolean;
    password_plain?: string;
    photo_count?: number;
    created_at: string;
}

export default function CollectionsPage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pending, setPending] = useState<{ id: number; name: string } | null>(
        null
    );

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            const res = await fetch("/api/collections");
            const data = await res.json();
            if (data.ok) {
                setCollections(data.collections);
            }
        } catch (error) {
            console.error("Error fetching collections:", error);
        } finally {
            setLoading(false);
        }
    };

    const performDelete = async (collectionId: number) => {
        try {
            const res = await fetch(`/api/collections/${collectionId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.ok) {
                toast.success(
                    `Usunięto galerię — zwolniono ${
                        Math.round((data.freedSpace / 1024 / 1024) * 10) / 10
                    } MB`,
                    { description: `Usunięto ${data.deletedFiles} plików` }
                );
                setCollections((prev) =>
                    prev.filter((c) => c.id !== collectionId)
                );
            } else {
                toast.error("Błąd usuwania", {
                    description: data.error || "Nie udało się usunąć",
                });
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Wystąpił błąd podczas usuwania");
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-12 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                            Moje galerie
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Zarządzaj swoimi kolekcjami zdjęć i udostępniaj je
                            klientom
                        </p>
                    </div>
                    <Link
                        href="/dashboard/collections/new"
                        className="mt-6 md:mt-0 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Plus className="w-5 h-5" />
                        Nowa galeria
                    </Link>
                </div>

                {/* Collections Grid */}
                {collections.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                            <Image className="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            Nie masz jeszcze żadnych galerii
                        </h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Utwórz swoją pierwszą galerię i zacznij dzielić się
                            pięknymi zdjęciami ze swoimi klientami
                        </p>
                        <Link
                            href="/dashboard/collections/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <Plus className="w-5 h-5" />
                            Utwórz pierwszą galerię
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {collections.map((collection) => (
                            <div
                                key={collection.id}
                                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 group"
                            >
                                {/* Hero Image */}
                                <Link
                                    href={`/dashboard/collections/${collection.id}`}
                                >
                                    <div className="relative h-48 bg-linear-to-br from-gray-200 to-gray-300 overflow-hidden">
                                        {collection.hero_image ? (
                                            <img
                                                src={collection.hero_image}
                                                alt={collection.name}
                                                className="w-full h-full object-cover transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Image className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                </Link>

                                {/* Content */}
                                <div className="p-6">
                                    <Link
                                        href={`/dashboard/collections/${collection.id}`}
                                    >
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-800 transition-colors">
                                            {collection.name}
                                        </h3>
                                    </Link>
                                    {collection.description && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {collection.description}
                                        </p>
                                    )}

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Image className="w-4 h-4" />
                                            <span>
                                                {collection.photo_count || 0}{" "}
                                                zdjęć
                                            </span>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                collection.is_public
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-orange-100 text-orange-700"
                                            }`}
                                        >
                                            {collection.is_public ? (
                                                <span className="flex items-center gap-1">
                                                    <Globe className="w-3 h-3" />{" "}
                                                    Publiczna
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <Lock className="w-3 h-3" />{" "}
                                                    Chroniona
                                                </span>
                                            )}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/gallery/${collection.slug}`}
                                            target="_blank"
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            <span>Zobacz</span>
                                        </Link>
                                        <Link
                                            href={`/dashboard/collections/${collection.id}`}
                                            className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                                            title="Zarządzaj"
                                        >
                                            <Settings className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setPending({
                                                    id: collection.id,
                                                    name: collection.name,
                                                });
                                                setConfirmOpen(true);
                                            }}
                                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                                            title="Usuń galerię"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title={
                    pending ? `Usunąć galerię "${pending.name}"?` : "Usunąć?"
                }
                description={
                    "Usunięte zostaną: galeria, wszystkie zdjęcia i pliki z Cloudflare R2. Tej operacji nie można cofnąć."
                }
                confirmLabel="Usuń galerię"
                cancelLabel="Anuluj"
                onConfirm={async () => {
                    if (pending) {
                        await performDelete(pending.id);
                        setPending(null);
                    }
                }}
            />
        </div>
    );
}
