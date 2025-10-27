// app/dashboard/collections/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Loading from "@/components/ui/Loading";
import CollectionHeader from "@/components/dashboard/CollectionHeader";
import HeroPreviewModal from "@/components/dashboard/HeroPreviewModal";
import PhotoUploadSection from "@/components/dashboard/PhotoUploadSection";
import PhotosGrid from "@/components/dashboard/PhotosGrid";
import { HERO_TEMPLATES } from "@/components/dashboard/hero-templates/registry";

interface Collection {
    id: number;
    name: string;
    slug: string;
    description: string;
    hero_image: string;
    hero_template?: string;
    is_public: boolean;
    password_plain?: string;
    created_at: string;
    photo_count: number;
}

interface Photo {
    id: number;
    file_path: string;
    file_name: string;
    file_size: number;
    created_at: string;
}

// HERO_TEMPLATES przeniesione do components/dashboard/hero-templates/registry.tsx
// Importuj z rejestru zamiast deklarować tutaj

export default function CollectionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const [collectionId, setCollectionId] = useState<string | null>(null);
    const [collection, setCollection] = useState<Collection | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [saving, setSaving] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>("minimal");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingPhotoId, setPendingPhotoId] = useState<number | null>(null);
    const [heroModalOpen, setHeroModalOpen] = useState(false);

    useEffect(() => {
        params.then((p) => {
            setCollectionId(p.id);
        });
    }, [params]);

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
                // ustaw podgląd na zapisany szablon po załadowaniu
                if (data?.hero_template) {
                    setSelectedTemplate(data.hero_template);
                }
            } else {
                router.push("/dashboard/collections");
            }
        } catch (error) {
            console.error("Error fetching collection:", error);
        } finally {
            setLoading(false);
        }
    }

    async function updateHeroTemplate(tpl: string) {
        if (!collectionId || !collection) return;
        try {
            setSaving(true);
            const res = await fetch(`/api/collections/${collectionId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hero_template: tpl }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || "Błąd zapisu szablonu");
            }
            const result = await res.json();
            setCollection(result.collection);
            setSelectedTemplate(result.collection.hero_template || tpl);
            toast.success("Zapisano wygląd hero");
            setHeroModalOpen(false);
        } catch (e: any) {
            toast.error(e?.message || "Nie udało się zapisać");
        } finally {
            setSaving(false);
        }
    }

    async function fetchPhotos() {
        if (!collectionId) return;
        try {
            const res = await fetch(`/api/collections/${collectionId}/photos`);
            if (res.ok) {
                const data = await res.json();
                console.log("Photos data:", data); // Debug
                setPhotos(data);
            }
        } catch (error) {
            console.error("Error fetching photos:", error);
        }
    }

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!collectionId) return;
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setUploadProgress(0);

        const fileArray = Array.from(files);
        const totalFiles = fileArray.length;
        let uploaded = 0;
        let quotaErrorRedirected = false;

        const uploadSingle = async (file: File) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "photo");
            formData.append("collectionId", collectionId);

            // Upload do R2
            const uploadRes = await fetch("/api/collections/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) {
                let errorData: any = {};
                try {
                    errorData = await uploadRes.json();
                } catch {}
                if (
                    uploadRes.status === 413 &&
                    (errorData?.upgradeRequired || errorData?.message)
                ) {
                    if (!quotaErrorRedirected) {
                        quotaErrorRedirected = true;
                        toast.error("Brak miejsca", {
                            description:
                                errorData.message ||
                                "Przekroczono limit storage. Przekierowuję do zakupu rozszerzenia...",
                        });
                        router.push("/dashboard/billing");
                    }
                    throw new Error("Storage limit reached");
                }
                throw new Error(`Failed to upload ${file.name}`);
            }

            const { url, size } = await uploadRes.json();

            // Zapisz w bazie
            const saveRes = await fetch(
                `/api/collections/${collectionId}/photos`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        file_name: file.name,
                        file_path: url,
                        file_size: size,
                    }),
                }
            );

            if (!saveRes.ok) {
                let errorData: any = {};
                try {
                    errorData = await saveRes.json();
                } catch {}
                if (
                    saveRes.status === 413 &&
                    (errorData?.upgradeRequired || errorData?.message)
                ) {
                    if (!quotaErrorRedirected) {
                        quotaErrorRedirected = true;
                        toast.error("Brak miejsca", {
                            description:
                                errorData.message ||
                                "Przekroczono limit storage. Przekierowuję do zakupu rozszerzenia...",
                        });
                        router.push("/dashboard/billing");
                    }
                    throw new Error("Storage limit reached");
                }
                throw new Error(`Failed to save ${file.name}`);
            }

            // Progress po zakończeniu pojedynczego pliku
            uploaded++;
            setUploadProgress(Math.round((uploaded / totalFiles) * 100));
        };

        try {
            // Prosty pulpit współbieżności (limit równoległych uploadów)
            const CONCURRENCY = 4; // rozsądna równoległość
            let index = 0;

            const worker = async () => {
                while (index < totalFiles) {
                    const currentIndex = index++;
                    const file = fileArray[currentIndex];
                    try {
                        await uploadSingle(file);
                    } catch (err) {
                        // Błąd pojedynczego pliku — log i kontynuacja pozostałych
                        console.error("Upload failed for", file.name, err);
                    }
                }
            };

            const workers = Array.from(
                { length: Math.min(CONCURRENCY, totalFiles) },
                () => worker()
            );
            await Promise.all(workers);

            // Odśwież listę zdjęć
            await fetchPhotos();
            await fetchCollection();

            toast.success(`Dodano ${uploaded} z ${totalFiles} zdjęć`);
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Błąd podczas uploadu zdjęć");
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }

    async function performDeletePhoto(photoId: number) {
        if (!collectionId) return;
        try {
            const res = await fetch(
                `/api/collections/${collectionId}/photos/${photoId}`,
                { method: "DELETE" }
            );
            if (res.ok) {
                setPhotos((prev) => prev.filter((p) => p.id !== photoId));
                await fetchCollection();
                toast.success("Zdjęcie usunięte");
            } else {
                toast.error("Nie udało się usunąć zdjęcia");
            }
        } catch (error) {
            toast.error("Błąd podczas usuwania");
        }
    }

    function handleDeletePhotoClick(photoId: number) {
        setPendingPhotoId(photoId);
        setConfirmOpen(true);
    }

    if (loading) {
        return <Loading />;
    }

    if (!collection) {
        return null;
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <CollectionHeader collection={collection} photos={photos} />

                {/* Hero Template Section (launches full-screen modal) */}
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Wygląd sekcji hero
                            </h2>
                            <p className="text-sm text-gray-600">
                                Otwórz kreator, aby podejrzeć i wybrać szablon w
                                pełnym ekranie.
                            </p>
                        </div>

                        <button
                            onClick={() => setHeroModalOpen(true)}
                            className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 shadow-sm"
                        >
                            Otwórz kreator
                        </button>
                    </div>
                    <div className="rounded-lg border border-dashed border-gray-200 p-4 bg-gray-50 text-sm text-gray-600">
                        Aktualny szablon:{" "}
                        <span className="font-medium text-gray-900">
                            {HERO_TEMPLATES.find(
                                (t) =>
                                    t.key ===
                                    (collection.hero_template || "minimal")
                            )?.label || "Minimal"}
                        </span>
                    </div>
                </div>

                <PhotoUploadSection
                    uploading={uploading}
                    uploadProgress={uploadProgress}
                    onUpload={handleUpload}
                />

                <PhotosGrid
                    photos={photos}
                    onDeletePhoto={handleDeletePhotoClick}
                />
            </div>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Na pewno chcesz usunąć to zdjęcie?"
                description="Tej operacji nie można cofnąć."
                confirmLabel="Usuń zdjęcie"
                cancelLabel="Anuluj"
                onConfirm={async () => {
                    if (pendingPhotoId != null) {
                        await performDeletePhoto(pendingPhotoId);
                        setPendingPhotoId(null);
                    }
                }}
            />
            <HeroPreviewModal
                open={heroModalOpen}
                onClose={() => setHeroModalOpen(false)}
                templates={HERO_TEMPLATES}
                selectedTemplate={selectedTemplate}
                savedTemplate={collection.hero_template || "minimal"}
                saving={saving}
                onSelectTemplate={setSelectedTemplate}
                onSave={() => updateHeroTemplate(selectedTemplate)}
                onReset={() =>
                    setSelectedTemplate(collection.hero_template || "minimal")
                }
                collectionName={collection.name}
                collectionDescription={collection.description}
                heroImage={collection.hero_image}
            />
        </div>
    );
}
