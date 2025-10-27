"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Loading from "@/components/ui/Loading";
import { getGalleryHeroTemplate } from "@/components/gallery/hero/registry";
import {
    Heart,
    X,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Download,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>([]);
    const [photosToShow, setPhotosToShow] = useState(20);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [viewMode, setViewMode] = useState<"gallery" | "single">("gallery");
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxAnimating, setLightboxAnimating] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
    // Zoom & pan state (mobile friendly)
    const [zoomScale, setZoomScale] = useState(1);
    const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<{
        x: number;
        y: number;
        panX: number;
        panY: number;
    } | null>(null);
    const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(
        null
    );
    const containerRef = useRef<HTMLDivElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [isPinching, setIsPinching] = useState(false);
    const pinchStartDistanceRef = useRef(0);
    const pinchStartScaleRef = useRef(1);
    const pinchStartPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const pinchMidpointRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    // Helpers for premium smooth zooming/panning
    const clampPan = (scale: number, next: { x: number; y: number }) => {
        const cw = containerRef.current?.clientWidth || window.innerWidth;
        const ch = containerRef.current?.clientHeight || window.innerHeight;
        const iw = imageRef.current?.clientWidth || cw;
        const ih = imageRef.current?.clientHeight || ch;
        const maxX = ((scale - 1) * iw) / 2;
        const maxY = ((scale - 1) * ih) / 2;
        return {
            x: Math.max(-maxX, Math.min(maxX, next.x)),
            y: Math.max(-maxY, Math.min(maxY, next.y)),
        };
    };

    const zoomAt = (clientX: number, clientY: number, nextScale: number) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) {
            setZoomScale(nextScale);
            return;
        }
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const offsetX = clientX - centerX;
        const offsetY = clientY - centerY;
        setPan((prev) =>
            clampPan(nextScale, {
                x: prev.x - offsetX * (nextScale - zoomScale),
                y: prev.y - offsetY * (nextScale - zoomScale),
            })
        );
        setZoomScale(nextScale);
    };

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
                document.body.style.overflow = "hidden";
            }
        }
    }, [viewMode, displayedPhotos, searchParams]);

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
    }, [lightboxOpen, currentPhotoIndex, displayedPhotos.length]);

    const openLightbox = (index: number) => {
        // Save current scroll position
        setScrollPosition(window.scrollY);

        setCurrentPhotoIndex(index);
        setLightboxOpen(true);
        setLightboxAnimating(true);
        // Reset zoom on open
        setZoomScale(1);
        setPan({ x: 0, y: 0 });
        document.body.style.overflow = "hidden";

        // Update URL
        const photoId = displayedPhotos[index]?.id;
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
            // Reset zoom on close
            setZoomScale(1);
            setPan({ x: 0, y: 0 });
            document.body.style.overflow = "auto";

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
                        photoElement.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                        });
                    }
                }, 50);
            }, 50);
        }, 300);
    };
    const nextPhoto = () => {
        const newIndex = (currentPhotoIndex + 1) % displayedPhotos.length;
        setCurrentPhotoIndex(newIndex);
        // Reset zoom when changing photo
        setZoomScale(1);
        setPan({ x: 0, y: 0 });

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
        // Reset zoom when changing photo
        setZoomScale(1);
        setPan({ x: 0, y: 0 });

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
                <div className="bg-white flex items-center justify-between py-6 px-4 shadow-sm">
                    <p className="font-semibold text-lg">{collection.name}</p>
                    <div className="flex items-center justify-center gap-4">
                        {/* Download Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Download
                                    size={25}
                                    className="cursor-pointer"
                                />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem
                                    onClick={() => handleDownload(true)}
                                    className="flex items-center gap-3 py-3"
                                >
                                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm">
                                            Pobierz ulubione
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {
                                                photos.filter((p) => p.isLiked)
                                                    .length
                                            }{" "}
                                            zdjęć
                                        </span>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleDownload(false)}
                                    className="flex items-center gap-3 py-3"
                                >
                                    <Download className="w-5 h-5 text-gray-700" />
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm">
                                            Pobierz wszystko
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {photos.length} zdjęć
                                        </span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <LogOut
                            size={25}
                            className="text-red-600 cursor-pointer hover:text-red-700 transition-colors"
                        />
                    </div>
                </div>
                {/* Photos Grid - Masonry Layout */}
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
                                    lightboxOpen ? "hidden" : ""
                                }`}
                            >
                                {displayedPhotos.map((photo, index) => {
                                    // Calculate aspect ratio
                                    const aspectRatio =
                                        photo.width && photo.height
                                            ? photo.width / photo.height
                                            : 1;

                                    // Determine spans for better layout
                                    let colSpan = 1;
                                    let rowSpan = 1;

                                    // Very wide panoramas
                                    if (aspectRatio > 2.5) {
                                        colSpan = 3;
                                        rowSpan = 1;
                                    }
                                    // Wide photos
                                    else if (aspectRatio > 1.6) {
                                        colSpan = 2;
                                        rowSpan = 1;
                                    }
                                    // Very tall portraits
                                    else if (aspectRatio < 0.5) {
                                        colSpan = 1;
                                        rowSpan = 3;
                                    }
                                    // Tall photos
                                    else if (aspectRatio < 0.75) {
                                        colSpan = 1;
                                        rowSpan = 2;
                                    }
                                    // Square - occasionally make bigger
                                    else if (
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
                                            onClick={() => openLightbox(index)}
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
                                                    // Fallback if thumbnail fails
                                                    const img =
                                                        e.target as HTMLImageElement;
                                                    if (
                                                        img.src !==
                                                        photo.file_path
                                                    ) {
                                                        img.src =
                                                            photo.file_path;
                                                    }
                                                }}
                                            />

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-between p-4 md:p-6">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleLike(photo.id);
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
                                {photosToShow >= photos.length &&
                                    photos.length > 0 && (
                                        <p className="text-gray-400 text-sm">
                                            Wszystkie zdjęcia zostały załadowane
                                        </p>
                                    )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Custom Lightbox */}
            {lightboxOpen && displayedPhotos[currentPhotoIndex] && (
                <div
                    className={`fixed inset-0 bg-white flex items-center justify-center transition-opacity duration-300 ${
                        lightboxAnimating ? "opacity-0" : "opacity-100"
                    }`}
                    style={{ zIndex: 9999 }}
                >
                    {/* Close Button */}
                    <button
                        onClick={closeLightbox}
                        className={`fixed top-4 right-4 p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition-all duration-300  z-10 ${
                            lightboxAnimating
                                ? "opacity-0 scale-75"
                                : "opacity-100 scale-100"
                        }`}
                        aria-label="Zamknij"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>

                    {/* Navigation Arrows */}
                    {displayedPhotos.length > 1 && (
                        <>
                            <button
                                onClick={prevPhoto}
                                className={`fixed left-6 top-1/2 -translate-y-1/2 p-4 z-10 ${
                                    lightboxAnimating
                                        ? "opacity-0 -translate-x-4"
                                        : "opacity-100 translate-x-0"
                                }`}
                                aria-label="Poprzednie zdjęcie"
                            >
                                <ChevronLeft
                                    className="w-12 h-12 text-zinc-800"
                                    strokeWidth={1}
                                />
                            </button>
                            <button
                                onClick={nextPhoto}
                                className={`fixed right-6 top-1/2 -translate-y-1/2 p-4 z-10 ${
                                    lightboxAnimating
                                        ? "opacity-0 translate-x-4"
                                        : "opacity-100 translate-x-0"
                                }`}
                                aria-label="Następne zdjęcie"
                            >
                                <ChevronRight
                                    className="w-12 h-12 text-zinc-800"
                                    strokeWidth={1}
                                />
                            </button>
                        </>
                    )}

                    {/* Photo Counter */}
                    <div
                        className={`fixed top-4 left-4 px-4 py-2 rounded-lg bg-gray-200 text-gray-500 font-medium  z-10 transition-all duration-300 ${
                            lightboxAnimating
                                ? "opacity-0 -translate-y-4"
                                : "opacity-100 translate-y-0"
                        }`}
                    >
                        {currentPhotoIndex + 1} / {displayedPhotos.length}
                    </div>

                    {/* Main Image Container */}
                    <div
                        ref={containerRef}
                        className="w-full h-full flex items-center justify-center p-2 md:p-4 select-none"
                        style={{ touchAction: "none" }}
                        onDoubleClick={(e) => {
                            e.preventDefault();
                            const next = zoomScale > 1 ? 1 : 2.5;
                            zoomAt(e.clientX, e.clientY, next);
                        }}
                        onWheel={(e) => {
                            e.preventDefault();
                            const delta = -e.deltaY;
                            const factor = delta > 0 ? 1.1 : 0.9;
                            const next = Math.max(
                                1,
                                Math.min(4, zoomScale * factor)
                            );
                            zoomAt(e.clientX, e.clientY, next);
                        }}
                        onMouseDown={(e) => {
                            if (zoomScale === 1) return;
                            setIsDragging(true);
                            dragStartRef.current = {
                                x: e.clientX,
                                y: e.clientY,
                                panX: pan.x,
                                panY: pan.y,
                            };
                        }}
                        onMouseMove={(e) => {
                            if (!isDragging || !dragStartRef.current) return;
                            const dx = e.clientX - dragStartRef.current.x;
                            const dy = e.clientY - dragStartRef.current.y;
                            const next = {
                                x: dragStartRef.current.panX + dx,
                                y: dragStartRef.current.panY + dy,
                            };
                            setPan(clampPan(zoomScale, next));
                        }}
                        onMouseUp={() => {
                            setIsDragging(false);
                            dragStartRef.current = null;
                        }}
                        onMouseLeave={() => {
                            setIsDragging(false);
                            dragStartRef.current = null;
                        }}
                        onTouchStart={(e) => {
                            if (e.touches.length === 1) {
                                const t = e.touches[0];
                                // Double-tap detect
                                const now = Date.now();
                                if (
                                    lastTapRef.current &&
                                    now - lastTapRef.current.time < 300
                                ) {
                                    // Double tap
                                    if (zoomScale > 1) {
                                        setZoomScale(1);
                                        setPan({ x: 0, y: 0 });
                                    } else {
                                        setZoomScale(2.5);
                                    }
                                    lastTapRef.current = null;
                                } else {
                                    lastTapRef.current = {
                                        time: now,
                                        x: t.clientX,
                                        y: t.clientY,
                                    };
                                }

                                if (zoomScale > 1) {
                                    setIsDragging(true);
                                    dragStartRef.current = {
                                        x: t.clientX,
                                        y: t.clientY,
                                        panX: pan.x,
                                        panY: pan.y,
                                    };
                                }
                            }
                        }}
                        onTouchMove={(e) => {
                            // Pinch-zoom handling
                            if (e.touches.length === 2) {
                                setIsPinching(true);
                                const [t1, t2] = [e.touches[0], e.touches[1]];
                                const dx = t2.clientX - t1.clientX;
                                const dy = t2.clientY - t1.clientY;
                                const dist = Math.hypot(dx, dy);
                                if (pinchStartDistanceRef.current === 0) {
                                    pinchStartDistanceRef.current = dist;
                                    pinchStartScaleRef.current = zoomScale;
                                    pinchStartPanRef.current = { ...pan };
                                    const midX = (t1.clientX + t2.clientX) / 2;
                                    const midY = (t1.clientY + t2.clientY) / 2;
                                    pinchMidpointRef.current = {
                                        x: midX,
                                        y: midY,
                                    };
                                    return;
                                }

                                const ratio =
                                    dist / pinchStartDistanceRef.current;
                                const nextScale = Math.max(
                                    1,
                                    Math.min(
                                        4,
                                        pinchStartScaleRef.current * ratio
                                    )
                                );
                                // Zoom around midpoint
                                const rect =
                                    containerRef.current?.getBoundingClientRect();
                                if (rect) {
                                    const centerX = rect.left + rect.width / 2;
                                    const centerY = rect.top + rect.height / 2;
                                    const offsetX =
                                        pinchMidpointRef.current.x - centerX;
                                    const offsetY =
                                        pinchMidpointRef.current.y - centerY;
                                    const baseScale =
                                        pinchStartScaleRef.current;
                                    const nextPan = clampPan(nextScale, {
                                        x:
                                            pinchStartPanRef.current.x -
                                            offsetX * (nextScale - baseScale),
                                        y:
                                            pinchStartPanRef.current.y -
                                            offsetY * (nextScale - baseScale),
                                    });
                                    setZoomScale(nextScale);
                                    setPan(nextPan);
                                }
                                return;
                            }

                            if (!isDragging || !dragStartRef.current) return;
                            if (e.touches.length !== 1) return;
                            const t = e.touches[0];
                            const dx = t.clientX - dragStartRef.current.x;
                            const dy = t.clientY - dragStartRef.current.y;
                            const next = {
                                x: dragStartRef.current.panX + dx,
                                y: dragStartRef.current.panY + dy,
                            };
                            setPan(clampPan(zoomScale, next));
                        }}
                        onTouchEnd={(e) => {
                            if (e.touches.length < 2) {
                                // End pinch
                                setIsPinching(false);
                                pinchStartDistanceRef.current = 0;
                            }
                            if (e.touches.length === 0) {
                                setIsDragging(false);
                                dragStartRef.current = null;
                            }
                        }}
                    >
                        <img
                            ref={imageRef}
                            src={displayedPhotos[currentPhotoIndex].file_path}
                            alt={`Zdjęcie ${currentPhotoIndex + 1}`}
                            draggable="false"
                            className={`max-w-full max-h-full object-contain will-change-transform ${
                                lightboxAnimating
                                    ? "opacity-0 scale-95"
                                    : "opacity-100"
                            }`}
                            style={{
                                maxHeight: "95vh",
                                maxWidth: "95vw",
                                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoomScale})`,
                                transition:
                                    isDragging || isPinching
                                        ? "none"
                                        : "transform 200ms ease",
                                cursor:
                                    zoomScale > 1
                                        ? isDragging
                                            ? "grabbing"
                                            : "grab"
                                        : "zoom-in",
                            }}
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
                                handleLike(
                                    displayedPhotos[currentPhotoIndex].id
                                )
                            }
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors  ${
                                displayedPhotos[currentPhotoIndex].isLiked
                                    ? "bg-red-500 text-white hover:bg-red-600"
                                    : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                            }`}
                        >
                            <Heart
                                className={`w-5 h-5 ${
                                    displayedPhotos[currentPhotoIndex].isLiked
                                        ? "fill-current"
                                        : ""
                                }`}
                            />
                            {displayedPhotos[currentPhotoIndex].likes}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
