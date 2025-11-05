// hooks/useHeroSettings.ts
import { useState } from "react";
import { toast } from "sonner";
import type {
    Collection,
    UpgradeContext,
} from "@/components/dashboard/collections/types";

export function useHeroSettings(
    collectionId: string | null,
    collection: Collection | null,
    setCollection: (collection: Collection) => void,
    onUpgradeRequired: (context: UpgradeContext) => void
) {
    const [saving, setSaving] = useState(false);
    const [savingHeroImage, setSavingHeroImage] = useState(false);

    async function updateHeroSettings(tpl: string, font: string) {
        if (!collectionId || !collection) return;

        try {
            setSaving(true);
            const res = await fetch(`/api/collections/${collectionId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hero_template: tpl, hero_font: font }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));

                if (res.status === 403 && err?.upgradeRequired) {
                    onUpgradeRequired({
                        title: err?.error || "Template unavailable",
                        description:
                            err?.message ||
                            "This template requires a Basic, Pro, or Unlimited subscription.",
                        feature: "Premium templates",
                    });
                    return;
                }

                throw new Error(err?.error || "Failed to save template");
            }

            const result = await res.json();
            setCollection(result.collection);
            toast.success("Saved hero design and font");
            return true;
        } catch (e: any) {
            toast.error(e?.message || "Failed to save");
            return false;
        } finally {
            setSaving(false);
        }
    }

    async function saveHeroImage(file: File) {
        if (!collectionId) return;

        try {
            setSavingHeroImage(true);

            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "hero");
            formData.append("collectionId", collectionId.toString());

            const uploadRes = await fetch("/api/collections/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) {
                const uploadData = await uploadRes.json();
                throw new Error(uploadData.error || "Failed to upload image");
            }

            const { url, urlMobile } = await uploadRes.json();

            const updateRes = await fetch(`/api/collections/${collectionId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hero_image: url,
                    hero_image_mobile: urlMobile,
                }),
            });

            if (!updateRes.ok) {
                throw new Error("Failed to update collection");
            }

            const result = await updateRes.json();

            const updatedCollection = {
                ...result.collection,
                hero_image: result.collection.hero_image
                    ? `${result.collection.hero_image}?t=${Date.now()}`
                    : result.collection.hero_image,
                hero_image_mobile: result.collection.hero_image_mobile
                    ? `${result.collection.hero_image_mobile}?t=${Date.now()}`
                    : result.collection.hero_image_mobile,
            };

            setCollection(updatedCollection);
            toast.success("Hero image updated!");
            return true;
        } catch (error) {
            console.error("Error updating hero image:", error);
            toast.error("Error updating hero image");
            return false;
        } finally {
            setSavingHeroImage(false);
        }
    }

    return {
        saving,
        savingHeroImage,
        updateHeroSettings,
        saveHeroImage,
    };
}
