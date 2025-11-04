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
import CollectionSettingsModal from "@/components/dashboard/CollectionSettingsModal";
import HeroImageEditModal from "@/components/dashboard/HeroImageEditModal";
import CopyLinkButton from "@/components/buttons/CopyLinkButton";
import UpgradeDialog from "@/components/ui/UpgradeDialog";
import { Eye, Trash2, Download, Globe, Lock, ImagePlus } from "lucide-react";
import MainButton from "@/components/buttons/MainButton";

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
    const [confirmDeleteAllOpen, setConfirmDeleteAllOpen] = useState(false);
    const [heroModalOpen, setHeroModalOpen] = useState(false);
    const [heroImageEditModalOpen, setHeroImageEditModalOpen] = useState(false);
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [savingHeroImage, setSavingHeroImage] = useState(false);
    const [origin, setOrigin] = useState("");
    const [userPlan, setUserPlan] = useState<string>("free");
    const [username, setUsername] = useState<string>("");
    const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
    const [upgradeContext, setUpgradeContext] = useState({
        title: "Feature available on higher plans",
        description: "",
        feature: "",
    });

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
                // set preview to saved template after loading
                if (data?.hero_template) {
                    setSelectedTemplate(data.hero_template);
                }
                if (data?.hero_font) {
                    setSelectedFont(data.hero_font);
                }
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

                // If this is an error requiring a plan upgrade
                if (res.status === 403 && err?.upgradeRequired) {
                    setUpgradeContext({
                        title: err?.error || "Template unavailable",
                        description:
                            err?.message ||
                            "This template requires a Basic, Pro, or Unlimited subscription.",
                        feature: "Premium templates",
                    });
                    setUpgradeDialogOpen(true);
                    return;
                }

                throw new Error(err?.error || "Failed to save template");
            }

            const result = await res.json();
            setCollection(result.collection);
            setSelectedTemplate(result.collection.hero_template || tpl);
            setSelectedFont(result.collection.hero_font || font);
            toast.success("Saved hero design and font");
            setHeroModalOpen(false);
        } catch (e: any) {
            toast.error(e?.message || "Failed to save");
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

    // 🔥 Helper: Skompresuj plik jeśli jest za duży
    async function compressIfNeeded(file: File): Promise<File> {
        const fileSizeMB = file.size / 1024 / 1024;

        // Vercel limit: 4.5MB, ale dajemy margines bezpieczeństwa
        if (file.size <= 3.8 * 1024 * 1024) {
            return file; // Plik bezpieczny - OK
        }

        // Toast że kompresujemy
        toast.loading(
            `Compressing ${file.name}... (${fileSizeMB.toFixed(1)}MB)`,
            {
                id: `compress-${file.name}`,
            }
        );

        try {
            const imageCompression = (await import("browser-image-compression"))
                .default;

            // Bardziej agresywna kompresja
            const options = {
                maxSizeMB: 3.2, // Bardzo bezpieczny limit
                maxWidthOrHeight: 3840, // 4K max
                useWebWorker: true,
                initialQuality: 0.8, // Lekko niższa jakość
            };

            const compressed = await imageCompression(file, options);
            const compressedSizeMB = compressed.size / 1024 / 1024;

            toast.success(
                `Compressed ${file.name}: ${fileSizeMB.toFixed(
                    1
                )}MB → ${compressedSizeMB.toFixed(1)}MB`,
                { id: `compress-${file.name}`, duration: 2000 }
            );

            console.log(
                `📦 Compressed ${file.name}: ${fileSizeMB.toFixed(
                    2
                )}MB → ${compressedSizeMB.toFixed(2)}MB`
            );

            return compressed;
        } catch (error) {
            console.error("❌ Compression failed:", error);
            toast.error(`Compression failed for ${file.name}`, {
                id: `compress-${file.name}`,
                description: "File may be too large to upload.",
            });

            // Zwróć null zamiast oryginału - nie uploadujemy plików które są za duże
            throw new Error(
                `File ${file.name} is too large (${fileSizeMB.toFixed(
                    1
                )}MB) and compression failed`
            );
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
        const uploadedPhotos: Array<{
            file_name: string;
            file_path: string;
            file_size: number;
            width: number;
            height: number;
        }> = [];

        const uploadSingle = async (file: File) => {
            // Skompresuj jeśli potrzeba
            const fileToUpload = await compressIfNeeded(file);

            const formData = new FormData();
            formData.append("file", fileToUpload); // ✅ Użyj skompresowanego pliku!
            formData.append("type", "photo");
            formData.append("collectionId", collectionId);

            // Upload tylko do R2 (bez zapisu w bazie - zrobimy batch!)
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
                        toast.error("Out of space", {
                            description:
                                errorData.message ||
                                "Storage limit exceeded. Redirecting to upgrade...",
                        });
                        router.push("/dashboard/billing");
                    }
                    throw new Error("Storage limit reached");
                }
                throw new Error(`Failed to upload ${file.name}`);
            }

            const { url, size, width, height } = await uploadRes.json();

            // Dodaj do listy do batch insert
            uploadedPhotos.push({
                file_name: file.name,
                file_path: url,
                file_size: size,
                width,
                height,
            });

            uploaded++;
            setUploadProgress(Math.round((uploaded / totalFiles) * 100));
        };

        try {
            // Zwiększmy współbieżność dla szybszego uploadu
            const CONCURRENCY = 22; // ⚡ 22 równoległych uploadów
            let index = 0;

            const worker = async () => {
                while (index < totalFiles) {
                    const currentIndex = index++;
                    const file = fileArray[currentIndex];
                    try {
                        await uploadSingle(file);
                    } catch (err) {
                        console.error("Upload failed for", file.name, err);
                    }
                }
            };

            const workers = Array.from(
                { length: Math.min(CONCURRENCY, totalFiles) },
                () => worker()
            );
            await Promise.all(workers);

            // 💰 BATCH INSERT - zapisz wszystkie zdjęcia jednym zapytaniem (taniej!)
            if (uploadedPhotos.length > 0) {
                const saveRes = await fetch(
                    `/api/collections/${collectionId}/photos/batch`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ photos: uploadedPhotos }),
                    }
                );

                if (!saveRes.ok) {
                    const errorData = await saveRes.json().catch(() => ({}));
                    if (saveRes.status === 413 && errorData?.upgradeRequired) {
                        toast.error("Out of space", {
                            description:
                                errorData.message || "Storage limit exceeded.",
                        });
                        router.push("/dashboard/billing");
                        return;
                    }
                    throw new Error("Failed to save photos to database");
                }
            }

            // Odśwież listę zdjęć
            await fetchPhotos();
            await fetchCollection();

            toast.success(`Uploaded ${uploaded} of ${totalFiles} photos`);
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Error uploading photos");
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }

    async function handleDrop(files: FileList) {
        if (!collectionId) return;
        if (files.length === 0) return;

        setUploading(true);
        setUploadProgress(0);

        const fileArray = Array.from(files);
        const totalFiles = fileArray.length;
        let uploaded = 0;
        let quotaErrorRedirected = false;
        const uploadedPhotos: Array<{
            file_name: string;
            file_path: string;
            file_size: number;
            width: number;
            height: number;
        }> = [];

        const uploadSingle = async (file: File) => {
            // Skompresuj jeśli potrzeba
            const fileToUpload = await compressIfNeeded(file);

            const formData = new FormData();
            formData.append("file", fileToUpload);
            formData.append("type", "photo");
            formData.append("collectionId", collectionId);

            // Upload tylko do R2 (bez zapisu w bazie - zrobimy batch!)
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
                        toast.error("Out of space", {
                            description:
                                errorData.message ||
                                "Storage limit exceeded. Redirecting to upgrade...",
                        });
                        router.push("/dashboard/billing");
                    }
                    throw new Error("Storage limit reached");
                }
                throw new Error(`Failed to upload ${file.name}`);
            }

            const { url, size, width, height } = await uploadRes.json();

            // Dodaj do listy do batch insert
            uploadedPhotos.push({
                file_name: file.name,
                file_path: url,
                file_size: size,
                width,
                height,
            });

            uploaded++;
            setUploadProgress(Math.round((uploaded / totalFiles) * 100));
        };

        try {
            // Zwiększmy współbieżność dla szybszego uploadu
            const CONCURRENCY = 30; // ⚡ 30 równoległych uploadów
            let index = 0;

            const worker = async () => {
                while (index < totalFiles) {
                    const currentIndex = index++;
                    const file = fileArray[currentIndex];
                    try {
                        await uploadSingle(file);
                    } catch (err) {
                        console.error("Upload failed for", file.name, err);
                    }
                }
            };

            const workers = Array.from(
                { length: Math.min(CONCURRENCY, totalFiles) },
                () => worker()
            );
            await Promise.all(workers);

            // 💰 BATCH INSERT - zapisz wszystkie zdjęcia jednym zapytaniem (taniej!)
            if (uploadedPhotos.length > 0) {
                const saveRes = await fetch(
                    `/api/collections/${collectionId}/photos/batch`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ photos: uploadedPhotos }),
                    }
                );

                if (!saveRes.ok) {
                    const errorData = await saveRes.json().catch(() => ({}));
                    if (saveRes.status === 413 && errorData?.upgradeRequired) {
                        toast.error("Out of space", {
                            description:
                                errorData.message || "Storage limit exceeded.",
                        });
                        router.push("/dashboard/billing");
                        return;
                    }
                    throw new Error("Failed to save photos to database");
                }
            }

            // Odśwież listę zdjęć
            await fetchPhotos();
            await fetchCollection();

            toast.success(`Uploaded ${uploaded} of ${totalFiles} photos`);
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Error uploading photos");
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
                toast.success("Photo deleted");
            } else {
                toast.error("Failed to delete photo");
            }
        } catch (error) {
            toast.error("Error during deletion");
        }
    }

    function handleDeletePhotoClick(photoId: number) {
        setPendingPhotoId(photoId);
        setConfirmOpen(true);
    }

    async function performDeleteAllPhotos() {
        if (!collectionId || photos.length === 0) return;

        try {
            // Usuń wszystkie zdjęcia po kolei
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

            // Odśwież listę
            await fetchPhotos();
            await fetchCollection();
        } catch (error) {
            console.error("Error deleting all photos:", error);
            toast.error("Error deleting photos");
        }
    }

    async function handleDownloadAllPhotos() {
        if (!collectionId || photos.length === 0) return;

        try {
            toast.info("Preparing your download...");

            // Pobierz ZIP z API
            const response = await fetch(
                `/api/collections/${collectionId}/download-zip`
            );

            if (!response.ok) {
                throw new Error("Failed to download");
            }

            // Pobierz blob i utwórz link do pobrania
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

    async function handleSaveSettings(isPublic: boolean, password?: string) {
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
            setSettingsModalOpen(false);
        } catch (error: any) {
            console.error("Error updating settings:", error);
            toast.error(error.message || "Error saving settings");
        } finally {
            setSavingSettings(false);
        }
    }

    async function handleSaveHeroImage(file: File) {
        if (!collectionId) return;

        try {
            setSavingHeroImage(true);

            // 1. Upload image to R2
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

            // 2. Update collection with new hero image URL
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

            // Dodaj timestamp do URL aby wymusić odświeżenie obrazu (cache busting)
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
            setHeroImageEditModalOpen(false);
        } catch (error) {
            console.error("Error updating hero image:", error);
            toast.error("Error updating hero image");
        } finally {
            setSavingHeroImage(false);
        }
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
        <div className="min-h-screen">
            {/* Top Bar */}
            <div className="bg-white/70 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
                    <CollectionHeader collection={collection} photos={photos} />
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1500px] mx-auto p-2 md:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                    {/* Left Sidebar - Hero Template & Stats */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-6 lg:sticky lg:top-16 lg:self-start lg:overflow-y-auto lg:h-[85vh] lg:pr-3 scrollbar-hidden">
                        {/* Hero Template Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="border-b border-gray-200 px-5 py-4">
                                <h2 className="text-base font-semibold text-gray-900">
                                    Hero appearance
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Gallery page template
                                </p>
                            </div>

                            <div className="p-5">
                                <div className="space-y-4">
                                    {/* Template Preview */}
                                    {currentTemplate && (
                                        <div className="relative bg-gray-900 rounded-xl overflow-hidden border border-gray-200">
                                            <div className="absolute top-0 right-0 z-10 bg-white/5 w-full h-full" />
                                            <div className="w-full overflow-hidden aspect-video">
                                                <div
                                                    className="origin-top-left"
                                                    style={{
                                                        transform: "scale(0.2)",
                                                        width: "500%",
                                                        height: "500%",
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
                                                Active template
                                            </span>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {currentTemplate?.label ||
                                                    "Minimal"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Edit Buttons */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <MainButton
                                            onClick={() =>
                                                setHeroImageEditModalOpen(true)
                                            }
                                            icon={<ImagePlus size={15} />}
                                            label="Edit Image"
                                            variant="orange"
                                            className="w-full"
                                        />
                                        <MainButton
                                            onClick={() =>
                                                setHeroModalOpen(true)
                                            }
                                            label="Template"
                                            variant="purple"
                                            className="w-full"
                                        />
                                    </div>
                                    <MainButton
                                        href={
                                            username
                                                ? `https://${username}.seovileo.pl/g/${collection.slug}`
                                                : `${origin}/g/${collection.slug}`
                                        }
                                        target="_blank"
                                        icon={<Eye size={15} />}
                                        label="View Gallery"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="border-b border-gray-200 px-5 py-4">
                                <h2 className="text-base font-semibold">
                                    Manage collection
                                </h2>
                            </div>
                            <div className="p-5 space-y-3">
                                <MainButton
                                    onClick={handleDownloadAllPhotos}
                                    icon={<Download size={16} />}
                                    label="Download as ZIP"
                                    variant="orange"
                                    className="w-full"
                                    disabled={photos.length === 0}
                                />
                                <MainButton
                                    onClick={() => setSettingsModalOpen(true)}
                                    icon={
                                        collection.is_public ? (
                                            <Globe size={16} />
                                        ) : (
                                            <Lock size={16} />
                                        )
                                    }
                                    label="Collection settings"
                                    variant="success"
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="border-b border-gray-200 px-5 py-4">
                                <h2 className="text-base font-semibold text-gray-900">
                                    Stats
                                </h2>
                            </div>
                            <div className="p-5 space-y-3">
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-gray-600">
                                        Number of photos
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {photos.length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                                    <span className="text-sm text-gray-600">
                                        Size
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
                                        Created on
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {new Date(
                                            collection.created_at
                                        ).toLocaleDateString("en-US")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Upload & Gallery */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                        {/* Copy Gallery Link */}
                        <div className="mb-6">
                            <CopyLinkButton
                                url={
                                    username
                                        ? `https://${username}.seovileo.pl/g/${collection.slug}`
                                        : `${origin}/g/${collection.slug}`
                                }
                                showUrl={true}
                                label="Copy"
                                variant="default"
                            />
                        </div>
                        {/* Upload Section */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            <div className="border-b border-gray-200 px-5 py-4">
                                <h2 className="text-lg font-semibold text-gray-800 tracking-tight">
                                    Add photos
                                </h2>

                                <p className="text-sm text-gray-600 mt-1">
                                    Drag files here or click to select
                                </p>
                            </div>
                            <div className="p-5">
                                <PhotoUploadSection
                                    uploading={uploading}
                                    uploadProgress={uploadProgress}
                                    onUpload={handleUpload}
                                    onDrop={handleDrop}
                                />
                            </div>
                        </div>

                        {/* Gallery Section */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="border-b border-gray-200 px-5 py-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base font-semibold text-gray-900">
                                        Photo gallery ({photos.length})
                                    </h2>
                                    {photos.length > 0 && (
                                        <MainButton
                                            onClick={() =>
                                                setConfirmDeleteAllOpen(true)
                                            }
                                            icon={<Trash2 size={15} />}
                                            label="Delete all"
                                            variant="danger"
                                            className="text-xs md:text-sm"
                                        />
                                    )}
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
                title="Are you sure you want to delete this photo?"
                description="This action cannot be undone."
                confirmLabel="Delete photo"
                cancelLabel="Cancel"
                onConfirm={async () => {
                    if (pendingPhotoId != null) {
                        await performDeletePhoto(pendingPhotoId);
                        setPendingPhotoId(null);
                    }
                }}
            />

            <ConfirmDialog
                open={confirmDeleteAllOpen}
                onOpenChange={setConfirmDeleteAllOpen}
                title="Delete all photos?"
                description={`This will delete ${photos.length} ${
                    photos.length === 1 ? "photo" : "photos"
                } from this collection. This action cannot be undone.`}
                confirmLabel="Delete all"
                cancelLabel="Cancel"
                onConfirm={async () => {
                    await performDeleteAllPhotos();
                    setConfirmDeleteAllOpen(false);
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

            <CollectionSettingsModal
                open={settingsModalOpen}
                onClose={() => setSettingsModalOpen(false)}
                isPublic={collection.is_public}
                passwordPlain={collection.password_plain}
                onSave={handleSaveSettings}
                saving={savingSettings}
                userPlan={userPlan}
                onUpgradeRequired={() => {
                    setSettingsModalOpen(false);
                    setUpgradeContext({
                        title: "Password-protected gallery",
                        description:
                            "Password protection is available starting from the Basic plan. Please upgrade to use it.",
                        feature: "Password protection",
                    });
                    setUpgradeDialogOpen(true);
                }}
            />

            <HeroImageEditModal
                open={heroImageEditModalOpen}
                onClose={() => setHeroImageEditModalOpen(false)}
                currentHeroImage={collection.hero_image}
                onSave={handleSaveHeroImage}
                saving={savingHeroImage}
            />

            <UpgradeDialog
                open={upgradeDialogOpen}
                onClose={() => setUpgradeDialogOpen(false)}
                title={upgradeContext.title}
                description={upgradeContext.description}
                feature={upgradeContext.feature}
            />
        </div>
    );
}
