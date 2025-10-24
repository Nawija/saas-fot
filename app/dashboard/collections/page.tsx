"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Plus,
    Image,
    Users,
    ExternalLink,
    Settings,
    Trash2,
} from "lucide-react";

interface Collection {
    id: number;
    name: string;
    slug: string;
    description?: string;
    hero_image?: string;
    is_public: boolean;
    photo_count?: number;
    created_at: string;
}

export default function CollectionsPage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
            <div className="container mx-auto px-4 py-12 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
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
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
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
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
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
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            <span>
                                                {collection.is_public
                                                    ? "Publiczna"
                                                    : "Prywatna"}
                                            </span>
                                        </div>
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
                                            href={`/dashboard/collections/${collection.id}/edit`}
                                            className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                                        >
                                            <Settings className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
