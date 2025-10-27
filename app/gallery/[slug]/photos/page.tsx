"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Loading from "@/components/ui/Loading";
import { getGalleryHeroTemplate } from "@/components/gallery/hero/registry";
import { Heart, X, ChevronLeft, ChevronRight } from "lucide-react";

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
    const searchParams = useSearchParams();
    const [collection, setCollection] = useState<Collection | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"gallery" | "single">("gallery");
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxAnimating, setLightboxAnimating] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {
        fetchGallery();
    }, []);

    // Detect view mode based on URL
    useEffect(() => {
        const photoParam = searchParams.get("photo");
        if (photoParam && photos.length > 0) {
            const photoExists = photos.some(
                (p) => p.id === parseInt(photoParam)
            );
            if (photoExists) {
                setViewMode("single");
            } else {
                setViewMode("gallery");
            }
        } else {
            setViewMode("gallery");
        }
    }, [searchParams, photos]);

    // Open lightbox automatically when accessing via direct link
    useEffect(() => {
        if (viewMode === "single" && photos.length > 0) {
            const photoParam = searchParams.get("photo");
            const photoIndex = photos.findIndex(
                (p) => p.id === parseInt(photoParam || "")
            );
            if (photoIndex !== -1) {
                setCurrentPhotoIndex(photoIndex);
                setLightboxOpen(true);
                document.body.style.overflow = "hidden";
            }
        }
    }, [viewMode, photos, searchParams]);

    // Keyboard navigation for lightbox
    useEffect(() => {
        if (!lightboxOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowLeft") prevPhoto();
            if (e.key === "ArrowRight") nextPhoto();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lightboxOpen, currentPhotoIndex, photos.length]);

    const openLightbox = (index: number) => {
        setCurrentPhotoIndex(index);
        setLightboxOpen(true);
        setLightboxAnimating(true);
        document.body.style.overflow = "hidden";

        // Update URL
        const photoId = photos[index]?.id;
        if (photoId) {
            const url = new URL(window.location.href);
            url.searchParams.set("photo", photoId.toString());
            window.history.replaceState({}, "", url.toString());
        }

        // Trigger animation
        setTimeout(() => {
            setLightboxAnimating(false);
        }, 50);
    };

    const closeLightbox = () => {
        setLightboxAnimating(true);

        // Wait for animation to complete
        setTimeout(() => {
            setLightboxOpen(false);
            setLightboxAnimating(false);
            document.body.style.overflow = "auto";

            // Clear URL
            const url = new URL(window.location.href);
            url.searchParams.delete("photo");
            window.history.replaceState({}, "", url.toString());

            // Scroll to photo
            setTimeout(() => {
                const photoElement = document.querySelector(
                    `#g > div:nth-child(${currentPhotoIndex + 1})`
                );
                if (photoElement) {
                    photoElement.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }
            }, 100);
        }, 300);
    };

    const nextPhoto = () => {
        const newIndex = (currentPhotoIndex + 1) % photos.length;
        setCurrentPhotoIndex(newIndex);

        // Update URL
        const photoId = photos[newIndex]?.id;
        if (photoId) {
            const url = new URL(window.location.href);
            url.searchParams.set("photo", photoId.toString());
            window.history.replaceState({}, "", url.toString());
        }
    };

    const prevPhoto = () => {
        const newIndex =
            (currentPhotoIndex - 1 + photos.length) % photos.length;
        setCurrentPhotoIndex(newIndex);

        // Update URL
        const photoId = photos[newIndex]?.id;
        if (photoId) {
            const url = new URL(window.location.href);
            url.searchParams.set("photo", photoId.toString());
            window.history.replaceState({}, "", url.toString());
        }
    };

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
                const data = await res.json();

                setPhotos(
                    photos.map((p) =>
                        p.id === photoId
                            ? {
                                  ...p,
                                  likes: p.likes + (data.liked ? 1 : -1),
                                  isLiked: data.liked,
                              }
                            : p
                    )
                );
            }
        } catch (error) {
            console.error("Error liking photo:", error);
        }
    };

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
    const HeroTemplate = getGalleryHeroTemplate(template);

    const ScrollIndicator = () => (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
                <div className="w-1.5 h-3 bg-white rounded-full"></div>
            </div>
        </div>
    );

    const Hero = () => (
        <>
            {HeroTemplate({
                data: {
                    name: collection.name,
                    description: collection.description,
                    image: collection.hero_image,
                },
                elements: {
                    ScrollIndicator,
                },
            })}
        </>
    );

    // Gallery grid view
    return (
        <>
            <div className="min-h-screen bg-gray-50">
                {/* Hide Hero when PhotoSwipe is open */}
                <div className={lightboxOpen ? "hidden" : ""}>
                    <Hero />
                </div>

                {/* Photos Grid - Masonry Layout */}
                <div className="px-2 py-12">
                    {photos.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <p>Brak zdjęć w tej galerii</p>
                        </div>
                    ) : (
                        <>
                            <div id="s" className="h-0 w-0 scroll-m-2" />
                            <div
                                id="g"
                                className={`columns-1 md:columns-2 lg:columns-3 gap-2 space-y-2 scroll-m-2 ${
                                    lightboxOpen ? "hidden" : ""
                                }`}
                            >
                                {photos.map((photo, index) => (
                                    <div
                                        key={photo.id}
                                        onClick={() => openLightbox(index)}
                                        className="break-inside-avoid group relative block overflow-hidden bg-white transition-all duration-300 cursor-pointer"
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
                                                    e.preventDefault();
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
                        </>
                    )}
                </div>
            </div>

            {/* Custom Lightbox */}
            {lightboxOpen && photos[currentPhotoIndex] && (
                <div
                    className={`fixed inset-0 bg-white flex items-center justify-center transition-opacity duration-300 ${
                        lightboxAnimating ? "opacity-0" : "opacity-100"
                    }`}
                    style={{ zIndex: 9999 }}
                >
                    {/* Close Button */}
                    <button
                        onClick={closeLightbox}
                        className={`fixed top-4 right-4 p-3 rounded-full bg-gray-800 hover:bg-gray-900 transition-all duration-300 shadow-xl z-10 ${
                            lightboxAnimating
                                ? "opacity-0 scale-75"
                                : "opacity-100 scale-100"
                        }`}
                        aria-label="Zamknij"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>

                    {/* Navigation Arrows */}
                    {photos.length > 1 && (
                        <>
                            <button
                                onClick={prevPhoto}
                                className={`fixed left-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-gray-800 hover:bg-gray-900 transition-all duration-300 shadow-xl z-10 ${
                                    lightboxAnimating
                                        ? "opacity-0 -translate-x-4"
                                        : "opacity-100 translate-x-0"
                                }`}
                                aria-label="Poprzednie zdjęcie"
                            >
                                <ChevronLeft className="w-8 h-8 text-white" />
                            </button>
                            <button
                                onClick={nextPhoto}
                                className={`fixed right-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-gray-800 hover:bg-gray-900 transition-all duration-300 shadow-xl z-10 ${
                                    lightboxAnimating
                                        ? "opacity-0 translate-x-4"
                                        : "opacity-100 translate-x-0"
                                }`}
                                aria-label="Następne zdjęcie"
                            >
                                <ChevronRight className="w-8 h-8 text-white" />
                            </button>
                        </>
                    )}

                    {/* Photo Counter */}
                    <div
                        className={`fixed top-4 left-4 px-4 py-2 rounded-lg bg-gray-800 text-white font-medium shadow-xl z-10 transition-all duration-300 ${
                            lightboxAnimating
                                ? "opacity-0 -translate-y-4"
                                : "opacity-100 translate-y-0"
                        }`}
                    >
                        {currentPhotoIndex + 1} / {photos.length}
                    </div>

                    {/* Main Image Container */}
                    <div className="w-full h-full flex items-center justify-center p-4">
                        <img
                            src={photos[currentPhotoIndex].file_path}
                            alt={`Zdjęcie ${currentPhotoIndex + 1}`}
                            className={`max-w-full max-h-full object-contain transition-all duration-300 ${
                                lightboxAnimating
                                    ? "opacity-0 scale-95"
                                    : "opacity-100 scale-100"
                            }`}
                            style={{ maxHeight: "90vh", maxWidth: "90vw" }}
                        />
                    </div>

                    {/* Like Button */}
                    <div
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-10 transition-all duration-300 ${
                            lightboxAnimating
                                ? "opacity-0 translate-y-4"
                                : "opacity-100 translate-y-0"
                        }`}
                    >
                        <button
                            onClick={() =>
                                handleLike(photos[currentPhotoIndex].id)
                            }
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors shadow-xl ${
                                photos[currentPhotoIndex].isLiked
                                    ? "bg-red-500 text-white hover:bg-red-600"
                                    : "bg-gray-800 text-white hover:bg-gray-900"
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
            )}
        </>
    );
}
