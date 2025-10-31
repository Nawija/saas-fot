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
    const galleryRef = useRef<HTMLDivElement>(null);
    const PHOTOS_PER_PAGE = 20;

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
                // Sort photos chronologically (by filename or ID)
                const sorted = [...photos].sort((a, b) =>
                    a.file_path.localeCompare(b.file_path, undefined, {
                        numeric: true,
                    })
                );
                setCollection(collection);
                setAllPhotos(sorted);
                setDisplayedPhotos(sorted.slice(0, PHOTOS_PER_PAGE));
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
        if (!galleryRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } =
            document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            // Load next batch
            setPage((prev) => prev + 1);
        }
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    // Load more photos when page increases
    useEffect(() => {
        if (page === 1) return;
        const start = (page - 1) * PHOTOS_PER_PAGE;
        const newPhotos = allPhotos.slice(0, start + PHOTOS_PER_PAGE);
        setDisplayedPhotos(newPhotos);
    }, [page, allPhotos]);

    // Initialize PhotoSwipe
    useEffect(() => {
        if (displayedPhotos.length === 0) return;

        let lightbox: PhotoSwipeLightbox | null = new PhotoSwipeLightbox({
            gallery: "#gallery",
            children: "a",
            pswpModule: () => import("photoswipe"),
            bgOpacity: 0.95,
            spacing: 0.1,
            loop: true,
            closeTitle: "Zamknij (Esc)",
            zoomTitle: "Zoom",
            arrowPrevTitle: "Poprzednie (←)",
            arrowNextTitle: "Następne (→)",
            errorMsg: "Nie można załadować zdjęcia",
        });

        lightbox.on("change", () => {
            const idx = lightbox?.pswp?.currIndex ?? 0;
            const photo = displayedPhotos[idx];
            if (photo) {
                window.location.hash = `photo-${photo.id}`;
            }
        });

        lightbox.on("close", () => {
            if (window.location.hash.startsWith("#photo-")) {
                history.replaceState(
                    null,
                    "",
                    window.location.pathname + window.location.search
                );
            }
        });

        lightbox.init();

        const idxFromHash = getPhotoIndexFromHash(displayedPhotos);
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
    }, [displayedPhotos]);

    // Masonry reorder to go row-by-row visually
    const reorderForColumns = (photos: Photo[], columns = 3) => {
        const reordered: Photo[] = [];
        const rows = Math.ceil(photos.length / columns);
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                const index = col * rows + row;
                if (photos[index]) reordered.push(photos[index]);
            }
        }
        return reordered;
    };

    const photosToRender = reorderForColumns(displayedPhotos, 3);

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

                {/* Masonry Layout */}
                <div id="s" className="scroll-m-2">
                    <div
                        id="gallery"
                        ref={galleryRef}
                        className="columns-1 sm:columns-2 lg:columns-3 gap-1"
                    >
                        {photosToRender.map((photo, index) => (
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
                                        alt={`Photo ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* Loading indicator */}
                    {displayedPhotos.length < allPhotos.length && (
                        <div className="text-center text-white py-6">
                            Ładowanie kolejnych zdjęć...
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
