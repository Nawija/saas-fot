"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Image as ImageIcon, Eye, Lock } from "lucide-react";

interface Collection {
    id: number;
    name: string;
    slug: string;
    description?: string;
    hero_image?: string;
    is_public: boolean;
    has_password: boolean;
    photo_count: number;
    created_at: string;
}

interface UserInfo {
    username: string;
    name?: string;
    avatar?: string;
}

export default function UserGalleriesPage() {
    const params = useParams<{ username: string }>();
    const username = params.username;
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!username) return;

        const loadUserGalleries = async () => {
            try {
                const res = await fetch(`/api/user/${username}/galleries`);
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || "User not found");
                    setLoading(false);
                    return;
                }

                setUserInfo(data.user);
                setCollections(data.collections || []);
            } catch (err) {
                console.error("Error loading galleries:", err);
                setError("Failed to load galleries");
            } finally {
                setLoading(false);
            }
        };

        loadUserGalleries();
    }, [username]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-white to-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !userInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-white to-gray-50">
                <div className="text-center max-w-md px-6">
                    <h1 className="text-6xl font-light text-gray-300 mb-4">
                        404
                    </h1>
                    <p className="text-xl text-gray-900 font-medium mb-2">
                        Portfolio not found
                    </p>
                    <p className="text-gray-500 text-sm">
                        @{username} doesn't exist
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Header */}
            <div className="border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 mb-6">
                            {userInfo.avatar && (
                                <img
                                    src={userInfo.avatar}
                                    alt={userInfo.name || username}
                                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
                                />
                            )}
                            <div>
                                <h1 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight mb-2">
                                    {userInfo.name || username}
                                </h1>
                                <p className="text-gray-400 text-sm font-mono">
                                    {username}.seovileo.pl
                                </p>
                            </div>
                        </div>
                        <p className="text-xl text-gray-600 font-light leading-relaxed">
                            Photo galleries & portfolio
                        </p>
                    </div>
                </div>
            </div>

            {/* Galleries Grid */}
            <div className="bg-gray-50/30">
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
                    {collections.length === 0 ? (
                        <div className="text-center py-32">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-2xl mb-6">
                                <ImageIcon className="w-8 h-8 text-gray-300" />
                            </div>
                            <h2 className="text-2xl font-light text-gray-900 mb-3">
                                No galleries yet
                            </h2>
                            <p className="text-gray-400 text-sm">
                                Check back soon for new content
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-12">
                                <h2 className="text-3xl font-light text-gray-900 mb-2">
                                    Galleries
                                </h2>
                                <div className="w-12 h-0.5 bg-gray-900"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                                {collections.map((collection) => (
                                    <Link
                                        key={collection.id}
                                        href={`https://${username}.seovileo.pl/g/${collection.slug}`}
                                        className="group block"
                                    >
                                        <div className="bg-white overflow-hidden transition-all duration-500">
                                            {/* Hero Image */}
                                            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden mb-5">
                                                {collection.hero_image ? (
                                                    <img
                                                        src={
                                                            collection.hero_image
                                                        }
                                                        alt={collection.name}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <ImageIcon className="w-12 h-12 text-gray-200" />
                                                    </div>
                                                )}

                                                {/* Minimal Badge */}
                                                {collection.has_password && (
                                                    <div className="absolute top-4 right-4">
                                                        <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                                                            <Lock className="w-3 h-3 text-gray-600" />
                                                            <span className="text-xs font-medium text-gray-600">
                                                                Private
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                                            </div>

                                            {/* Content */}
                                            <div className="space-y-3">
                                                <h3 className="text-xl font-light text-gray-900 line-clamp-1 group-hover:text-gray-600 transition-colors">
                                                    {collection.name}
                                                </h3>

                                                {collection.description && (
                                                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                                        {collection.description}
                                                    </p>
                                                )}

                                                <div className="flex items-center text-xs text-gray-400 font-medium pt-2 border-t border-gray-100">
                                                    <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
                                                    <span>
                                                        {collection.photo_count ||
                                                            0}{" "}
                                                        {collection.photo_count ===
                                                        1
                                                            ? "photo"
                                                            : "photos"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
