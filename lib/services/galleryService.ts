"use client";

import type { Photo, Collection } from "@/types/gallery";

export interface GetPhotosResponse {
    ok: boolean;
    collection?: Collection;
    photos?: Photo[];
    status?: number;
}

export async function getPhotos(
    slug: string,
    token?: string,
    subdomain?: string
): Promise<GetPhotosResponse> {
    const url = subdomain
        ? `/api/gallery/${slug}/photos?subdomain=${subdomain}`
        : `/api/gallery/${slug}/photos`;
    const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    return {
        ok: data.ok,
        collection: data.collection,
        photos: data.photos,
        status: res.status,
    };
}

export async function toggleLike(
    photoId: number
): Promise<{ ok: boolean; liked?: boolean }> {
    const res = await fetch(`/api/gallery/photos/${photoId}/like`, {
        method: "POST",
    });
    if (!res.ok) return { ok: false };
    const data = await res.json();
    return { ok: true, liked: data.liked };
}

export async function downloadZip(
    slug: string,
    photoIds: number[],
    onlyFavorites: boolean
): Promise<Blob> {
    const response = await fetch(`/api/gallery/${slug}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoIds, onlyFavorites }),
    });
    if (!response.ok) throw new Error("Błąd pobierania");
    return await response.blob();
}
