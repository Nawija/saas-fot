"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import LoadingGallery from "@/components/ui/LoadingGallery";
import type { Photo, Collection } from "@/types/gallery";
import GalleryHero from "@/components/gallery/GalleryHero";
import { getPhotos as apiGetPhotos } from "@/lib/services/galleryService";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";
import MainButton from "@/components/buttons/MainButton";
import { ArrowLeft, AlertCircle } from "lucide-react";
import PhotoLikeButton from "@/components/gallery/PhotoLikeButton";
import { getThumbnailUrl } from "@/lib/utils/getThumbnailUrl";

const PHOTOS_PER_PAGE = 20;

// helpers
const createEmptyColumns = (n: number) =>
    Array.from({ length: n }, () => [] as Photo[]);

const distributePhotosIntoColumns = (photos: Photo[], n: number) => {
    const cols = createEmptyColumns(n);
    const heights = new Array(n).fill(0);
    photos.forEach((p) => {
        const aspect = (p.height || 1) / (p.width || 1);
        let minIdx = 0;
        for (let i = 1; i < n; i++)
            if (heights[i] < heights[minIdx]) minIdx = i;
        cols[minIdx].push(p);
        heights[minIdx] += aspect;
    });
    return cols;
};

const flattenLeftToRight = (cols: Photo[][]) => {
    const arr: Photo[] = [];
    const maxLen = Math.max(...cols.map((c) => c.length));
    for (let row = 0; row < maxLen; row++) {
        for (let col = 0; col < cols.length; col++) {
            const p = cols[col]?.[row];
            if (p) arr.push(p);
        }
    }
    return arr;
};

const getPhotoIndexFromQuery = (photos: Photo[], paramName = "photo") => {
    if (typeof window === "undefined") return null;
    try {
        const params = new URL(window.location.href).searchParams;
        const val = params.get(paramName);
        if (!val) return null;
        const id = parseInt(val, 10);
        if (Number.isNaN(id)) return null;
        const idx = photos.findIndex((p) => p.id === id);
        return idx !== -1 ? idx : null;
    } catch (e) {
        return null;
    }
};

export default function GalleryPhotosPage() {
    const params = useParams<{ slug: string }>();
    const { slug } = params;
    const router = useRouter();
    const searchParams = useSearchParams();
    const [collection, setCollection] = useState<Collection | null>(null);
    const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
    const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [columnsCount, setColumnsCount] = useState(3);
    const [singleMode, setSingleMode] = useState(false);
    const [singlePhoto, setSinglePhoto] = useState<Photo | null>(null);
    const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
    const [imageLoading, setImageLoading] = useState<Set<number>>(new Set());
    const [singleImageLoaded, setSingleImageLoaded] = useState(false);
    const [singleImageError, setSingleImageError] = useState(false);

    const galleryRef = useRef<HTMLDivElement>(null);
    const lightboxRef = useRef<PhotoSwipeLightbox | null>(null);
    const preloadedImages = useRef<Set<string>>(new Set());

    // monitoruj zmiany w URL (np. usunięcie ?photo) i resetuj singleMode
    useEffect(() => {
        const photoParam = searchParams.get("photo");
        if (!photoParam) {
            setSingleMode(false);
            setSinglePhoto(null);
        }
    }, [searchParams]);

    // responsive columns
    useEffect(() => {
        const updateCols = () => {
            const w = window.innerWidth;
            setColumnsCount(w < 640 ? 1 : w < 1024 ? 2 : w < 1280 ? 3 : 5);
        };
        updateCols();
        window.addEventListener("resize", updateCols);
        return () => window.removeEventListener("resize", updateCols);
    }, []);

    // fetch gallery
    useEffect(() => {
        if (!slug) return;

        let isMounted = true;

        const fetchGallery = async () => {
            try {
                setLoading(true);
                const token = sessionStorage.getItem(`gallery_${slug}`);
                const subdomain = searchParams.get("subdomain");
                const { ok, collection, photos, status } = await apiGetPhotos(
                    String(slug),
                    token ?? undefined,
                    subdomain ?? undefined
                );

                if (!isMounted) return;

                if (ok && collection && photos) {
                    // Validate photos array
                    const validPhotos = photos.filter(
                        (p) =>
                            p &&
                            p.id &&
                            p.file_path &&
                            typeof p.width === "number" &&
                            typeof p.height === "number" &&
                            p.width > 0 &&
                            p.height > 0
                    );

                    if (validPhotos.length === 0) {
                        setCollection(collection);
                        setAllPhotos([]);
                        setDisplayedPhotos([]);
                        setLoading(false);
                        return;
                    }

                    const sorted = [...validPhotos].sort((a, b) =>
                        a.file_path.localeCompare(b.file_path, undefined, {
                            numeric: true,
                        })
                    );
                    setCollection(collection);
                    setAllPhotos(sorted);
                    setDisplayedPhotos(sorted.slice(0, PHOTOS_PER_PAGE));
                    // Initialize loading state for first batch
                    const firstBatchIds = new Set(
                        sorted.slice(0, PHOTOS_PER_PAGE).map((p) => p.id)
                    );
                    setImageLoading(firstBatchIds);
                    // jeśli jest ?photo=ID -> przejdź w tryb pojedynczego zdjęcia
                    try {
                        const val = new URL(
                            window.location.href
                        ).searchParams.get("photo");
                        if (val) {
                            const target = sorted.find(
                                (p) => String(p.id) === String(val)
                            );
                            if (target) {
                                setSingleMode(true);
                                setSinglePhoto(target);
                                // Reset loading states for new photo
                                setSingleImageLoaded(false);
                                setSingleImageError(false);
                            }
                        }
                    } catch {
                        // Ignore URL parsing errors - non-critical
                    }
                } else if (status === 401) {
                    // Redirect to password page, preserving photo parameter if present
                    const photoParam = new URL(
                        window.location.href
                    ).searchParams.get("photo");
                    const subdomain = searchParams.get("subdomain");

                    let redirectUrl = `/g/${slug}`;
                    if (subdomain) {
                        redirectUrl += `?subdomain=${subdomain}`;
                        if (photoParam) redirectUrl += `&photo=${photoParam}`;
                    } else if (photoParam) {
                        redirectUrl += `?photo=${photoParam}`;
                    }

                    router.push(redirectUrl);
                } else {
                    setCollection(null);
                }
            } catch {
                setCollection(null);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        void fetchGallery();

        return () => {
            isMounted = false;
        };
    }, [slug, router]);

    // infinite scroll
    const handleScroll = useCallback(() => {
        if (isLoadingMore) return;

        // If we've already displayed all photos, don't trigger loading more
        if (displayedPhotos.length >= allPhotos.length) return;

        const { scrollTop, scrollHeight, clientHeight } =
            document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 300) {
            setIsLoadingMore(true);
            setTimeout(() => {
                setPage((prev) => prev + 1);
            }, 300);
        }
    }, [isLoadingMore, displayedPhotos.length, allPhotos.length]);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        if (page === 1) return;
        const start = (page - 1) * PHOTOS_PER_PAGE;
        const nextBatch = allPhotos.slice(start, start + PHOTOS_PER_PAGE);
        if (nextBatch.length > 0) {
            setDisplayedPhotos((prev) => [...prev, ...nextBatch]);
            // Add new photos to loading state
            setImageLoading((prev) => {
                const next = new Set(prev);
                nextBatch.forEach((p) => next.add(p.id));
                return next;
            });
        }
        setIsLoadingMore(false);
    }, [page, allPhotos]);

    // Monitor when exiting single mode
    useEffect(() => {
        if (!singleMode) {
            setSingleImageLoaded(false);
            setSingleImageError(false);
        }
    }, [singleMode]);

    // columns memoized
    const columns = useMemo(
        () => distributePhotosIntoColumns(displayedPhotos, columnsCount),
        [displayedPhotos, columnsCount]
    );

    // flat array for Lightbox
    const flatForHidden = useMemo(
        () =>
            flattenLeftToRight(
                distributePhotosIntoColumns(allPhotos, columnsCount)
            ),
        [allPhotos, columnsCount]
    );

    const openPhotoInLightbox = useCallback(
        (id: string | number) => {
            try {
                const idx = flatForHidden.findIndex(
                    (p) => String(p.id) === String(id)
                );
                if (idx === -1) {
                    return;
                }

                const orderContainer = document.getElementById("pswp-order");
                if (!orderContainer) {
                    return;
                }

                const link = orderContainer.querySelectorAll(
                    "a[data-photo-id]"
                )[idx] as HTMLAnchorElement | undefined;

                if (!link) {
                    return;
                }

                // zapamiętaj aktualną pozycję scrolla
                const prevScrollY = window.scrollY || window.pageYOffset || 0;

                // kliknij link (otworzy lightbox)
                link.click();

                // natychmiast przywróć pozycję scrolla, żeby przeglądarka nie zdążyła przewinąć do linku
                // używamy requestAnimationFrame + setTimeout dla odporności na różne przeglądarki/frames
                requestAnimationFrame(() => {
                    window.scrollTo(0, prevScrollY);
                    // dodatkowe zabezpieczenie po kilku ms
                    setTimeout(() => window.scrollTo(0, prevScrollY), 50);
                });

                // aktualizacja URL bez przewijania
                if (typeof window !== "undefined" && "history" in window) {
                    try {
                        const url = new URL(window.location.href);
                        url.searchParams.set("photo", String(id));
                        window.history.replaceState(null, "", url.toString());
                    } catch {
                        window.history.replaceState(
                            null,
                            "",
                            `${window.location.pathname}?photo=${id}`
                        );
                    }
                }
            } catch {
                // Silently fail - non-critical error
            }
        },
        [flatForHidden]
    );

    // init Lightbox
    useEffect(() => {
        // jeśli tryb pojedynczego zdjęcia — nie inicjujemy lightboxa (wyświetlamy tylko to zdjęcie)
        if (singleMode) {
            // Cleanup any existing lightbox when entering single mode
            if (lightboxRef.current) {
                lightboxRef.current.destroy();
                lightboxRef.current = null;
            }
            return;
        }

        const orderContainer = document.getElementById("pswp-order");
        if (!orderContainer) return;

        if (lightboxRef.current) {
            lightboxRef.current.destroy();
            lightboxRef.current = null;
        }

        const lightbox = new PhotoSwipeLightbox({
            gallery: "#pswp-order",
            children: "a",
            pswpModule: () => import("photoswipe"),
            bgOpacity: 0.95,
            spacing: 0.1,
            loop: true,
            preload: [1, 2], // Moderate preloading - 1 before, 2 after
            errorMsg:
                '<div style="text-align:center;padding:20px;color:#fff;"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><p style="margin-top:16px;font-size:18px;">Nie udało się załadować zdjęcia</p><p style="margin-top:8px;font-size:14px;opacity:0.7;">Przesuń dalej lub naciśnij strzałkę</p></div>',
        });

        // Smart preloading on slide change
        lightbox.on("change", () => {
            const pswp = (lightbox as any).pswp;
            if (pswp && typeof pswp.currIndex === "number") {
                const idx = pswp.currIndex;
                const photo = flatForHidden?.[idx];

                // Preload only next 2 images to avoid blocking
                const toPreload = [idx + 1, idx + 2];
                toPreload.forEach((i) => {
                    if (i >= 0 && i < flatForHidden.length) {
                        const p = flatForHidden[i];
                        if (
                            p?.file_path &&
                            !preloadedImages.current.has(p.file_path)
                        ) {
                            preloadedImages.current.add(p.file_path);
                            const img = new window.Image();
                            img.src = p.file_path;
                        }
                    }
                });

                // Update URL
                if (photo) {
                    try {
                        const url = new URL(window.location.href);
                        url.searchParams.set("photo", String(photo.id));
                        window.history.replaceState(null, "", url.toString());
                    } catch (e) {
                        window.history.replaceState(
                            null,
                            "",
                            `${window.location.pathname}?photo=${photo.id}`
                        );
                    }
                }
            }
        });

        lightbox.init();
        lightboxRef.current = lightbox;

        // jeśli ?photo=ID w URL -> otwórz odpowiednie zdjęcie od razu
        const idxFromQuery = getPhotoIndexFromQuery(flatForHidden, "photo");
        if (idxFromQuery !== null) {
            const link = orderContainer.querySelectorAll("a[data-photo-id]")[
                idxFromQuery
            ] as HTMLAnchorElement | undefined;
            if (link) setTimeout(() => link.click(), 50);
        }

        lightbox.on("close", () => {
            try {
                const pswp = (lightbox as any).pswp;
                let idx: number | null = null;
                if (pswp && typeof pswp.currIndex === "number") {
                    idx = pswp.currIndex;
                }

                let photoId: number | null = null;
                if (
                    idx !== null &&
                    typeof flatForHidden?.[idx] !== "undefined"
                ) {
                    photoId = flatForHidden[idx].id;
                } else {
                    // fallback: spróbuj odczytać z URL param "photo"
                    try {
                        const params = new URL(window.location.href)
                            .searchParams;
                        const val = params.get("photo");
                        if (val) {
                            const pid = parseInt(val, 10);
                            if (!Number.isNaN(pid)) photoId = pid;
                        }
                    } catch {
                        // ignore
                    }
                }

                // jeżeli mamy id zdjęcia -> przewiń do jego miniatury
                if (photoId !== null) {
                    // dajemy większy delay, żeby DOM zdążył ułożyć się po zamknięciu lightboxa i animacji
                    setTimeout(() => {
                        const el =
                            document.getElementById(`photo-id-${photoId}`) ||
                            (document.querySelector(
                                `[data-photo-id="${photoId}"]`
                            ) as HTMLElement | null);

                        if (el) {
                            // używamy smooth przewijania do centrum
                            el.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                            });
                        }
                    }, 500); // zwiększony delay z 120 na 500 ms
                }

                // usuń parametr z URL
                try {
                    const url = new URL(window.location.href);
                    url.searchParams.delete("photo");
                    window.history.replaceState(null, "", url.toString());
                } catch {
                    window.history.replaceState(
                        null,
                        "",
                        window.location.pathname
                    );
                }
            } catch {
                // ignore
            }
        });

        return () => {
            if (lightbox) {
                lightbox.destroy();
            }
            if (lightboxRef.current) {
                lightboxRef.current = null;
            }
        };
    }, [columnsCount, flatForHidden, singleMode]);

    if (loading) return <LoadingGallery />;

    if (!collection)
        return (
            <div
                className="flex items-center justify-center bg-white text-gray-900"
                style={{ minHeight: "100dvh" }}
            >
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Brak dostępu</h1>
                    <button
                        onClick={() => router.push(`/g/${slug}`)}
                        className="text-white/70 hover:text-white"
                    >
                        Powrót do galerii
                    </button>
                </div>
            </div>
        );

    // Single-photo mode view
    if (singleMode && singlePhoto) {
        return (
            <div
                className="bg-gray-50 flex flex-col items-center justify-center"
                style={{ height: "100dvh" }}
            >
                <div className="w-full bg-white border-b border-gray-200 p-2 flex items-center justify-start">
                    <MainButton
                        onClick={() => {
                            router.push(`/g/${slug}/p`);
                        }}
                        icon={<ArrowLeft size={16} />}
                        variant="secondary"
                        label="Back"
                    />
                </div>
                <div className="w-full flex-1 flex items-center justify-center relative">
                    {/* Loading skeleton */}
                    {!singleImageLoaded && !singleImageError && (
                        <LoadingGallery />
                    )}

                    {/* Error state */}
                    {singleImageError ? (
                        <div className="flex flex-col items-center justify-center text-gray-500">
                            <AlertCircle size={64} className="mb-4" />
                            <p className="text-lg font-medium">
                                Failed to load image
                            </p>
                            <button
                                onClick={() => {
                                    setSingleImageError(false);
                                    setSingleImageLoaded(false);
                                }}
                                className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <div className="w-full" key={singlePhoto.id}>
                            <img
                                src={singlePhoto.file_path}
                                alt={`Photo ${singlePhoto.id} from ${
                                    collection?.name || "gallery"
                                }`}
                                width={singlePhoto.width}
                                height={singlePhoto.height}
                                loading="eager"
                                decoding="async"
                                className="max-h-[85vh] object-contain mx-auto transition-opacity duration-300"
                                style={{
                                    opacity: singleImageLoaded ? 1 : 0,
                                    display: "block",
                                }}
                                onLoad={() => {
                                    setSingleImageLoaded(true);
                                }}
                                onError={() => {
                                    setSingleImageError(true);
                                    setSingleImageLoaded(false);
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <GalleryHero collection={collection} />
            <div
                className="bg-white pb-12 px-2"
                style={{ minHeight: "100dvh" }}
            >
                <div className="">
                    <h2 className="text-base md:text-lg p-3 font-medium text-gray-600">
                        {collection.name}
                    </h2>
                </div>

                <div
                    id="gallery"
                    ref={galleryRef}
                    className="flex gap-2 scroll-m-2"
                >
                    {allPhotos.length === 0 ? (
                        <div className="w-full text-center text-gray-500 py-12">
                            <div className="flex flex-col items-center">
                                <svg
                                    className="w-16 h-16 mb-4 opacity-30"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                <p className="text-lg font-medium">
                                    Brak zdjęć w galerii
                                </p>
                            </div>
                        </div>
                    ) : (
                        columns.map((col, colIndex) => (
                            <div key={colIndex} className="flex-1 space-y-1">
                                {col.map((photo) => {
                                    const isError = imageErrors.has(photo.id);
                                    const isLoading = imageLoading.has(
                                        photo.id
                                    );

                                    return (
                                        <a
                                            id={`photo-id-${photo.id}`}
                                            key={photo.id}
                                            href={photo.file_path}
                                            data-pswp-src={photo.file_path}
                                            data-pswp-width={photo.width}
                                            data-pswp-height={photo.height}
                                            data-photo-id={photo.id}
                                            className="mb-2 block w-full group cursor-pointer overflow-hidden bg-gray-200 relative"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (!isError) {
                                                    openPhotoInLightbox(
                                                        photo.id
                                                    );
                                                }
                                            }}
                                        >
                                            <div
                                                className="relative w-full"
                                                style={{
                                                    aspectRatio: `${photo.width} / ${photo.height}`,
                                                }}
                                            >
                                                {/* Loading image skeleton */}
                                                {isLoading && !isError && (
                                                    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                                                )}

                                                {/* Error state */}
                                                {isError ? (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white text-gray-600">
                                                        <AlertCircle
                                                            size={32}
                                                            className="mb-2"
                                                        />
                                                        <span className="text-xs">
                                                            Failed to load
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <img
                                                            src={getThumbnailUrl(
                                                                photo.file_path
                                                            )}
                                                            alt={`Photo ${photo.id}`}
                                                            loading="lazy"
                                                            decoding="async"
                                                            className="absolute inset-0  w-full h-full object-cover transition-opacity duration-300"
                                                            style={{
                                                                opacity:
                                                                    isLoading
                                                                        ? 0
                                                                        : 1,
                                                            }}
                                                            onLoad={() => {
                                                                setImageLoading(
                                                                    (prev) => {
                                                                        const next =
                                                                            new Set(
                                                                                prev
                                                                            );
                                                                        next.delete(
                                                                            photo.id
                                                                        );
                                                                        return next;
                                                                    }
                                                                );
                                                            }}
                                                            onError={() => {
                                                                setImageErrors(
                                                                    (prev) => {
                                                                        const next =
                                                                            new Set(
                                                                                prev
                                                                            );
                                                                        next.add(
                                                                            photo.id
                                                                        );
                                                                        return next;
                                                                    }
                                                                );
                                                                setImageLoading(
                                                                    (prev) => {
                                                                        const next =
                                                                            new Set(
                                                                                prev
                                                                            );
                                                                        next.delete(
                                                                            photo.id
                                                                        );
                                                                        return next;
                                                                    }
                                                                );
                                                            }}
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

                                                        {/* Like button - appears on hover */}
                                                        <div
                                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                            }}
                                                            onPointerDown={(
                                                                e
                                                            ) => {
                                                                e.stopPropagation();
                                                            }}
                                                            onMouseDown={(
                                                                e
                                                            ) => {
                                                                e.stopPropagation();
                                                            }}
                                                        >
                                                            <PhotoLikeButton
                                                                photoId={
                                                                    photo.id
                                                                }
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>

                {/* Hidden anchors for Lightbox */}
                <div
                    id="pswp-order"
                    style={{
                        position: "absolute",
                        left: -9999,
                        width: 1,
                        height: 1,
                        overflow: "hidden",
                    }}
                    aria-hidden
                >
                    {flatForHidden.map((photo) => (
                        <a
                            key={`hidden-${photo.id}`}
                            href={photo.file_path}
                            data-pswp-src={photo.file_path}
                            data-pswp-width={photo.width}
                            data-pswp-height={photo.height}
                            data-photo-id={photo.id}
                        />
                    ))}
                </div>

                {isLoadingMore && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-3" />
                        <p className="text-gray-600 text-sm font-medium">
                            Ładowanie kolejnych zdjęć...
                        </p>
                    </div>
                )}

                {displayedPhotos.length === allPhotos.length &&
                    allPhotos.length > 0 && (
                        <div className="text-center text-gray-400 py-6 text-sm">
                            Wszystkie zdjęcia zostały załadowane
                        </div>
                    )}
            </div>
        </>
    );
}
