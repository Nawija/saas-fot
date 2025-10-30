// components/dashboard/PhotosGrid.tsx
"use client";

import { Upload, Trash2, X } from "lucide-react";
import MainButton from "../buttons/MainButton";
import Image from "next/image";

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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {photos.map((photo) => (
                        <div
                            key={photo.id}
                            className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                        >
                            <Image
                                src={photo.file_path}
                                alt={photo.file_name}
                                height={200}
                                width={200}
                                className="w-full h-full object-cover"
                                decoding="async"
                            />
                            <div className="absolute inset-0 lg:bg-linear-to-t lg:from-white/60 lg:bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-start justify-end lg:opacity-0 group-hover:opacity-100">
                                <button
                                    onClick={() => onDeletePhoto(photo.id)}
                                    className="p-1 m-1 text-red-500 hover:text-red-600 rounded-full bg-white transition-colors"
                                >
                                    <X size={22} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
