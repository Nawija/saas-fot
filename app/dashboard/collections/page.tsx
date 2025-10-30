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
import Image from "next/image";

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
            <div className="container mx-auto px-4 py-12 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold  mb-3">
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
                                    <div className="relative h-48 bg-linear-to-br from-blue-50 to-blue-100 overflow-hidden">
                                        {collection.hero_image ? (
                                            <>
                                                <Image
                                                    src={collection.hero_image}
                                                    alt={collection.name}
                                                    height={350}
                                                    width={350}
                                                    className="w-full h-full object-cover transition-transform duration-300"
                                                />
                                                <div className="absolute inset-0 bg-linear-to-t from-white/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                                            href={`/gallery/${collection.slug}`}
                                            target="_blank"
                                            icon={
                                                <ExternalLink className="w-4 h-4" />
                                            }
                                            label="View"
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
