import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Collection {
    id: number;
    name: string;
    slug: string;
    description: string;
    hero_image: string;
    hero_image_position_x?: number;
    hero_image_position_y?: number;
    hero_template?: string;
    hero_font?: string;
    is_public: boolean;
    password_plain?: string;
    subdomain?: string;
    created_at: string;
    photo_count: number;
}

interface Photo {
    id: number;
    file_path: string;
    file_name: string;
    file_size: number;
    width?: number;
    height?: number;
    created_at: string;
}

export function useCollectionDetail(collectionId: string | null) {
    const router = useRouter();
    const [collection, setCollection] = useState<Collection | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [userPlan, setUserPlan] = useState<string>("free");
    const [username, setUsername] = useState<string>("");

    useEffect(() => {
        if (!collectionId) return;
        fetchCollection();
        fetchPhotos();
    }, [collectionId]);

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
                toast.success("All photos deleted");
            }
            await fetchPhotos();
            await fetchCollection();
        } catch (error) {
            toast.error("Error deleting photos");
        }
    }

    async function downloadAllPhotos(slug: string) {
        if (!collectionId || photos.length === 0) return;
        try {
            toast.info("Preparing download...");
            const response = await fetch(
                `/api/collections/${collectionId}/download-zip`
            );
            if (!response.ok) throw new Error("Failed to download");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${slug || "photos"}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Download started!");
        } catch (error) {
            toast.error("Error downloading photos");
        }
    }

    return {
        collection,
        setCollection,
        photos,
        loading,
        userPlan,
        username,
        fetchCollection,
        fetchPhotos,
        deletePhoto,
        deleteAllPhotos,
        downloadAllPhotos,
    };
}
