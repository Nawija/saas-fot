import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Collection } from "@/types/collection";

interface UseCollectionsReturn {
    collections: Collection[];
    loading: boolean;
    username: string;
    fetchCollections: () => Promise<void>;
    deleteCollection: (collectionId: number) => Promise<void>;
}

export function useCollections(): UseCollectionsReturn {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState<string>("");

    useEffect(() => {
        fetchCollections();
        fetchUsername();
    }, []);

    const fetchUsername = async () => {
        try {
            const res = await fetch("/api/user/me");
            const data = await res.json();
            if (data.ok && data.user?.username) {
                setUsername(data.user.username);
            }
        } catch (error) {
            console.error("Error fetching username:", error);
        }
    };

    const fetchCollections = async () => {
        try {
            const res = await fetch("/api/collections");
            const data = await res.json();
            if (data.ok) {
                setCollections(data.collections);
            }
        } catch (error) {
            console.error("Error fetching collections:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteCollection = async (collectionId: number) => {
        try {
            const res = await fetch(`/api/collections/${collectionId}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (data.ok) {
                const freedSpaceMB =
                    Math.round((data.freedSpace / 1024 / 1024) * 10) / 10;
                toast.success(`Gallery deleted — freed ${freedSpaceMB} MB`, {
                    description: `Deleted ${data.deletedFiles} files`,
                });
                setCollections((prev) =>
                    prev.filter((c) => c.id !== collectionId)
                );
            } else {
                toast.error("Delete error", {
                    description: data.error || "Failed to delete",
                });
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("An error occurred while deleting");
        }
    };

    return {
        collections,
        loading,
        username,
        fetchCollections,
        deleteCollection,
    };
}
