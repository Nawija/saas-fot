// components/dashboard/collections/CollectionGallerySection.tsx
import { ImageIcon } from "lucide-react";
import PhotosGrid from "@/components/dashboard/PhotosGrid";
import type { Photo } from "./types";
import EmptyState from "../EmptyState";
import Paginator from "@/components/ui/Paginator";

interface CollectionGallerySectionProps {
    photos: Photo[];
    onDeletePhoto: (photoId: number) => void;
    page?: number;
    total?: number;
    pageSize?: number;
    onPageChange?: (newPage: number) => void;
}

export default function CollectionGallerySection({
    photos,
    onDeletePhoto,
    page = 1,
    total = 0,
    pageSize = 20,
    onPageChange,
}: CollectionGallerySectionProps) {
    const totalPages = Math.max(
        1,
        Math.ceil((total || photos.length) / pageSize)
    );

    return (
        <div className="py-5">
            {photos.length > 0 ? (
                <>
                    <PhotosGrid photos={photos} onDeletePhoto={onDeletePhoto} />

                    {/* Pagination at the very bottom under photos */}
                    {typeof onPageChange === "function" && totalPages > 1 && (
                        <Paginator
                            page={page}
                            total={total || photos.length}
                            pageSize={pageSize}
                            onPageChange={onPageChange}
                        />
                    )}
                </>
            ) : (
                <EmptyState
                    icon={<ImageIcon className="w-10 h-10 text-gray-300" />}
                    title="No photos yet"
                    description="Your gallery is empty — upload photos to start sharing and showcasing your work."
                    className="py-6"
                />
            )}
        </div>
    );
}
