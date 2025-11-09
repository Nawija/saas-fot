// components/dashboard/collections/CollectionGallerySection.tsx
import { Trash2, ImageIcon } from "lucide-react";
import MainButton from "@/components/buttons/MainButton";
import PhotosGrid from "@/components/dashboard/PhotosGrid";
import type { Photo } from "./types";
import EmptyState from "../EmptyState";
import Paginator from "@/components/ui/Paginator";

interface CollectionGallerySectionProps {
    photos: Photo[];
    deletingAll?: boolean;
    onDeletePhoto: (photoId: number) => void;
    onDeleteAll: () => void;
    page?: number;
    total?: number;
    pageSize?: number;
    onPageChange?: (newPage: number) => void;
}

export default function CollectionGallerySection({
    photos,
    deletingAll = false,
    onDeletePhoto,
    onDeleteAll,
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
        <>
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900 ">
                    Gallery
                </h2>
                {/* Keep delete all visible in the header */}
                {(photos.length > 0 || total > 0) && (
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

            <div className="py-5">
                {photos.length > 0 ? (
                    <>
                        <PhotosGrid
                            photos={photos}
                            onDeletePhoto={onDeletePhoto}
                        />

                        {/* Pagination at the very bottom under photos */}
                        {typeof onPageChange === "function" &&
                            totalPages > 1 && (
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
        </>
    );
}
