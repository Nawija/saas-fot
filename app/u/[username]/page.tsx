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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading galleries...</p>
                </div>
            </div>
        );
    }

    if (error || !userInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md px-6">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        404
                    </h1>
                    <p className="text-xl text-gray-600 mb-2">User not found</p>
                    <p className="text-gray-500">
                        The user <strong>{username}</strong> does not exist.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex items-center gap-4">
                        {userInfo.avatar && (
                            <img
                                src={userInfo.avatar}
                                alt={userInfo.name || username}
                                className="w-16 h-16 rounded-full"
                            />
                        )}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {userInfo.name || username}
                            </h1>
                            <p className="text-gray-600">
                                {username}.seovileo.pl
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Galleries Grid */}
            <div className="container mx-auto px-6 py-12">
                {collections.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-200 rounded-full mb-6">
                            <ImageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            No galleries yet
                        </h2>
                        <p className="text-gray-600">
                            This user hasn't created any public galleries.
                        </p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">
                            Photo Galleries
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {collections.map((collection) => (
                                <Link
                                    key={collection.id}
                                    href={`https://${username}.seovileo.pl/g/${collection.slug}`}
                                    className="group"
                                >
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                        {/* Hero Image */}
                                        <div className="relative h-48 bg-linear-to-br from-blue-50 to-blue-100 overflow-hidden">
                                            {collection.hero_image ? (
                                                <img
                                                    src={collection.hero_image}
                                                    alt={collection.name}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ImageIcon className="w-16 h-16 text-blue-300" />
                                                </div>
                                            )}

                                            {/* Badge */}
                                            <div className="absolute top-3 right-3">
                                                {collection.has_password ? (
                                                    <div className="bg-orange-500/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                                                        <Lock className="w-3 h-3 text-white" />
                                                        <span className="text-xs font-medium text-white">
                                                            Protected
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="bg-green-500/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                                                        <Eye className="w-3 h-3 text-white" />
                                                        <span className="text-xs font-medium text-white">
                                                            Public
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                                {collection.name}
                                            </h3>
                                            {collection.description && (
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {collection.description}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <ImageIcon className="w-4 h-4" />
                                                    <span>
                                                        {collection.photo_count ||
                                                            0}{" "}
                                                        photos
                                                    </span>
                                                </div>
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
    );
}
