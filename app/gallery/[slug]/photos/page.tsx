"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/components/ui/Loading";
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
    hero_template?: string;
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
        return <Loading />;
    }

    if (!collection) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
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

    const template = collection.hero_template || "minimal";

    const BaseBackButton = () => (
        <button
            onClick={() => router.push(`/gallery/${params.slug}`)}
            className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-lg transition-colors"
        >
            <ArrowLeft className="w-5 h-5" />
            Powrót
        </button>
    );

    const ScrollIndicator = () => (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
                <div className="w-1.5 h-3 bg-white rounded-full"></div>
            </div>
        </div>
    );

    const MinimalHero = () => (
        <div className="relative h-screen bg-gray-900 overflow-hidden">
            {collection.hero_image ? (
                <img
                    src={collection.hero_image}
                    alt={collection.name}
                    className="w-full h-full object-cover opacity-60"
                />
            ) : (
                <div className="w-full h-full bg-linear-to-br from-gray-900 to-gray-700" />
            )}
            <div className="absolute inset-0 bg-linear-to-b from-transparent to-zinc-900/80" />
            <BaseBackButton />
            <div className="absolute top-1/2 -translate-y-1/2 text-center left-1/2 -translate-x-1/2 p-8 text-white">
                <div className="container mx-auto max-w-7xl">
                    <h1 className="text-4xl md:text-6xl font-bold mb-3">
                        {collection.name}
                    </h1>
                    {collection.description && (
                        <p className="text-xl text-gray-200">
                            {collection.description}
                        </p>
                    )}
                </div>
            </div>
            <ScrollIndicator />
        </div>
    );

    const FullscreenHero = () => (
        <div className="relative h-screen w-full overflow-hidden">
            {collection.hero_image ? (
                <img
                    src={collection.hero_image}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-linear-to-br from-slate-800 to-slate-600" />
            )}
            <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/20 to-black/60" />
            <BaseBackButton />
            <div className="absolute inset-0 flex items-center justify-center text-white px-6">
                <div className="text-center">
                    <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-6">
                        {collection.name}
                    </h1>
                    {collection.description && (
                        <p className="text-2xl md:text-3xl text-gray-200 mb-10 max-w-4xl mx-auto">
                            {collection.description}
                        </p>
                    )}
                </div>
            </div>
            <ScrollIndicator />
        </div>
    );

    const SplitHero = () => (
        <div className="relative h-screen w-full grid grid-cols-1 md:grid-cols-2">
            <div className="relative order-2 md:order-1 flex items-center justify-center p-10 bg-white">
                <div className="max-w-lg">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                        {collection.name}
                    </h1>
                    {collection.description && (
                        <p className="text-lg md:text-xl text-gray-600">
                            {collection.description}
                        </p>
                    )}
                </div>
            </div>
            <div className="relative order-1 md:order-2">
                {collection.hero_image ? (
                    <img
                        src={collection.hero_image}
                        alt={collection.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-gray-700 to-gray-500" />
                )}
                <BaseBackButton />
            </div>
        </div>
    );

    const OverlayHero = () => (
        <div className="relative h-screen w-full overflow-hidden">
            <div className="absolute inset-0">
                {collection.hero_image ? (
                    <img
                        src={collection.hero_image}
                        alt={collection.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-gray-900 to-gray-700" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
            </div>
            <BaseBackButton />
            <div className="relative z-10 h-full flex flex-col items-center justify-end text-white px-6 pb-16">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow">
                        {collection.name}
                    </h1>
                    {collection.description && (
                        <p className="text-xl md:text-2xl text-gray-200 mb-8 drop-shadow">
                            {collection.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    const GradientHero = () => (
        <div className="relative h-screen w-full bg-linear-to-br from-gray-900 via-slate-800 to-gray-700 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                    {collection.hero_image ? (
                        <img
                            src={collection.hero_image}
                            alt={collection.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-linear-to-br from-slate-600 to-slate-400" />
                    )}
                </div>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(transparent,rgba(0,0,0,0.5))]" />
            <div className="relative z-10 h-full flex flex-col items-center justify-end text-white px-6 pb-16">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow">
                        {collection.name}
                    </h1>
                    {collection.description && (
                        <p className="text-lg md:text-2xl text-gray-200 mb-8 drop-shadow">
                            {collection.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    const Hero = () => {
        switch (template) {
            case "fullscreen":
                return <FullscreenHero />;
            case "split":
                return <SplitHero />;
            case "overlay":
                return <OverlayHero />;
            case "gradient":
                return <GradientHero />;
            case "cards":
                return <SplitHero />;
            case "minimal":
            default:
                return <MinimalHero />;
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                {/* Header with Hero (template-driven) */}
                <Hero />

                {/* Photos Grid - Masonry Layout */}
                <div className="px-2 py-12">
                    {photos.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <p>Brak zdjęć w tej galerii</p>
                        </div>
                    ) : (
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-2 space-y-2">
                            {photos.map((photo, index) => (
                                <div
                                    key={photo.id}
                                    className="break-inside-avoid group relative cursor-pointer overflow-hidden bg-white transition-all duration-300"
                                    onClick={() => openLightbox(index)}
                                >
                                    <img
                                        src={
                                            photo.thumbnail_path ||
                                            photo.file_path
                                        }
                                        alt={`Zdjęcie ${index + 1}`}
                                        className="w-full h-auto"
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
