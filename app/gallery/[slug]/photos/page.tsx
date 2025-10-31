"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import LoadingGallery from "@/components/ui/LoadingGallery";
import type { Photo, Collection } from "@/types/gallery";
import GalleryHero from "@/components/gallery/GalleryHero";
import { getPhotos as apiGetPhotos } from "@/lib/services/galleryService";
import Image from "next/image";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";

// Helper to get photo index from hash
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
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const galleryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchGallery();
    }, []);

    // Initialize PhotoSwipe
    useEffect(() => {
        if (photos.length === 0) return;

        let lightbox: PhotoSwipeLightbox | null = new PhotoSwipeLightbox({
            gallery: "#gallery",
            children: "a",
            pswpModule: () => import("photoswipe"),
            bgOpacity: 0.95,
            spacing: 0.1,
            loop: true,
            closeTitle: "Zamknij (Esc)",
            zoomTitle: "Zoom",
            arrowPrevTitle: "Poprzednie (strzałka w lewo)",
            arrowNextTitle: "Następne (strzałka w prawo)",
            errorMsg: "Nie można załadować zdjęcia",
        });

        // On slide change, update hash and scroll grid to photo
        lightbox.on("change", () => {
            const idx = lightbox?.pswp?.currIndex ?? 0;
            const photo = photos[idx];
            if (photo) {
                window.location.hash = `photo-${photo.id}`;
                // Scroll to the photo in the grid
                if (galleryRef.current) {
                    const links =
                        galleryRef.current.querySelectorAll("a[data-photo-id]");
                    const link = links[idx] as HTMLElement | undefined;
                    if (link) {
                        link.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                        });
                    }
                }
            }
        });

        // On close, clear hash
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

        // If hash present, programmatically click the correct <a> to open PhotoSwipe and scroll to it
        const idxFromHash = getPhotoIndexFromHash(photos);
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

        // Listen for hashchange (user pastes or navigates)
        const onHashChange = () => {
            const idx = getPhotoIndexFromHash(photos);
            if (idx !== null && galleryRef.current) {
                const links =
                    galleryRef.current.querySelectorAll("a[data-photo-id]");
                const link = links[idx] as HTMLAnchorElement | undefined;
                if (link) link.click();
            }
        };
        window.addEventListener("hashchange", onHashChange);

        return () => {
            lightbox?.destroy();
            lightbox = null;
            window.removeEventListener("hashchange", onHashChange);
        };
    }, [photos]);

    const fetchGallery = async () => {
        try {
            const token = sessionStorage.getItem(`gallery_${params.slug}`);
            const { ok, collection, photos, status } = await apiGetPhotos(
                String(params.slug),
                token ?? undefined
            );
            if (ok && collection && photos) {
                setCollection(collection);
                setPhotos(photos);
            } else if (status === 401) {
                router.push(`/gallery/${params.slug}`);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingGallery />;
    }

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
            {/* Hero Section */}
            <GalleryHero collection={collection} />

            {/* Gallery Grid */}
            <div className="min-h-screen bg-neutral-950 py-12 px-2">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-medium text-white mb-2">
                        {collection.name}
                    </h2>
                    <p className="text-white/60">
                        {photos.length}{" "}
                        {photos.length === 1 ? "zdjęcie" : "zdjęć"}
                    </p>
                </div>

                {/* Premium Masonry Grid with PhotoSwipe */}
                <div id="s" className="scroll-m-2">
                    <div
                        id="gallery"
                        ref={galleryRef}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
                    >
                        {photos.map((photo, index) => (
                            <a
                                key={photo.id}
                                href={photo.file_path}
                                data-pswp-src={photo.file_path}
                                data-pswp-width={photo.width}
                                data-pswp-height={photo.height}
                                data-photo-id={photo.id}
                                className="relative group cursor-pointer overflow-hidden bg-neutral-900 block"
                                style={{
                                    aspectRatio: `${photo.width} / ${photo.height}`,
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                }}
                            >
                                <Image
                                    src={photo.file_path}
                                    alt={`Photo ${index + 1}`}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
