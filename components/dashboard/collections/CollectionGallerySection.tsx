// components/dashboard/collections/CollectionGallerySection.tsx
import { Trash2, ImageIcon, ArrowBigLeft, ArrowBigRight } from "lucide-react";
import MainButton from "@/components/buttons/MainButton";
import PhotosGrid from "@/components/dashboard/PhotosGrid";
import type { Photo } from "./types";
import EmptyState from "../EmptyState";

interface CollectionGallerySectionProps {
    photos: Photo[];
    deletingAll?: boolean;
    onDeletePhoto: (photoId: number) => void;
    onDeleteAll: () => void;
    // pagination
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

    function prev() {
        if (page > 1 && onPageChange) onPageChange(page - 1);
    }

    function next() {
        if (page < totalPages && onPageChange) onPageChange(page + 1);
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-5 py-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-900"></h2>
                    {total > 0 && (
                        <div className="flex items-center gap-3">
                            <div className="text-sm text-gray-600">
                                Page {page} / {totalPages}
                            </div>
                            <button
                                onClick={prev}
                                disabled={page <= 1}
                                className="px-2 py-1 bg-gray-100 rounded disabled:opacity-50 text-sm"
                            >
                                <ArrowBigLeft size={15} />
                            </button>
                            <button
                                onClick={next}
                                disabled={page >= totalPages}
                                className="px-2 py-1 bg-gray-100 rounded disabled:opacity-50 text-sm"
                            >
                                <ArrowBigRight size={15} />
                            </button>
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
                    )}
                    {total === 0 && photos.length > 0 && (
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
                        icon={<ImageIcon className="w-10 h-10 text-gray-300" />}
                        title="No photos yet"
                        description="Your gallery is empty — upload photos to start sharing and showcasing your work."
                        className="py-6"
                    />
                )}
            </div>
        </div>
    );
}
