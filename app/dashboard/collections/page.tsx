"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Loading from "@/components/ui/Loading";
import {
    Plus,
    Image as ImageIcon,
    ExternalLink,
    Settings,
    Trash2,
    Globe,
    Lock,
} from "lucide-react";
import MainButton from "@/components/buttons/MainButton";
import ResponsiveHeroImage from "@/components/gallery/hero/ResponsiveHeroImage";

interface Collection {
    id: number;
    name: string;
    slug: string;
    description?: string;
    hero_image?: string;
    hero_image_mobile?: string;
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
    const [username, setUsername] = useState<string>("");

    useEffect(() => {
        fetchCollections();
        fetchUsername();
    }, []);

    const fetchUsername = async () => {
        try {
            const res = await fetch("/api/user/me");
            const data = await res.json();
            if (data.ok && data.user?.username) {
                setUsername(data.user.username);
            }
        } catch (error) {
            console.error("Error fetching username:", error);
        }
    };

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
                    `Gallery deleted — freed ${
                        Math.round((data.freedSpace / 1024 / 1024) * 10) / 10
                    } MB`,
                    { description: `Deleted ${data.deletedFiles} files` }
                );
                setCollections((prev) =>
                    prev.filter((c) => c.id !== collectionId)
                );
            } else {
                toast.error("Delete error", {
                    description: data.error || "Failed to delete",
                });
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("An error occurred while deleting");
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-6 py-6 max-w-[1500px]">
                {/* Public Gallery Link */}
                {username && (
                    <div className="mb-8 bg-linear-to-br from-green-50/50 to-emerald-50/50 border-2 border-green-600/30 rounded-2xl p-4 transition-all duration-300">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between">
                            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center shadow">
                                    <Globe className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-green-800 text-base md:text-lg">
                                        Your Public Gallery
                                    </h3>
                                    <Link
                                        href={`https://${username}.seovileo.pl`}
                                        target="_blank"
                                        className="text-xs md:text-sm text-green-600 font-medium truncate hover:underline"
                                    >
                                        https://{username}.seovileo.pl
                                    </Link>
                                </div>
                            </div>
                            <MainButton
                                href={`https://${username}.seovileo.pl/`}
                                target="_blank"
                                icon={<ExternalLink className="w-4 h-4" />}
                                label="Visit Gallery"
                                variant="success"
                                className="w-full sm:w-auto whitespace-nowrap"
                            />
                        </div>
                    </div>
                )}
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-3">
                            My galleries
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Manage your photo collections and share them with
                            clients
                        </p>
                    </div>

                    <MainButton
                        href="/dashboard/collections/new"
                        className="mt-6 md:mt-0"
                        label="New gallery"
                        icon={<Plus className="w-5 h-5" />}
                    />
                </div>

                {/* Collections Grid */}
                {collections.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                            <ImageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold  mb-3">
                            You don't have any galleries yet
                        </h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Create your first gallery and start sharing
                            beautiful photos with your clients
                        </p>

                        <MainButton
                            href="/dashboard/collections/new"
                            className="mt-6 md:mt-0"
                            label="Create your first gallery"
                            icon={<Plus className="w-5 h-5" />}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {collections.map((collection) => (
                            <div
                                key={collection.id}
                                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 group"
                            >
                                {/* Hero Image */}
                                <Link
                                    href={`/dashboard/collections/${collection.id}`}
                                >
                                    <div className="relative h-48 bg-linear-to-br from-blue-50 to-blue-100 overflow-hidden">
                                        {collection.hero_image ? (
                                            <>
                                                <ResponsiveHeroImage
                                                    desktop={
                                                        collection.hero_image
                                                    }
                                                    mobile={
                                                        collection.hero_image_mobile
                                                    }
                                                    alt={collection.name}
                                                    className="w-full h-full object-cover transition-transform duration-300"
                                                    priority
                                                />

                                                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon className="w-16 h-16 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Content */}
                                <div className="p-6">
                                    <Link
                                        href={`/dashboard/collections/${collection.id}`}
                                    >
                                        <h3 className="text-xl font-bold mb-2">
                                            {collection.name}
                                        </h3>
                                    </Link>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                        <div className="flex items-center gap-1">
                                            <ImageIcon className="w-4 h-4" />
                                            <span>
                                                {collection.photo_count || 0}{" "}
                                                photos
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
                                                    Public
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <Lock className="w-3 h-3" />{" "}
                                                    Protected
                                                </span>
                                            )}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <MainButton
                                            href={
                                                username
                                                    ? `https://${username}.seovileo.pl/g/${collection.slug}`
                                                    : `/g/${collection.slug}`
                                            }
                                            target="_blank"
                                            icon={
                                                <ExternalLink className="w-4 h-4" />
                                            }
                                            label="View"
                                            variant="purple"
                                            className="text-sm w-full"
                                        />

                                        <MainButton
                                            variant="secondary"
                                            href={`/dashboard/collections/${collection.id}`}
                                            icon={
                                                <Settings className="w-5 h-5" />
                                            }
                                        />

                                        <MainButton
                                            variant="danger"
                                            onClick={() => {
                                                setPending({
                                                    id: collection.id,
                                                    name: collection.name,
                                                });
                                                setConfirmOpen(true);
                                            }}
                                            icon={
                                                <Trash2 className="w-5 h-5" />
                                            }
                                        />
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
                    pending ? `Delete gallery "${pending.name}"?` : "Delete?"
                }
                description={
                    "This will delete: the gallery, all photos and files from Cloudflare R2. This action cannot be undone."
                }
                confirmLabel="Delete gallery"
                cancelLabel="Cancel"
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
