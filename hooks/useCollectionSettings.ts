// hooks/useCollectionSettings.ts
import { useState } from "react";
import { toast } from "sonner";
import type { Collection } from "@/components/dashboard/collections/types";

export function useCollectionSettings(
    collectionId: string | null,
    setCollection: (collection: Collection) => void
) {
    const [savingSettings, setSavingSettings] = useState(false);

    async function saveSettings(isPublic: boolean, password?: string) {
        if (!collectionId) return;

        try {
            setSavingSettings(true);
            const res = await fetch(`/api/collections/${collectionId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    is_public: isPublic,
                    password_plain: isPublic ? null : password,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update settings");
            }

            const result = await res.json();
            setCollection(result.collection);
            toast.success("Settings updated");
            return true;
        } catch (error: any) {
            console.error("Error updating settings:", error);
            toast.error(error.message || "Error saving settings");
            return false;
        } finally {
            setSavingSettings(false);
        }
    }

    return {
        savingSettings,
        saveSettings,
    };
}
