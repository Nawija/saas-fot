// app/dashboard/collections/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Loading from "@/components/ui/Loading";
import CollectionHeader from "@/components/dashboard/CollectionHeader";

import PhotoUploadSection from "@/components/dashboard/PhotoUploadSection";
import PhotosGrid from "@/components/dashboard/PhotosGrid";
import { HERO_TEMPLATES } from "@/components/dashboard/hero-templates/registry";
import HeroPreviewModal from "@/components/dashboard/HeroPreviewModal";
import CopyLinkButton from "@/components/buttons/CopyLinkButton";
import { BookImage } from "lucide-react";

interface Collection {
    id: number;
    name: string;
    slug: string;
    description: string;
    hero_image: string;
    hero_template?: string;
    hero_font?: string;
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
    width?: number;
    height?: number;
    created_at: string;
}

// HERO_TEMPLATES przeniesione do components/dashboard/hero-templates/registry.tsx
// Importuj z rejestru zamiast deklarować tutaj

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

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
    const [selectedFont, setSelectedFont] = useState<string>("inter");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingPhotoId, setPendingPhotoId] = useState<number | null>(null);
    const [heroModalOpen, setHeroModalOpen] = useState(false);
    const [origin, setOrigin] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setOrigin(window.location.origin);
        }
    }, []);

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

    // Inject Google Font for the dashboard preview card (reflects saved font)
    useEffect(() => {
        const fontKey = collection?.hero_font || "inter";
        const FONT_MAP: Record<string, { href: string }> = {
            inter: {
                href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap",
            },
            playfair: {
                href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap",
            },
            poppins: {
                href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap",
            },
        };
        const font = FONT_MAP[fontKey as keyof typeof FONT_MAP];
        const id = "dashboard-hero-font";
        if (!font) return;
        let link = document.getElementById(id) as HTMLLinkElement | null;
        if (!link) {
            link = document.createElement("link");
            link.id = id;
            link.rel = "stylesheet";
            document.head.appendChild(link);
        }
        link.href = font.href;
    }, [collection?.hero_font]);

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
                if (data?.hero_font) {
                    setSelectedFont(data.hero_font);
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

                // Jeśli to błąd wymagający upgrade'u planu
                if (res.status === 403 && err?.upgradeRequired) {
                    toast.error(err?.error || "Szablon niedostępny", {
                        description:
                            err?.message ||
                            "Ten szablon wymaga subskrypcji Basic, Pro lub Unlimited.",
                        duration: 5000,
                        action: {
                            label: "Wybierz plan",
                            onClick: () => router.push("/dashboard/billing"),
                        },
                    });
                    return;
                }

                throw new Error(err?.error || "Błąd zapisu szablonu");
            }

            const result = await res.json();
            setCollection(result.collection);
            setSelectedTemplate(result.collection.hero_template || tpl);
            setSelectedFont(result.collection.hero_font || font);
            toast.success("Zapisano wygląd hero i czcionkę");
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

            const { url, size, width, height } = await uploadRes.json();

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
                        width,
                        height,
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

    const currentTemplate = HERO_TEMPLATES.find(
        (t) => t.key === (collection.hero_template || "minimal")
    );

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
            {/* Top Bar */}
            <div className="bg-white/70 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <CollectionHeader collection={collection} photos={photos} />
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Sidebar - Hero Template & Stats */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Hero Template Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="border-b border-gray-200 px-5 py-4">
                                <h2 className="text-base font-semibold text-gray-900">
                                    Wygląd hero
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Szablon strony galerii
                                </p>
                            </div>

                            <div className="p-5">
                                <div className="space-y-4">
                                    {/* Template Preview */}
                                    {currentTemplate && (
                                        <div className="relative bg-gray-900 rounded-xl overflow-hidden border border-gray-200">
                                            <div
                                                className="w-full overflow-hidden"
                                                style={{
                                                    height: "300px",
                                                }}
                                            >
                                                <div
                                                    className="origin-top-left"
                                                    style={{
                                                        transform: "scale(0.5)",
                                                        width: "200%",
                                                        height: "200%",
                                                        fontFamily:
                                                            (collection?.hero_font ===
                                                                "playfair" &&
                                                                "'Playfair Display', Georgia, Cambria, 'Times New Roman', Times, serif") ||
                                                            (collection?.hero_font ===
                                                                "poppins" &&
                                                                "'Poppins', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif") ||
                                                            "'Inter', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif",
                                                    }}
                                                >
                                                    <currentTemplate.Desktop
                                                        title={collection.name}
                                                        description={
                                                            collection.description
                                                        }
                                                        image={
                                                            collection.hero_image
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Template Name */}
                                    <div className="bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-gray-600">
                                                Aktywny szablon
                                            </span>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {currentTemplate?.label ||
                                                    "Minimal"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Edit Button */}
                                    <button
                                        onClick={() => setHeroModalOpen(true)}
                                        className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 px-4 rounded-lg font-medium transition-colors duration-150 text-sm"
                                    >
                                        Otwórz edytor
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="border-b border-gray-200 px-5 py-4">
                                <h2 className="text-base font-semibold text-gray-900">
                                    Statystyki
                                </h2>
                            </div>
                            <div className="p-5 space-y-3">
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-gray-600">
                                        Liczba zdjęć
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {photos.length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                                    <span className="text-sm text-gray-600">
                                        Rozmiar
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {formatFileSize(
                                            photos.reduce(
                                                (sum, p) => sum + p.file_size,
                                                0
                                            )
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                                    <span className="text-sm text-gray-600">
                                        Data utworzenia
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {new Date(
                                            collection.created_at
                                        ).toLocaleDateString("pl-PL")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Upload & Gallery */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Copy Gallery Link */}
                        <div className="mb-6">
                            <CopyLinkButton
                                url={`${origin}/gallery/${collection.slug}`}
                                showUrl={true}
                                label="Kopiuj"
                                variant="default"
                            />
                        </div>
                        {/* Upload Section */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            <div className="border-b border-gray-200 px-5 py-4">
                                <h2 className="text-lg font-semibold text-gray-800 tracking-tight">
                                    Dodaj zdjęcia
                                </h2>

                                <p className="text-sm text-gray-600 mt-1">
                                    Przeciągnij pliki lub kliknij aby wybrać
                                </p>
                            </div>
                            <div className="p-5">
                                <PhotoUploadSection
                                    uploading={uploading}
                                    uploadProgress={uploadProgress}
                                    onUpload={handleUpload}
                                />
                            </div>
                        </div>

                        {/* Gallery Section */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="border-b border-gray-200 px-5 py-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base font-semibold text-gray-900">
                                        Galeria zdjęć
                                    </h2>
                                </div>
                            </div>
                            <div className="p-5">
                                {photos.length > 0 && (
                                    <PhotosGrid
                                        photos={photos}
                                        onDeletePhoto={handleDeletePhotoClick}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
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
                onSave={({ template, font }) =>
                    updateHeroSettings(template, font)
                }
                onReset={() => {
                    setSelectedTemplate(collection.hero_template || "minimal");
                    setSelectedFont(collection.hero_font || "inter");
                }}
                collectionName={collection.name}
                collectionDescription={collection.description}
                heroImage={collection.hero_image}
                selectedFont={selectedFont}
            />
        </div>
    );
}
