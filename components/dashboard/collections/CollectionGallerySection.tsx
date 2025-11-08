// components/dashboard/collections/CollectionGallerySection.tsx
import { Trash2, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import MainButton from "@/components/buttons/MainButton";
import PhotosGrid from "@/components/dashboard/PhotosGrid";
import type { Photo } from "./types";
import EmptyState from "../EmptyState";

interface CollectionGallerySectionProps {
    photos: Photo[];
    deletingAll?: boolean;
    onDeletePhoto: (photoId: number) => void;
    onDeleteAll: () => void;
}

export default function CollectionGallerySection({
    photos,
    deletingAll = false,
    onDeletePhoto,
    onDeleteAll,
}: CollectionGallerySectionProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-5 py-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-900">
                        Photo gallery ({photos.length})
                    </h2>
                    {photos.length > 0 && (
                        <MainButton
                            onClick={onDeleteAll}
                            loading={deletingAll}
                            disabled={deletingAll}
                            loadingText="Deleting..."
                            icon={<Trash2 size={15} />}
                            label={"Delete all"}
                            variant="danger"
                            className="text-xs md:text-sm"
                        />
                    )}
                </div>
            </div>
            <div className="p-5">
                {photos.length > 0 ? (
                    <PhotosGrid photos={photos} onDeletePhoto={onDeletePhoto} />
                ) : (
                    <EmptyState
                        icon={<ImageIcon className="w-10 h-10 text-gray-400" />}
                        title="No photos yet"
                        description="Your gallery is empty — upload photos to start sharing and showcasing your work."
                        className="py-6"
                    />
                )}
            </div>
        </div>
    );
}
