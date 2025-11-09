// components/dashboard/PhotosGrid.tsx
"use client";

import { X, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";
import { getThumbnailUrl } from "@/lib/utils/getThumbnailUrl";

interface Photo {
    id: number;
    file_path: string;
    file_name: string;
    file_size: number;
    width?: number;
    height?: number;
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
        <div className="group relative aspect-square rounded-sm overflow-hidden bg-gray-100">
            <a
                href={photo.file_path}
                data-pswp-width={photo.width || 1200}
                data-pswp-height={photo.height || 800}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 block"
            >
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
                    <img
                        src={getThumbnailUrl(photo.file_path)}
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
            </a>

            {/* Delete button overlay - OUTSIDE the link */}
            <div className="absolute inset-0 lg:bg-linear-to-t lg:from-black/30 lg:bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-start justify-end lg:opacity-0 group-hover:opacity-100 pointer-events-none">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="p-1 m-1 text-red-500 hover:text-red-600 rounded-md bg-white/50 transition-colors shadow-sm hover:shadow-md pointer-events-auto"
                    aria-label={`Delete ${photo.file_name}`}
                >
                    <X size={22} />
                </button>
            </div>
        </div>
    );
}

export default function PhotosGrid({ photos, onDeletePhoto }: PhotosGridProps) {
    const lightboxRef = useRef<PhotoSwipeLightbox | null>(null);

    useEffect(() => {
        if (!lightboxRef.current) {
            const lightbox = new PhotoSwipeLightbox({
                gallery: "#photos-gallery",
                children: "a",
                pswpModule: () => import("photoswipe"),
                bgOpacity: 0.95,
                spacing: 0.1,
                loop: true,
                preload: [1, 2],
                errorMsg:
                    '<div style="text-align:center;padding:20px;color:#fff;"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><p style="margin-top:16px;font-size:18px;">Failed to load image</p></div>',
            });

            lightbox.init();
            lightboxRef.current = lightbox;
        }

        return () => {
            if (lightboxRef.current) {
                lightboxRef.current.destroy();
                lightboxRef.current = null;
            }
        };
    }, []);

    return (
        <div
            id="photos-gallery"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2"
        >
            {photos.map((photo) => (
                <PhotoThumbnail
                    key={photo.id}
                    photo={photo}
                    onDelete={() => onDeletePhoto(photo.id)}
                />
            ))}
        </div>
    );
}
