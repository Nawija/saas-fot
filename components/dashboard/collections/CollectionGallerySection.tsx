// components/dashboard/collections/CollectionGallerySection.tsx
import { Trash2 } from "lucide-react";
import MainButton from "@/components/buttons/MainButton";
import PhotosGrid from "@/components/dashboard/PhotosGrid";
import type { Photo } from "./types";

interface CollectionGallerySectionProps {
    photos: Photo[];
    onDeletePhoto: (photoId: number) => void;
    onDeleteAll: () => void;
}

export default function CollectionGallerySection({
    photos,
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
                            icon={<Trash2 size={15} />}
                            label="Delete all"
                            variant="danger"
                            className="text-xs md:text-sm"
                        />
                    )}
                </div>
            </div>
            <div className="p-5">
                {photos.length > 0 && (
                    <PhotosGrid photos={photos} onDeletePhoto={onDeletePhoto} />
                )}
            </div>
        </div>
    );
}
