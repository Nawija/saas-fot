"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Loading from "@/components/ui/Loading";
import { getGalleryHeroTemplate } from "@/components/gallery/hero/registry";
import DownloadMenu from "@/components/gallery/DownloadMenu";
import GalleryHeader from "@/components/gallery/GalleryHeader";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import type { Photo, Collection } from "@/types/gallery";
import Lightbox from "@/components/gallery/Lightbox";

export default function GalleryPhotosPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [collection, setCollection] = useState<Collection | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>([]);
    const [photosToShow, setPhotosToShow] = useState(20);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [viewMode, setViewMode] = useState<"gallery" | "single">("gallery");
    const [lightboxOpen, setLightboxOpen] = useState(false);
    // Lightbox animation is handled inside the Lightbox component
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchGallery();
    }, []);

    // Update displayed photos when photos or photosToShow changes
    useEffect(() => {
        setDisplayedPhotos(photos.slice(0, photosToShow));
    }, [photos, photosToShow]);

    // Infinite scroll - Intersection Observer
    useEffect(() => {
        if (!loadMoreTriggerRef.current || lightboxOpen) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (
                    target.isIntersecting &&
                    !loadingMore &&
                    photosToShow < photos.length
                ) {
                    setLoadingMore(true);
                    // Simulate loading delay
                    setTimeout(() => {
                        setPhotosToShow((prev) =>
                            Math.min(prev + 20, photos.length)
                        );
                        setLoadingMore(false);
                    }, 500);
                }
            },
            {
                root: null,
                rootMargin: "200px",
                threshold: 0.1,
            }
        );

        observer.observe(loadMoreTriggerRef.current);

        return () => {
            if (loadMoreTriggerRef.current) {
                observer.unobserve(loadMoreTriggerRef.current);
            }
        };
    }, [loadingMore, photosToShow, photos.length, lightboxOpen]);

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
        if (viewMode === "single" && displayedPhotos.length > 0) {
            const photoParam = searchParams.get("photo");
            const photoIndex = displayedPhotos.findIndex(
                (p) => p.id === parseInt(photoParam || "")
            );
            if (photoIndex !== -1) {
                setCurrentPhotoIndex(photoIndex);
                setLightboxOpen(true);
            }
        }
    }, [viewMode, displayedPhotos, searchParams]);

    const openLightbox = (index: number) => {
        // Save current scroll position
        setScrollPosition(window.scrollY);

        setCurrentPhotoIndex(index);
        setLightboxOpen(true);

        // Update URL
        const photoId = displayedPhotos[index]?.id;
        if (photoId) {
            const url = new URL(window.location.href);
            url.searchParams.set("photo", photoId.toString());
            window.history.replaceState({}, "", url.toString());
        }
    };

    const closeLightbox = () => {
        setLightboxOpen(false);

        // Clear URL
        const url = new URL(window.location.href);
        url.searchParams.delete("photo");
        window.history.replaceState({}, "", url.toString());

        // Restore scroll position
        setTimeout(() => {
            window.scrollTo({
                top: scrollPosition,
                behavior: "instant",
            });

            // Then scroll to the photo smoothly
            setTimeout(() => {
                const photoElement = document.querySelector(
                    `#g > div:nth-child(${currentPhotoIndex + 1})`
                );
                if (photoElement) {
                    (photoElement as HTMLElement).scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }
            }, 50);
        }, 50);
    };
    const nextPhoto = () => {
        const newIndex = (currentPhotoIndex + 1) % displayedPhotos.length;
        setCurrentPhotoIndex(newIndex);

        // Auto-load more photos if approaching the end (within last 3 photos)
        if (
            newIndex >= displayedPhotos.length - 3 &&
            photosToShow < photos.length &&
            !loadingMore
        ) {
            setLoadingMore(true);
            setTimeout(() => {
                setPhotosToShow((prev) => Math.min(prev + 20, photos.length));
                setLoadingMore(false);
            }, 300);
        }

        // Update URL
        const photoId = displayedPhotos[newIndex]?.id;
        if (photoId) {
            const url = new URL(window.location.href);
            url.searchParams.set("photo", photoId.toString());
            window.history.replaceState({}, "", url.toString());
        }
    };

    const prevPhoto = () => {
        const newIndex =
            (currentPhotoIndex - 1 + displayedPhotos.length) %
            displayedPhotos.length;
        setCurrentPhotoIndex(newIndex);

        // Update URL
        const photoId = displayedPhotos[newIndex]?.id;
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

    const handleDownload = async (onlyFavorites: boolean) => {
        const photosToDownload = onlyFavorites
            ? photos.filter((p) => p.isLiked)
            : photos;

        if (photosToDownload.length === 0) {
            alert(
                onlyFavorites
                    ? "Brak ulubionych zdjęć do pobrania!"
                    : "Brak zdjęć do pobrania!"
            );
            return;
        }

        try {
            // Show loading message
            const loadingMsg = `Przygotowywanie ${photosToDownload.length} zdjęć do pobrania...`;
            console.log(loadingMsg);

            // Call API to create ZIP
            const response = await fetch(
                `/api/gallery/${params.slug}/download`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        photoIds: photosToDownload.map((p) => p.id),
                        onlyFavorites,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Błąd pobierania");
            }

            // Get ZIP file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = onlyFavorites
                ? `${collection?.name || "galeria"}-ulubione.zip`
                : `${collection?.name || "galeria"}-wszystkie.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            alert(`✅ Pobrano ${photosToDownload.length} zdjęć jako plik ZIP!`);
        } catch (error) {
            console.error("Download error:", error);
            alert("❌ Błąd podczas pobierania zdjęć. Spróbuj ponownie.");
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
                <GalleryHeader
                    title={collection.name}
                    likedCount={photos.filter((p) => p.isLiked).length}
                    totalCount={photos.length}
                    onDownload={handleDownload}
                />
                {/* Photos Grid - Masonry Layout */}
                <GalleryGrid
                    photos={displayedPhotos}
                    hidden={lightboxOpen}
                    onPhotoClick={(index) => openLightbox(index)}
                    onLike={(id) => handleLike(id)}
                    loadMoreTriggerRef={loadMoreTriggerRef}
                    loadingMore={loadingMore}
                    photosToShow={photosToShow}
                    totalPhotos={photos.length}
                />
            </div>

            {/* Custom Lightbox (extracted component) */}
            <Lightbox
                photos={displayedPhotos}
                index={currentPhotoIndex}
                open={lightboxOpen}
                onClose={closeLightbox}
                onPrev={prevPhoto}
                onNext={nextPhoto}
                onLike={(id) => handleLike(id)}
            />
        </>
    );
}
