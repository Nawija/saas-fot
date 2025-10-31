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

        lightbox.init();

        return () => {
            lightbox?.destroy();
            lightbox = null;
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
            <div className="min-h-screen bg-neutral-950 py-12 px-4 md:px-8">
                {/* Header */}
                <div className="max-w-7xl mx-auto mb-8">
                    <h2 className="text-2xl md:text-3xl font-medium text-white mb-2">
                        {collection.name}
                    </h2>
                    <p className="text-white/60">
                        {photos.length} {photos.length === 1 ? "zdjęcie" : "zdjęć"}
                    </p>
                </div>

                {/* Premium Masonry Grid with PhotoSwipe */}
                <div className="max-w-7xl mx-auto">
                    <div
                        id="gallery"
                        ref={galleryRef}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
                    >
                        {photos.map((photo, index) => (
                            <a
                                key={photo.id}
                                href={photo.file_path}
                                data-pswp-width={photo.width}
                                data-pswp-height={photo.height}
                                target="_blank"
                                rel="noreferrer"
                                className="relative group cursor-pointer overflow-hidden bg-neutral-900 block"
                                style={{
                                    aspectRatio: `${photo.width} / ${photo.height}`,
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
