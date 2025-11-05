// hooks/useCollectionData.ts
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type {
    Collection,
    Photo,
} from "@/components/dashboard/collections/types";

export function useCollectionData(collectionId: string | null) {
    const router = useRouter();
    const [collection, setCollection] = useState<Collection | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [userPlan, setUserPlan] = useState<string>("free");
    const [username, setUsername] = useState<string>("");

    async function fetchCollection() {
        if (!collectionId) return;
        try {
            const res = await fetch(`/api/collections/${collectionId}`);
            if (res.ok) {
                const data = await res.json();
                setCollection(data);
            } else {
                router.push("/dashboard/collections");
            }

            // Fetch user's plan and username
            const userRes = await fetch("/api/user/me");
            if (userRes.ok) {
                const userData = await userRes.json();
                setUserPlan(userData.user?.subscription_plan || "free");
                setUsername(userData.user?.username || "");
            }
        } catch (error) {
            console.error("Error fetching collection:", error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchPhotos() {
        if (!collectionId) return;
        try {
            const res = await fetch(`/api/collections/${collectionId}/photos`);
            if (res.ok) {
                const data = await res.json();
                console.log("Photos data:", data);
                setPhotos(data);
            }
        } catch (error) {
            console.error("Error fetching photos:", error);
        }
    }

    async function deletePhoto(photoId: number) {
        if (!collectionId) return;
        try {
            const res = await fetch(
                `/api/collections/${collectionId}/photos/${photoId}`,
                { method: "DELETE" }
            );
            if (res.ok) {
                setPhotos((prev) => prev.filter((p) => p.id !== photoId));
                await fetchCollection();
                toast.success("Photo deleted");
            } else {
                toast.error("Failed to delete photo");
            }
        } catch (error) {
            toast.error("Error during deletion");
        }
    }

    async function deleteAllPhotos() {
        if (!collectionId || photos.length === 0) return;

        try {
            const deletePromises = photos.map((photo) =>
                fetch(`/api/collections/${collectionId}/photos/${photo.id}`, {
                    method: "DELETE",
                })
            );

            const results = await Promise.all(deletePromises);
            const failedCount = results.filter((r) => !r.ok).length;

            if (failedCount > 0) {
                toast.error(`Failed to delete ${failedCount} photos`);
            } else {
                toast.success("All photos have been deleted");
            }

            await fetchPhotos();
            await fetchCollection();
        } catch (error) {
            console.error("Error deleting all photos:", error);
            toast.error("Error deleting photos");
        }
    }

    async function downloadAllPhotos() {
        if (!collectionId || photos.length === 0) return;

        try {
            toast.info("Preparing your download...");

            const response = await fetch(
                `/api/collections/${collectionId}/download-zip`
            );

            if (!response.ok) {
                throw new Error("Failed to download");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${collection?.slug || "photos"}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Download started!");
        } catch (error) {
            console.error("Error downloading photos:", error);
            toast.error("Error downloading photos");
        }
    }

    useEffect(() => {
        if (!collectionId) return;
        fetchCollection();
        fetchPhotos();
    }, [collectionId]);

    return {
        collection,
        photos,
        loading,
        userPlan,
        username,
        setCollection,
        setPhotos,
        fetchCollection,
        fetchPhotos,
        deletePhoto,
        deleteAllPhotos,
        downloadAllPhotos,
    };
}
