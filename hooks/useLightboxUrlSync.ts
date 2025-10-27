"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { Photo } from "@/types/gallery";

interface UseLightboxUrlSyncProps {
    photos: Photo[];
    lightboxOpen: boolean;
    setLightboxOpen: (open: boolean) => void;
    currentIndex: number;
    setCurrentIndex: (index: number) => void;
    paramName?: string; // default: "photo"
}

export function useLightboxUrlSync({
    photos,
    lightboxOpen,
    setLightboxOpen,
    currentIndex,
    setCurrentIndex,
    paramName = "photo",
}: UseLightboxUrlSyncProps) {
    const searchParams = useSearchParams();

    // Open lightbox from direct link (?photo=ID)
    useEffect(() => {
        const photoParam = searchParams.get(paramName);
        if (!photoParam || photos.length === 0) return;
        const id = parseInt(photoParam, 10);
        if (Number.isNaN(id)) return;
        const idx = photos.findIndex((p) => p.id === id);
        if (idx !== -1) {
            setCurrentIndex(idx);
            if (!lightboxOpen) setLightboxOpen(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, photos]);

    // Keep URL in sync with lightbox state and current photo
    useEffect(() => {
        if (lightboxOpen && photos[currentIndex]) {
            const url = new URL(window.location.href);
            url.searchParams.set(paramName, String(photos[currentIndex].id));
            window.history.replaceState({}, "", url.toString());
        } else {
            const url = new URL(window.location.href);
            url.searchParams.delete(paramName);
            window.history.replaceState({}, "", url.toString());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lightboxOpen, currentIndex, photos]);
}
