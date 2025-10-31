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
    const id = hash.replace("#photo-", "");
    const idx = photos.findIndex((p) => String(p.id) === id);
    return idx >= 0 ? idx : null;
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

    // Masonry columns: distribute photos into N columns and append new photos
    const [columnsCount, setColumnsCount] = useState<number>(3);
    const [columns, setColumns] = useState<Photo[][]>([]);
    const [columnsHeights, setColumnsHeights] = useState<number[]>([]); // approximate heights by aspect ratio

    // helper to create empty columns
    const createEmptyColumns = (n: number) =>
        Array.from({ length: n }, () => [] as Photo[]);

    // distribute a full list into columns (used for initial render or when columnsCount changes)
    const distributePhotosIntoColumns = (photos: Photo[], n: number) => {
        const cols = createEmptyColumns(n);
        const heights = new Array(n).fill(0);
        photos.forEach((p) => {
            const aspect = (p.height || 1) / (p.width || 1);
            // put into shortest column
            let minIdx = 0;
            for (let i = 1; i < n; i++)
                if (heights[i] < heights[minIdx]) minIdx = i;
            cols[minIdx].push(p);
            heights[minIdx] += aspect;
        });
        return { cols, heights };
    };

    // append a batch of photos to existing columns (keeps previous items in place)
    const appendPhotosToColumns = (nextBatch: Photo[]) => {
        if (!nextBatch || nextBatch.length === 0) return;
        setColumns((prevCols) => {
            const n = Math.max(columnsCount, 1);
            const cols =
                prevCols.length === n
                    ? prevCols.map((c) => [...c])
                    : createEmptyColumns(n);
            const heights = cols.map((c, i) => {
                // compute current height estimate if we don't have it
                return (
                    columnsHeights[i] ??
                    cols[i].reduce(
                        (s, p) => s + (p.height || 1) / (p.width || 1),
                        0
                    )
                );
            });

            nextBatch.forEach((p) => {
                const aspect = (p.height || 1) / (p.width || 1);
                let minIdx = 0;
                for (let i = 1; i < n; i++)
                    if (heights[i] < heights[minIdx]) minIdx = i;
                cols[minIdx].push(p);
                heights[minIdx] += aspect;
            });

            setColumnsHeights(heights);
            return cols;
        });
    };

    // Fetch gallery
    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            const token = sessionStorage.getItem(`gallery_${params.slug}`);
            const { ok, collection, photos, status } = await apiGetPhotos(
                String(params.slug),
                token ?? undefined
            );

            if (ok && collection && photos) {
                // Sort photos chronologicznie (np. 1.jpg, 2.jpg, itd.)
                const sorted = [...photos].sort((a, b) =>
                    a.file_path.localeCompare(b.file_path, undefined, {
                        numeric: true,
                    })
                );
                setCollection(collection);
                setAllPhotos(sorted);
                const initial = sorted.slice(0, PHOTOS_PER_PAGE);
                setDisplayedPhotos(initial);
                // distribute initial photos into columns (if columnsCount already set)
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

        // Ładuj nowe zdjęcia, gdy zbliżamy się do końca strony
        if (scrollTop + clientHeight >= scrollHeight - 300) {
            setIsLoadingMore(true);
            setPage((prev) => prev + 1);
        }
    }, [isLoadingMore]);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    // Doładowywanie kolejnych zdjęć (DOKŁADANIE bez przeskakiwania)
    useEffect(() => {
        if (page === 1) return;
        const start = (page - 1) * PHOTOS_PER_PAGE;
        const nextBatch = allPhotos.slice(start, start + PHOTOS_PER_PAGE);
        if (nextBatch.length > 0) {
            setDisplayedPhotos((prev) => {
                const updated = [...prev, ...nextBatch];
                return updated;
            });
            // append to columns so we don't recompute entire ordering
            appendPhotosToColumns(nextBatch);
        }
        setIsLoadingMore(false);
    }, [page, allPhotos]);

    // PhotoSwipe
    useEffect(() => {
        // initialize PhotoSwipe on DOM anchors (columns determine DOM order)
        if (!galleryRef.current) return;

        let lightbox: PhotoSwipeLightbox | null = new PhotoSwipeLightbox({
            gallery: "#gallery",
            children: "a",
            pswpModule: () => import("photoswipe"),
            bgOpacity: 0.95,
            spacing: 0.1,
            loop: true,
        });

        lightbox.init();

        // compute DOM order (flattened columns)
        const flat = columns.flat();
        const idxFromHash = getPhotoIndexFromHash(flat);
        if (idxFromHash !== null && galleryRef.current) {
            const links =
                galleryRef.current.querySelectorAll("a[data-photo-id]");
            const link = links[idxFromHash] as HTMLAnchorElement | undefined;
            if (link) {
                setTimeout(() => {
                    link.click();
                    link.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }, 100);
            }
        }

        return () => {
            lightbox?.destroy();
            lightbox = null;
        };
    }, [columns]);

    // responsive: update columnsCount on resize
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

    // when columnsCount changes, redistribute all displayed photos into new columns
    useEffect(() => {
        if (displayedPhotos.length === 0) return;
        const { cols, heights } = distributePhotosIntoColumns(
            displayedPhotos,
            columnsCount
        );
        setColumns(cols);
        setColumnsHeights(heights);
    }, [columnsCount]);

    if (loading) return <LoadingGallery />;

    if (!collection) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
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
                                            onClick={(e) => e.preventDefault()}
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
