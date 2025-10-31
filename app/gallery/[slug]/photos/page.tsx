"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import LoadingGallery from "@/components/ui/LoadingGallery";
import type { Photo, Collection } from "@/types/gallery";
import GalleryHero from "@/components/gallery/GalleryHero";
import { getPhotos as apiGetPhotos } from "@/lib/services/galleryService";
import Image from "next/image";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";

// Helper to get index from hash
function getPhotoIndexFromHash(photos: Photo[]): number | null {
    if (typeof window === "undefined") return null;
    const hash = window.location.hash;
    if (!hash.startsWith("#photo-")) return null;
    const numStr = hash.replace("#photo-", "");
    const n = parseInt(numStr, 10);
    if (Number.isNaN(n)) return null;
    const idx = n - 1; // convert 1-based to 0-based
    if (idx < 0 || idx >= photos.length) return null;
    return idx;
}

export default function GalleryPhotosPage() {
    const params = useParams();
    const router = useRouter();
    const [collection, setCollection] = useState<Collection | null>(null);
    const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
    const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const galleryRef = useRef<HTMLDivElement>(null);
    const PHOTOS_PER_PAGE = 20;

    // Masonry columns
    const [columnsCount, setColumnsCount] = useState<number>(3);
    const [columns, setColumns] = useState<Photo[][]>([]);
    const [columnsHeights, setColumnsHeights] = useState<number[]>([]);

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
        return { cols, heights };
    };

    const appendPhotosToColumns = (nextBatch: Photo[]) => {
        if (!nextBatch || nextBatch.length === 0) return;
        setColumns((prevCols) => {
            const n = Math.max(columnsCount, 1);
            const cols =
                prevCols.length === n
                    ? prevCols.map((c) => [...c])
                    : createEmptyColumns(n);
            const heights = cols.map(
                (c, i) =>
                    columnsHeights[i] ??
                    cols[i].reduce(
                        (s, p) => s + (p.height || 1) / (p.width || 1),
                        0
                    )
            );
            nextBatch.forEach((p) => {
                let minIdx = 0;
                for (let i = 1; i < n; i++)
                    if (heights[i] < heights[minIdx]) minIdx = i;
                cols[minIdx].push(p);
                heights[minIdx] += (p.height || 1) / (p.width || 1);
            });
            setColumnsHeights(heights);
            return cols;
        });
    };

    const flattenLeftToRight = (cols: Photo[][], n: number) => {
        const arr: Photo[] = [];
        if (!cols || cols.length === 0) return arr;
        const maxLen = Math.max(...cols.map((c) => c.length));
        for (let row = 0; row < maxLen; row++) {
            for (let col = 0; col < n; col++) {
                const p = cols[col]?.[row];
                if (p) arr.push(p);
            }
        }
        return arr;
    };

    // Fetch gallery
    useEffect(() => {
        fetchGallery();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchGallery = async () => {
        try {
            const token = sessionStorage.getItem(`gallery_${params.slug}`);
            const { ok, collection, photos, status } = await apiGetPhotos(
                String(params.slug),
                token ?? undefined
            );

            if (ok && collection && photos) {
                const sorted = [...photos].sort((a, b) =>
                    a.file_path.localeCompare(b.file_path, undefined, {
                        numeric: true,
                    })
                );
                setCollection(collection);
                setAllPhotos(sorted);
                const initial = sorted.slice(0, PHOTOS_PER_PAGE);
                setDisplayedPhotos(initial);
                const { cols, heights } = distributePhotosIntoColumns(
                    initial,
                    columnsCount
                );
                setColumns(cols);
                setColumnsHeights(heights);
            } else if (status === 401) {
                router.push(`/gallery/${params.slug}`);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Infinite scroll
    const handleScroll = useCallback(() => {
        if (isLoadingMore) return;
        const { scrollTop, scrollHeight, clientHeight } =
            document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 300) {
            setIsLoadingMore(true);
            setPage((prev) => prev + 1);
        }
    }, [isLoadingMore]);

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
            appendPhotosToColumns(nextBatch);
        }
        setIsLoadingMore(false);
    }, [page, allPhotos]);

    // PhotoSwipe using hidden left-to-right anchors
    const lightboxRef = useRef<PhotoSwipeLightbox | null>(null);

    useEffect(() => {
        const orderContainer = document.getElementById("pswp-order");
        if (!orderContainer) return;

        // preserve current open index if lightbox already exists
        let previousIndex: number | null = null;
        const previousLightbox = lightboxRef.current as any;
        if (previousLightbox) {
            const prevPswp = previousLightbox.pswp;
            try {
                previousIndex =
                    typeof prevPswp?.getCurrentIndex === "function"
                        ? prevPswp.getCurrentIndex()
                        : prevPswp?.currIndex ?? null;
            } catch (e) {
                previousIndex = null;
            }
            try {
                previousLightbox.destroy();
            } catch (e) {
                // ignore
            }
            lightboxRef.current = null;
        }

        const lightbox = new PhotoSwipeLightbox({
            gallery: "#pswp-order",
            children: "a",
            pswpModule: () => import("photoswipe"),
            bgOpacity: 0.95,
            spacing: 0.1,
            loop: true,
        });

        lightbox.init();
        lightboxRef.current = lightbox;

        // guard to prevent repeated triggers while a page is already requested
        const triggeredRef = { value: false } as { value: boolean };

        const lbAny = lightbox as any;
        const pswp = lbAny.pswp;

        const tryGetIndex = () => {
            // try pswp instance first, then lightbox
            const inst = pswp ?? lbAny.instance ?? lbAny.pswp;
            if (!inst) return null;
            return typeof inst.getCurrentIndex === "function"
                ? inst.getCurrentIndex()
                : inst.currIndex ?? null;
        };

        const onIndexChange = () => {
            try {
                const idx = tryGetIndex();
                if (idx == null) return;
                const currentLoaded = displayedPhotos.length;
                if (
                    currentLoaded < allPhotos.length &&
                    idx >= currentLoaded - 2 &&
                    !triggeredRef.value
                ) {
                    triggeredRef.value = true;
                    setIsLoadingMore(true);
                    setPage((p) => p + 1);
                    setTimeout(() => (triggeredRef.value = false), 1500);
                }
                try {
                    // update URL hash to reflect currently visible photo index (1-based)
                    if (typeof window !== "undefined" && "history" in window) {
                        const newUrl =
                            window.location.pathname +
                            window.location.search +
                            `#photo-${idx + 1}`;
                        window.history.replaceState(null, "", newUrl);
                    }
                } catch (e) {
                    // ignore
                }
            } catch (e) {
                // ignore
            }
        };

        // Attach handlers to both the underlying pswp instance (if present)
        // and the PhotoSwipeLightbox wrapper — some navigation events come from one or the other
        const closeHandler = () => {
            try {
                if (typeof window !== "undefined" && "history" in window) {
                    window.history.replaceState(
                        null,
                        "",
                        window.location.pathname + window.location.search
                    );
                }
            } catch (e) {
                // ignore
            }
        };

        if (pswp && typeof pswp.on === "function") {
            pswp.on("change", onIndexChange);
            pswp.on("indexChange", onIndexChange);
            pswp.on("close", closeHandler);
        }

        if (lbAny && typeof lbAny.on === "function") {
            lbAny.on("change", onIndexChange);
            lbAny.on("indexChange", onIndexChange);
            lbAny.on("close", closeHandler);
        }

        // keep the click fallback
        orderContainer.addEventListener("click", onIndexChange);

        // Polling fallback: some navigation methods may not emit change events we can catch reliably.
        // Start a short interval to check current index while the lightbox is active.
        let lastIdx: number | null = null;
        const pollInterval =
            typeof window !== "undefined"
                ? window.setInterval(() => {
                      try {
                          const idx = tryGetIndex();
                          if (idx == null) return;
                          if (idx !== lastIdx) {
                              lastIdx = idx;
                              try {
                                  if (
                                      typeof window !== "undefined" &&
                                      "history" in window
                                  ) {
                                      const newUrl =
                                          window.location.pathname +
                                          window.location.search +
                                          `#photo-${idx + 1}`;
                                      window.history.replaceState(
                                          null,
                                          "",
                                          newUrl
                                      );
                                  }
                              } catch (e) {
                                  // ignore
                              }
                          }
                      } catch (e) {
                          // ignore
                      }
                  }, 250)
                : null;

        // if we had a previous open index, reopen at same index in the new instance
        if (previousIndex != null) {
            const links = orderContainer.querySelectorAll("a[data-photo-id]");
            const link = links[previousIndex] as HTMLAnchorElement | undefined;
            if (link) {
                setTimeout(() => link.click(), 50);
            }
        } else {
            const flatLTR = flattenLeftToRight(columns, columnsCount);
            const idxFromHash = getPhotoIndexFromHash(flatLTR);
            if (idxFromHash !== null) {
                const links =
                    orderContainer.querySelectorAll("a[data-photo-id]");
                const link = links[idxFromHash] as
                    | HTMLAnchorElement
                    | undefined;
                if (link) setTimeout(() => link.click(), 100);
            }
        }

        return () => {
            if (pswp && typeof pswp.off === "function") {
                try {
                    pswp.off("change", onIndexChange);
                    pswp.off("indexChange", onIndexChange);
                    pswp.off("close", closeHandler);
                } catch (e) {
                    // ignore
                }
            }
            if (lbAny && typeof lbAny.off === "function") {
                try {
                    lbAny.off("change", onIndexChange);
                    lbAny.off("indexChange", onIndexChange);
                    lbAny.off("close", closeHandler);
                } catch (e) {}
            }
            orderContainer.removeEventListener("click", onIndexChange);
            try {
                if (pollInterval) window.clearInterval(pollInterval);
            } catch (e) {}
            try {
                lightbox.destroy();
            } catch (e) {}
            if (lightboxRef.current === lightbox) lightboxRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columns, columnsCount, displayedPhotos.length, allPhotos.length]);

    // responsive
    useEffect(() => {
        const updateCols = () => {
            const w = typeof window !== "undefined" ? window.innerWidth : 1200;
            if (w < 640) setColumnsCount(1);
            else if (w < 1024) setColumnsCount(2);
            else setColumnsCount(3);
        };
        updateCols();
        window.addEventListener("resize", updateCols);
        return () => window.removeEventListener("resize", updateCols);
    }, []);

    useEffect(() => {
        if (displayedPhotos.length === 0) return;
        const { cols, heights } = distributePhotosIntoColumns(
            displayedPhotos,
            columnsCount
        );
        setColumns(cols);
        setColumnsHeights(heights);
    }, [columnsCount, displayedPhotos]);

    const openPhotoInLightbox = (id: string | number) => {
        // compute full left-to-right order from allPhotos so lightbox index matches hidden anchors
        const allCols = distributePhotosIntoColumns(
            allPhotos,
            columnsCount
        ).cols;
        const flatAll = flattenLeftToRight(allCols, columnsCount);
        const idx = flatAll.findIndex((p) => String(p.id) === String(id));
        const orderContainer = document.getElementById("pswp-order");
        const links = orderContainer?.querySelectorAll("a[data-photo-id]");
        const link = links?.[idx] as HTMLAnchorElement | undefined;
        if (link) {
            link.click();
            try {
                // Update URL to current photo index (1-based) without adding history entries
                if (typeof window !== "undefined" && "history" in window) {
                    const newUrl =
                        window.location.pathname +
                        window.location.search +
                        `#photo-${idx + 1}`;
                    window.history.replaceState(null, "", newUrl);
                }
            } catch (e) {
                // ignore
            }
            const visible = galleryRef.current?.querySelector(
                `a[data-photo-id="${id}"]`
            );
            if (visible)
                (visible as HTMLElement).scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
        }
    };

    if (loading) return <LoadingGallery />;

    if (!collection) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Brak dostępu</h1>
                    <button
                        onClick={() => router.push(`/gallery/${params.slug}`)}
                        className="text-white/70 hover:text-white"
                    >
                        Powrót do galerii
                    </button>
                </div>
            </div>
        );
    }

    // Build hidden anchors from the full set of photos so PhotoSwipe can navigate all images immediately
    const flatForHidden = (() => {
        const allCols = distributePhotosIntoColumns(
            allPhotos,
            columnsCount
        ).cols;
        return flattenLeftToRight(allCols, columnsCount);
    })();

    return (
        <>
            <GalleryHero collection={collection} />

            <div className="min-h-screen bg-neutral-950 py-12 px-2">
                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-medium text-white mb-2">
                        {collection.name}
                    </h2>
                    <p className="text-white/60">
                        {allPhotos.length}{" "}
                        {allPhotos.length === 1 ? "zdjęcie" : "zdjęć"}
                    </p>
                </div>

                <div id="s" className="scroll-m-2">
                    <div id="gallery" ref={galleryRef} className="flex gap-1">
                        {columns.length === 0 ? (
                            <div className="w-full text-center text-white/60 py-6">
                                Brak zdjęć
                            </div>
                        ) : (
                            columns.map((col, colIndex) => (
                                <div
                                    key={colIndex}
                                    className="flex-1 space-y-1"
                                >
                                    {col.map((photo: Photo) => (
                                        <a
                                            key={photo.id}
                                            href={photo.file_path}
                                            data-pswp-src={photo.file_path}
                                            data-pswp-width={photo.width}
                                            data-pswp-height={photo.height}
                                            data-photo-id={photo.id}
                                            className="mb-1 block w-full group cursor-pointer overflow-hidden bg-neutral-900"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                openPhotoInLightbox(photo.id);
                                            }}
                                        >
                                            <div
                                                className="relative w-full"
                                                style={{
                                                    aspectRatio: `${photo.width} / ${photo.height}`,
                                                }}
                                            >
                                                <Image
                                                    src={photo.file_path}
                                                    alt={`Photo ${photo.id}`}
                                                    fill
                                                    loading="lazy"
                                                    className="object-cover transition-opacity duration-500 opacity-100"
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Hidden ordered anchors for PhotoSwipe (left-to-right) */}
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

                    {/* Loader */}
                    {displayedPhotos.length < allPhotos.length && (
                        <div className="text-center text-white/70 py-6">
                            Ładowanie kolejnych zdjęć...
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
