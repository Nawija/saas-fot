"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/components/ui/Loading";
import GalleryHeader from "@/components/gallery/GalleryHeader";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import type { Photo, Collection } from "@/types/gallery";
import Lightbox from "@/components/gallery/Lightbox";
import GalleryHero from "@/components/gallery/GalleryHero";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useLightboxUrlSync } from "@/hooks/useLightboxUrlSync";
import {
    getPhotos as apiGetPhotos,
    toggleLike as apiToggleLike,
    downloadZip as apiDownloadZip,
} from "@/lib/services/galleryService";
import { triggerBlobDownload } from "@/lib/utils/download";

export default function GalleryPhotosPage() {
    const params = useParams();
    const router = useRouter();
    const [collection, setCollection] = useState<Collection | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>([]);
    const [photosToShow, setPhotosToShow] = useState(20);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    // Lightbox animation is handled inside the Lightbox component
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    // Infinite scroll trigger managed by hook

    useEffect(() => {
        fetchGallery();
    }, []);

    // Inject selected Google Font for this collection
    useEffect(() => {
        if (!collection?.hero_font) return;
        const FONT_MAP: Record<string, { href: string; family: string }> = {
            inter: {
                href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap",
                family: "'Inter', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif",
            },
            playfair: {
                href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap",
                family: "'Playfair Display', Georgia, Cambria, 'Times New Roman', Times, serif",
            },
            poppins: {
                href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap",
                family: "'Poppins', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif",
            },
        };
        const font = FONT_MAP[collection.hero_font as keyof typeof FONT_MAP];
        if (!font) return;
        const id = "gallery-font-link";
        let link = document.getElementById(id) as HTMLLinkElement | null;
        if (!link) {
            link = document.createElement("link");
            link.id = id;
            link.rel = "stylesheet";
            document.head.appendChild(link);
        }
        link.href = font.href;
        return () => {
            // Keep cached to avoid flicker on navigation
        };
    }, [collection?.hero_font]);

    // Update displayed photos when photos or photosToShow changes
    useEffect(() => {
        setDisplayedPhotos(photos.slice(0, photosToShow));
    }, [photos, photosToShow]);

    const loadMore = useCallback(() => {
        setLoadingMore(true);
        setTimeout(() => {
            setPhotosToShow((prev) => Math.min(prev + 20, photos.length));
            setLoadingMore(false);
        }, 500);
    }, [photos.length]);

    const { triggerRef: loadMoreTriggerRef } = useInfiniteScroll({
        enabled: !lightboxOpen,
        hasMore: photosToShow < photos.length,
        loadingMore,
        onLoadMore: loadMore,
    });

    // Sync lightbox with URL (?photo=ID)
    useLightboxUrlSync({
        photos: displayedPhotos,
        lightboxOpen,
        setLightboxOpen,
        currentIndex: currentPhotoIndex,
        setCurrentIndex: setCurrentPhotoIndex,
    });

    const openLightbox = (index: number) => {
        // Save current scroll position
        setScrollPosition(window.scrollY);

        setCurrentPhotoIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);

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
    };

    const prevPhoto = () => {
        const newIndex =
            (currentPhotoIndex - 1 + displayedPhotos.length) %
            displayedPhotos.length;
        setCurrentPhotoIndex(newIndex);
    };

    const fetchGallery = async () => {
        try {
            // Sprawdź czy mamy token dostępu (dla chronionych galerii)
            const token = sessionStorage.getItem(`gallery_${params.slug}`);
            const { ok, collection, photos, status } = await apiGetPhotos(
                String(params.slug),
                token ?? undefined
            );
            if (ok && collection && photos) {
                setCollection(collection);
                setPhotos(photos);
            } else if (status === 401) {
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
            const { ok, liked } = await apiToggleLike(photoId);
            if (ok && typeof liked === "boolean") {
                setPhotos(
                    photos.map((p) =>
                        p.id === photoId
                            ? {
                                  ...p,
                                  likes: p.likes + (liked ? 1 : -1),
                                  isLiked: liked,
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
            const blob = await apiDownloadZip(
                String(params.slug),
                photosToDownload.map((p) => p.id),
                onlyFavorites
            );
            const filename = onlyFavorites
                ? `${collection?.name || "galeria"}-ulubione.zip`
                : `${collection?.name || "galeria"}-wszystkie.zip`;
            triggerBlobDownload(filename, blob);

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

    const Hero = () => <GalleryHero collection={collection} />;

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
