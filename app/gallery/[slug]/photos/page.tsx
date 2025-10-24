"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Heart,
    Download,
    X,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
} from "lucide-react";

interface Photo {
    id: number;
    file_path: string;
    thumbnail_path?: string;
    width: number;
    height: number;
    likes: number;
    isLiked: boolean;
}

interface Collection {
    id: number;
    name: string;
    description?: string;
    hero_image?: string;
}

export default function GalleryPhotosPage() {
    const params = useParams();
    const router = useRouter();
    const [collection, setCollection] = useState<Collection | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            // Sprawdź czy mamy token dostępu (dla chronionych galerii)
            const token = sessionStorage.getItem(`gallery_${params.slug}`);

            const res = await fetch(`/api/gallery/${params.slug}/photos`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            const data = await res.json();

            if (data.ok) {
                setCollection(data.collection);
                setPhotos(data.photos);
            } else if (res.status === 401) {
                // Przekieruj z powrotem na landing jeśli brak dostępu
                router.push(`/gallery/${params.slug}`);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (photoId: number) => {
        try {
            const res = await fetch(`/api/gallery/photos/${photoId}/like`, {
                method: "POST",
            });

            if (res.ok) {
                setPhotos(
                    photos.map((p) =>
                        p.id === photoId
                            ? {
                                  ...p,
                                  likes: p.likes + (p.isLiked ? -1 : 1),
                                  isLiked: !p.isLiked,
                              }
                            : p
                    )
                );
            }
        } catch (error) {
            console.error("Error liking photo:", error);
        }
    };

    const openLightbox = (index: number) => {
        setCurrentPhotoIndex(index);
        setLightboxOpen(true);
        document.body.style.overflow = "hidden";
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = "auto";
    };

    const nextPhoto = () => {
        setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    };

    const prevPhoto = () => {
        setCurrentPhotoIndex(
            (prev) => (prev - 1 + photos.length) % photos.length
        );
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!lightboxOpen) return;
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") nextPhoto();
            if (e.key === "ArrowLeft") prevPhoto();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lightboxOpen, currentPhotoIndex]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700"></div>
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent absolute top-0 left-0"></div>
                </div>
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Brak dostępu</h1>
                    <button
                        onClick={() => router.push(`/gallery/${params.slug}`)}
                        className="text-blue-400 hover:text-blue-300"
                    >
                        Powrót do galerii
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                {/* Header with Hero */}
                <div className="relative h-96 bg-gray-900 overflow-hidden">
                    {collection.hero_image && (
                        <img
                            src={collection.hero_image}
                            alt={collection.name}
                            className="w-full h-full object-cover opacity-60"
                        />
                    )}
                    <div className="absolute inset-0 bg-linear-to-b from-transparent to-gray-900/80"></div>

                    {/* Back Button */}
                    <button
                        onClick={() => router.push(`/gallery/${params.slug}`)}
                        className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Powrót
                    </button>

                    {/* Title */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                        <div className="container mx-auto max-w-7xl">
                            <h1 className="text-4xl md:text-6xl font-bold mb-3">
                                {collection.name}
                            </h1>
                            {collection.description && (
                                <p className="text-xl text-gray-200">
                                    {collection.description}
                                </p>
                            )}
                            <p className="text-gray-300 mt-4">
                                {photos.length}{" "}
                                {photos.length === 1 ? "zdjęcie" : "zdjęć"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Photos Grid - Masonry Layout */}
                <div className="container mx-auto max-w-7xl px-4 py-12">
                    {photos.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <p>Brak zdjęć w tej galerii</p>
                        </div>
                    ) : (
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                            {photos.map((photo, index) => (
                                <div
                                    key={photo.id}
                                    className="break-inside-avoid group relative cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-xl transition-all duration-300"
                                    onClick={() => openLightbox(index)}
                                >
                                    <img
                                        src={
                                            photo.thumbnail_path ||
                                            photo.file_path
                                        }
                                        alt={`Zdjęcie ${index + 1}`}
                                        className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-end justify-between p-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLike(photo.id);
                                            }}
                                            className={`opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                                                photo.isLiked
                                                    ? "bg-red-500 text-white"
                                                    : "bg-white/90 text-gray-900"
                                            }`}
                                        >
                                            <Heart
                                                className={`w-5 h-5 ${
                                                    photo.isLiked
                                                        ? "fill-current"
                                                        : ""
                                                }`}
                                            />
                                            {photo.likes}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox */}
            {lightboxOpen && photos[currentPhotoIndex] && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
                    {/* Close Button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Navigation */}
                    {photos.length > 1 && (
                        <>
                            <button
                                onClick={prevPhoto}
                                className="absolute left-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>
                            <button
                                onClick={nextPhoto}
                                className="absolute right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>
                        </>
                    )}

                    {/* Image */}
                    <div className="max-w-7xl max-h-[90vh] px-20">
                        <img
                            src={photos[currentPhotoIndex].file_path}
                            alt={`Zdjęcie ${currentPhotoIndex + 1}`}
                            className="max-w-full max-h-[90vh] object-contain"
                        />
                    </div>

                    {/* Info Bar */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/80 to-transparent text-white">
                        <div className="max-w-7xl mx-auto flex items-center justify-between">
                            <span className="text-lg">
                                {currentPhotoIndex + 1} / {photos.length}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleLike(photos[currentPhotoIndex].id);
                                }}
                                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
                                    photos[currentPhotoIndex].isLiked
                                        ? "bg-red-500 hover:bg-red-600"
                                        : "bg-white/20 hover:bg-white/30"
                                }`}
                            >
                                <Heart
                                    className={`w-5 h-5 ${
                                        photos[currentPhotoIndex].isLiked
                                            ? "fill-current"
                                            : ""
                                    }`}
                                />
                                {photos[currentPhotoIndex].likes}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
