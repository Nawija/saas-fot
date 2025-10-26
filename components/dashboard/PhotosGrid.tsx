// components/dashboard/PhotosGrid.tsx
"use client";

import { Upload, Trash2 } from "lucide-react";

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
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
                Zdjęcia ({photos.length})
            </h2>

            {photos.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Upload className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Nie ma jeszcze żadnych zdjęć</p>
                    <p className="text-sm">
                        Użyj przycisku powyżej aby dodać pierwsze zdjęcia
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                        <div
                            key={photo.id}
                            className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                        >
                            <img
                                src={photo.file_path}
                                alt={photo.file_name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                decoding="async"
                            />
                            <div className="absolute inset-0 bg-black/40 bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <button
                                    onClick={() => onDeletePhoto(photo.id)}
                                    className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
