"use client";

import React from "react";
import type { Photo } from "@/types/gallery";
import { Heart } from "lucide-react";

export interface GalleryGridProps {
    photos: Photo[];
    hidden?: boolean;
    onPhotoClick: (index: number) => void;
    onLike: (photoId: number) => void;
    loadMoreTriggerRef: React.RefObject<HTMLDivElement | null>;
    loadingMore: boolean;
    photosToShow: number;
    totalPhotos: number;
}

export default function GalleryGrid({
    photos,
    hidden,
    onPhotoClick,
    onLike,
    loadMoreTriggerRef,
    loadingMore,
    photosToShow,
    totalPhotos,
}: GalleryGridProps) {
    return (
        <div className="px-2">
            {photos.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <p>Brak zdjęć w tej galerii</p>
                </div>
            ) : (
                <>
                    <div id="s" className="h-0 w-0 scroll-m-2" />
                    <div
                        id="g"
                        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 auto-rows-[250px] ${
                            hidden ? "hidden" : ""
                        }`}
                    >
                        {photos.map((photo, index) => {
                            const aspectRatio =
                                photo.width && photo.height
                                    ? photo.width / photo.height
                                    : 1;
                            let colSpan = 1;
                            let rowSpan = 1;

                            if (aspectRatio > 2.5) {
                                colSpan = 3;
                                rowSpan = 1;
                            } else if (aspectRatio > 1.6) {
                                colSpan = 2;
                                rowSpan = 1;
                            } else if (aspectRatio < 0.5) {
                                colSpan = 1;
                                rowSpan = 3;
                            } else if (aspectRatio < 0.75) {
                                colSpan = 1;
                                rowSpan = 2;
                            } else if (
                                aspectRatio >= 0.9 &&
                                aspectRatio <= 1.1
                            ) {
                                if (index % 6 === 0) {
                                    colSpan = 2;
                                    rowSpan = 2;
                                }
                            }

                            return (
                                <div
                                    key={photo.id}
                                    onClick={() => onPhotoClick(index)}
                                    className="group relative overflow-hidden bg-black cursor-pointer"
                                    style={{
                                        gridColumn: `span ${colSpan}`,
                                        gridRow: `span ${rowSpan}`,
                                    }}
                                >
                                    <img
                                        src={
                                            photo.thumbnail_path ||
                                            photo.file_path
                                        }
                                        alt={`Zdjęcie ${index + 1}`}
                                        draggable={false}
                                        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                                        loading="lazy"
                                        onError={(e) => {
                                            const img =
                                                e.target as HTMLImageElement;
                                            if (img.src !== photo.file_path) {
                                                img.src = photo.file_path;
                                            }
                                        }}
                                    />

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-between p-4 md:p-6">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onLike(photo.id);
                                            }}
                                            className={`transition-all duration-300 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold shadow-lg ${
                                                photo.isLiked
                                                    ? "bg-red-500 text-white scale-110"
                                                    : "bg-white/95 text-gray-700 hover:bg-white"
                                            }`}
                                        >
                                            <Heart
                                                className={`w-5 h-5 transition-all ${
                                                    photo.isLiked
                                                        ? "fill-current scale-110"
                                                        : ""
                                                }`}
                                            />
                                            <span className="font-bold">
                                                {photo.likes}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Infinite Scroll Trigger & Loading Indicator */}
                    <div
                        ref={loadMoreTriggerRef}
                        className="h-20 flex items-center justify-center mt-8"
                    >
                        {loadingMore && (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-4 border-zinc-300 border-t-zinc-900 rounded-full animate-spin"></div>
                                <p className="text-gray-500 text-sm font-medium">
                                    Ładowanie kolejnych zdjęć...
                                </p>
                            </div>
                        )}
                        {photosToShow >= totalPhotos && totalPhotos > 0 && (
                            <p className="text-gray-400 text-sm">
                                Wszystkie zdjęcia zostały załadowane
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
