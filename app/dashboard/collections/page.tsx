"use client";

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Loading from "@/components/ui/Loading";
import { useCollections } from "@/hooks/useCollections";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import CollectionCard from "@/components/dashboard/CollectionCard";

export default function CollectionsPage() {
    const { collections, loading, username, deleteCollection } =
        useCollections();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pending, setPending] = useState<{ id: number; name: string } | null>(
        null
    );

    const handleDeleteClick = (id: number, name: string) => {
        setPending({ id, name });
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (pending) {
            await deleteCollection(pending.id);
            setPending(null);
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <>
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
                {/* Page Header */}
                <PageHeader
                    title="Galleries"
                    description="Manage your photo collections and share them with clients"
                    actionLabel="New Gallery"
                    actionHref="/dashboard/collections/new"
                />

                {/* Collections Grid or Empty State */}
                {collections.length === 0 ? (
                    <EmptyState
                        title="No galleries yet"
                        description="Create your first gallery and start sharing beautiful photos with your clients"
                        actionLabel="Create your first gallery"
                        actionHref="/dashboard/collections/new"
                        className="py-20"
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                        {collections.map((collection) => (
                            <CollectionCard
                                key={collection.id}
                                collection={collection}
                                username={username}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title={
                    pending ? `Delete gallery "${pending.name}"?` : "Delete?"
                }
                description="This will delete: the gallery, all photos and files from Cloudflare R2. This action cannot be undone."
                confirmLabel="Delete gallery"
                cancelLabel="Cancel"
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}
