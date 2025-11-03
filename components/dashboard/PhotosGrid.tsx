// components/dashboard/PhotosGrid.tsx
"use client";

import { Upload, Trash2, X, AlertCircle } from "lucide-react";
import MainButton from "../buttons/MainButton";
import { useState } from "react";

interface Photo {
    id: number;
    file_path: string;
    file_name: string;
    file_size: number;
    created_at: string;
}

interface PhotosGridProps {
    photos: Photo[];
    onDeletePhoto: (photoId: number) => void;
}

function PhotoThumbnail({
    photo,
    onDelete,
}: {
    photo: Photo;
    onDelete: () => void;
}) {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    return (
        <div className="group relative aspect-square overflow-hidden bg-gray-100">
            {/* Loading skeleton */}
            {imageLoading && (
                <div className="absolute inset-0 bg-linear-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
            )}

            {/* Error state */}
            {imageError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                    <AlertCircle size={32} className="mb-2" />
                    <span className="text-xs text-center px-2">
                        Failed to load
                    </span>
                </div>
            ) : (
                // Native <img> to avoid Vercel image optimization costs
                // R2/CDN serves images directly = unlimited, zero Vercel bandwidth
                <img
                    src={photo.file_path}
                    alt={photo.file_name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                    style={{
                        opacity: imageLoading ? 0 : 1,
                    }}
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                        setImageError(true);
                        setImageLoading(false);
                    }}
                />
            )}

            {/* Delete button overlay */}
            <div className="absolute inset-0 lg:bg-linear-to-t lg:from-white/60 lg:bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-start justify-end lg:opacity-0 group-hover:opacity-100">
                <button
                    onClick={onDelete}
                    className="p-1 m-1 text-red-500 hover:text-red-600 rounded-full bg-white transition-colors shadow-sm hover:shadow-md"
                    aria-label={`Delete ${photo.file_name}`}
                >
                    <X size={22} />
                </button>
            </div>
        </div>
    );
}

export default function PhotosGrid({ photos, onDeletePhoto }: PhotosGridProps) {
    return (
        <div>
            {photos.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Upload className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>No photos yet</p>
                    <p className="text-sm">
                        Use the button above to add your first photos
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                    {photos.map((photo) => (
                        <PhotoThumbnail
                            key={photo.id}
                            photo={photo}
                            onDelete={() => onDeletePhoto(photo.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
