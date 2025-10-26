// app/dashboard/collections/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Loading from "@/components/ui/Loading";
import { AnimatePresence, motion } from "framer-motion";
import {
    Upload,
    Link as LinkIcon,
    Lock,
    Globe,
    ArrowLeft,
    Trash2,
    Eye,
    Check,
    Copy,
} from "lucide-react";

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

// Helper do formatowania rozmiaru plików
function formatFileSize(bytes: number): string {
    // Konwertuj na liczbę jeśli jest stringiem
    const numBytes = typeof bytes === "string" ? parseInt(bytes) : bytes;

    // Debug - usuń po naprawieniu
    if (numBytes > 1e10) {
        console.error("Suspicious file size:", numBytes, "original:", bytes);
        // Jeśli to błąd, zwróć 0
        return "0 B (błąd)";
    }

    if (numBytes === 0 || !numBytes) return "0 B";
    if (isNaN(numBytes) || !isFinite(numBytes)) return "0 B";

    const units = ["B", "KB", "MB", "GB"];
    const k = 1024;
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    const size = numBytes / Math.pow(k, i);

    return `${size.toFixed(1)} ${units[i]}`;
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
    const [copied, setCopied] = useState(false);
    const [saving, setSaving] = useState(false);
    const [previewTab, setPreviewTab] = useState<"landing" | "photos">(
        "landing"
    );
    const [selectedTemplate, setSelectedTemplate] = useState<string>("minimal");

    const galleryUrl = `${
        typeof window !== "undefined" ? window.location.origin : ""
    }/gallery/${collection?.slug}`;

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

    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(galleryUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (error) {
            toast.error("Nie udało się skopiować");
        }
    }

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingPhotoId, setPendingPhotoId] = useState<number | null>(null);

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

    if (loading) {
        return <Loading />;
    }

    if (!collection) {
        return null;
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push("/dashboard/collections")}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Powrót do kolekcji
                    </button>

                    

                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {collection.name}
                                    </h1>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            collection.is_public
                                                ? "bg-green-100 text-green-700"
                                                : "bg-orange-100 text-orange-700"
                                        }`}
                                    >
                                        {collection.is_public ? (
                                            <span className="flex items-center gap-1">
                                                <Globe className="w-3 h-3" />{" "}
                                                Publiczna
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                <Lock className="w-3 h-3" />{" "}
                                                Chroniona
                                            </span>
                                        )}
                                    </span>
                                </div>
                                {collection.description && (
                                    <p className="text-gray-600 mb-4">
                                        {collection.description}
                                    </p>
                                )}

                                {/* Hasło dostępu dla prywatnych galerii */}
                                {!collection.is_public &&
                                    collection.password_plain && (
                                        <div className="flex items-center justify-start gap-2 mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                            <p className="text-sm text-orange-700 font-medium">
                                                Hasło dostępu dla klientów:
                                            </p>
                                            <code className="text-base font-mono text-orange-900 font-semibold">
                                                {collection.password_plain}
                                            </code>
                                        </div>
                                    )}

                                {/* Link do udostępnienia */}
                                <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <LinkIcon className="w-4 h-4 text-gray-400" />
                                    <code className="flex-1 text-sm text-gray-700 font-mono">
                                        {galleryUrl}
                                    </code>
                                    <motion.button
                                        onClick={copyToClipboard}
                                        className={`relative overflow-hidden px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                                            copied
                                                ? "bg-green-600 hover:bg-green-700"
                                                : "bg-blue-500 hover:bg-blue-600"
                                        }`}
                                        animate={{
                                            width: copied ? "auto" : "auto",
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 25,
                                        }}
                                    >
                                        <AnimatePresence
                                            mode="wait"
                                            initial={false}
                                        >
                                            <motion.span
                                                key={
                                                    copied ? "copied" : "label"
                                                }
                                                initial={{ y: 10, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -10, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="flex items-center justify-center gap-2 whitespace-nowrap"
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check size={16} />
                                                        Skopiowano
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy size={16} />
                                                        Kopiuj
                                                    </>
                                                )}
                                            </motion.span>
                                        </AnimatePresence>
                                        <AnimatePresence>
                                            {copied && (
                                                <motion.span
                                                    className="absolute inset-0 rounded-lg bg-white/10"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{
                                                        duration: 0.3,
                                                    }}
                                                />
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                    <a
                                        href={galleryUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium flex items-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Zobacz
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    {collection.photo_count}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Zdjęć
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    {formatFileSize(
                                        photos.reduce(
                                            (sum, p) => sum + p.file_size,
                                            0
                                        )
                                    )}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Rozmiar
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    {new Date(
                                        collection.created_at
                                    ).toLocaleDateString("pl-PL")}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Utworzona
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero template selection */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Wygląd sekcji hero
                    </h2>

                    <p className="text-sm text-gray-600 mb-4">
                        Kliknij aby podejrzeć. Zapisz gdy wybierzesz docelowy
                        wygląd. Podgląd poniżej pokazuje wersję desktop i
                        telefon.
                    </p>

                    {/* Live preview: Desktop and Phone */}
                    <div className="mt-6">
                        {/* Desktop preview */}
                        <div className="relative w-[90%] mx-auto mb-8">
                            <div className="p-3 rounded-lg border border-gray-200 w-full shadow-xl bg-black ">
                                <div className="aspect-video p-3 relative">
                                    {(() => {
                                        const tpl = selectedTemplate;
                                        const title = collection.name;
                                        const desc = collection.description;
                                        const img = collection.hero_image;

                                        if (previewTab === "landing") {
                                            switch (tpl) {
                                                case "fullscreen":
                                                    return (
                                                        <div className="absolute inset-0">
                                                            {img ? (
                                                                <img
                                                                    src={img}
                                                                    alt={title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-linear-to-br from-slate-800 to-slate-600" />
                                                            )}
                                                            <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/20 to-black/60" />
                                                            <div className="absolute inset-0 flex items-center justify-center text-white px-6">
                                                                <div className="text-center">
                                                                    <h1 className="text-3xl font-extrabold mb-1">
                                                                        {title}
                                                                    </h1>
                                                                    {desc && (
                                                                        <p className="text-sm text-gray-200">
                                                                            {
                                                                                desc
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                case "split":
                                                    return (
                                                        <div className="grid grid-cols-2 h-full">
                                                            <div className="bg-white flex items-center justify-center">
                                                                <div className="p-6 text-center">
                                                                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                                                        {title}
                                                                    </h1>
                                                                    {desc && (
                                                                        <p className="text-gray-600 text-xs">
                                                                            {
                                                                                desc
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="relative">
                                                                {img ? (
                                                                    <img
                                                                        src={
                                                                            img
                                                                        }
                                                                        alt={
                                                                            title
                                                                        }
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-linear-to-br from-gray-700 to-gray-500" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                case "overlay":
                                                    return (
                                                        <div className="absolute inset-0">
                                                            {img ? (
                                                                <img
                                                                    src={img}
                                                                    alt={title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-linear-to-br from-gray-900 to-gray-700" />
                                                            )}
                                                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                                                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-white px-6">
                                                                <h1 className="text-2xl font-bold mb-1">
                                                                    {title}
                                                                </h1>
                                                                {desc && (
                                                                    <p className="text-gray-200 text-xs">
                                                                        {desc}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                case "gradient":
                                                    return (
                                                        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-slate-800 to-gray-700">
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-white/20 shadow-xl">
                                                                    {img ? (
                                                                        <img
                                                                            src={
                                                                                img
                                                                            }
                                                                            alt={
                                                                                title
                                                                            }
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-linear-to-br from-slate-600 to-slate-400" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="absolute inset-0 bg-[radial-gradient(transparent,rgba(0,0,0,0.5))]" />
                                                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-white px-6">
                                                                <h1 className="text-2xl font-extrabold mb-1">
                                                                    {title}
                                                                </h1>
                                                                {desc && (
                                                                    <p className="text-gray-200 text-xs">
                                                                        {desc}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                case "cards":
                                                    return (
                                                        <div className="grid grid-cols-2 h-full">
                                                            <div className="bg-white flex items-center justify-center">
                                                                <div className="p-6 text-center">
                                                                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                                                        {title}
                                                                    </h1>
                                                                    {desc && (
                                                                        <p className="text-gray-600 text-xs">
                                                                            {
                                                                                desc
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="bg-gray-100 grid grid-cols-3 gap-1 p-2">
                                                                <div className="bg-white" />
                                                                <div className="bg-white" />
                                                                <div className="bg-white" />
                                                            </div>
                                                        </div>
                                                    );
                                                case "minimal":
                                                default:
                                                    return (
                                                        <div className="absolute inset-0">
                                                            {img ? (
                                                                <img
                                                                    src={img}
                                                                    alt={title}
                                                                    className="w-full h-full object-cover opacity-60"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-800" />
                                                            )}
                                                            <div className="absolute inset-0 bg-black/60" />
                                                            <div className="absolute inset-0 flex items-center justify-center text-white">
                                                                <h1 className="text-3xl font-bold">
                                                                    {title}
                                                                </h1>
                                                            </div>
                                                        </div>
                                                    );
                                            }
                                        } else {
                                            // photos preview header
                                            switch (tpl) {
                                                case "fullscreen":
                                                    return (
                                                        <div className="absolute inset-0">
                                                            {img ? (
                                                                <img
                                                                    src={img}
                                                                    alt={title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-linear-to-br from-slate-800 to-slate-600" />
                                                            )}
                                                            <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/20 to-black/60" />
                                                            <div className="absolute inset-0 flex items-center justify-center text-white px-6">
                                                                <div className="text-center">
                                                                    <h1 className="text-3xl font-extrabold mb-1">
                                                                        {title}
                                                                    </h1>
                                                                    {desc && (
                                                                        <p className="text-sm text-gray-200">
                                                                            {
                                                                                desc
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                case "split":
                                                    return (
                                                        <div className="grid grid-cols-2 h-full">
                                                            <div className="bg-white flex items-center justify-center">
                                                                <div className="p-6 text-center">
                                                                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                                                        {title}
                                                                    </h1>
                                                                    {desc && (
                                                                        <p className="text-gray-600 text-xs">
                                                                            {
                                                                                desc
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="relative">
                                                                {img ? (
                                                                    <img
                                                                        src={
                                                                            img
                                                                        }
                                                                        alt={
                                                                            title
                                                                        }
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-linear-to-br from-gray-700 to-gray-500" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                case "overlay":
                                                    return (
                                                        <div className="absolute inset-0">
                                                            {img ? (
                                                                <img
                                                                    src={img}
                                                                    alt={title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-linear-to-br from-gray-900 to-gray-700" />
                                                            )}
                                                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                                                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-white px-6">
                                                                <h1 className="text-2xl font-bold mb-1">
                                                                    {title}
                                                                </h1>
                                                                {desc && (
                                                                    <p className="text-gray-200 text-xs">
                                                                        {desc}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                case "gradient":
                                                    return (
                                                        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-slate-800 to-gray-700">
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-white/20 shadow-xl">
                                                                    {img ? (
                                                                        <img
                                                                            src={
                                                                                img
                                                                            }
                                                                            alt={
                                                                                title
                                                                            }
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-linear-to-br from-slate-600 to-slate-400" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="absolute inset-0 bg-[radial-gradient(transparent,rgba(0,0,0,0.5))]" />
                                                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-white px-6">
                                                                <h1 className="text-2xl font-extrabold mb-1">
                                                                    {title}
                                                                </h1>
                                                                {desc && (
                                                                    <p className="text-gray-200 text-xs">
                                                                        {desc}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                    return (
                                                        <div className="grid grid-cols-2 h-full">
                                                            <div className="bg-white flex items-center justify-center">
                                                                <div className="p-6 text-center">
                                                                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                                                        {title}
                                                                    </h1>
                                                                    {desc && (
                                                                        <p className="text-gray-600 text-xs">
                                                                            {
                                                                                desc
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="bg-gray-100 grid grid-cols-3 gap-1 p-2">
                                                                <div className="bg-white" />
                                                                <div className="bg-white" />
                                                                <div className="bg-white" />
                                                            </div>
                                                        </div>
                                                    );
                                                case "minimal":
                                                default:
                                                    return (
                                                        <div className="absolute inset-0">
                                                            {img ? (
                                                                <img
                                                                    src={img}
                                                                    alt={title}
                                                                    className="w-full h-full object-cover opacity-60"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-800" />
                                                            )}
                                                            <div className="absolute inset-0 bg-black/60" />
                                                            <div className="absolute inset-0 flex items-center justify-center text-white">
                                                                <h1 className="text-3xl font-bold">
                                                                    {title}
                                                                </h1>
                                                            </div>
                                                        </div>
                                                    );
                                            }
                                        }
                                    })()}
                                </div>
                            </div>

                            <div className="absolute z-10 -bottom-2 -right-8 w-[200px] h-[420px] rounded-4xl border-8 border-black overflow-hidden shadow-xl bg-black">
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-1.5 rounded-full bg-black/60 z-20" />
                                <div className="absolute inset-0">
                                    {(() => {
                                        const tpl = selectedTemplate;
                                        const title = collection.name;
                                        const desc = collection.description;
                                        const img = collection.hero_image;
                                        if (previewTab === "landing") {
                                            switch (tpl) {
                                                case "fullscreen":
                                                    return (
                                                        <div className="absolute inset-0">
                                                            {img ? (
                                                                <img
                                                                    src={img}
                                                                    alt={title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-linear-to-br from-slate-800 to-slate-600" />
                                                            )}
                                                            <div className="absolute inset-0 bg-black/40" />
                                                            <div className="absolute inset-0 flex items-center justify-center text-white px-4">
                                                                <div className="text-center">
                                                                    <h1 className="text-2xl font-extrabold mb-1">
                                                                        {title}
                                                                    </h1>
                                                                    {desc && (
                                                                        <p className="text-xs text-gray-200 line-clamp-3">
                                                                            {
                                                                                desc
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                case "split":
                                                    return (
                                                        <div className="grid grid-rows-2 h-full">
                                                            <div className="bg-white flex items-center justify-center p-4">
                                                                <div className="text-center">
                                                                    <h1 className="text-xl font-bold text-gray-900 mb-1">
                                                                        {title}
                                                                    </h1>
                                                                    {desc && (
                                                                        <p className="text-gray-600 text-xs line-clamp-3">
                                                                            {
                                                                                desc
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="relative">
                                                                {img ? (
                                                                    <img
                                                                        src={
                                                                            img
                                                                        }
                                                                        alt={
                                                                            title
                                                                        }
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-linear-to-br from-gray-700 to-gray-500" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                case "overlay":
                                                    return (
                                                        <div className="absolute inset-0">
                                                            {img ? (
                                                                <img
                                                                    src={img}
                                                                    alt={title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-linear-to-br from-gray-900 to-gray-700" />
                                                            )}
                                                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white px-4">
                                                                <h1 className="text-xl font-bold mb-1">
                                                                    {title}
                                                                </h1>
                                                                {desc && (
                                                                    <p className="text-gray-200 text-xs line-clamp-2">
                                                                        {desc}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                case "gradient":
                                                    return (
                                                        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-slate-800 to-gray-700">
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 shadow-xl">
                                                                    {img ? (
                                                                        <img
                                                                            src={
                                                                                img
                                                                            }
                                                                            alt={
                                                                                title
                                                                            }
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-linear-to-br from-slate-600 to-slate-400" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="absolute inset-0 bg-[radial-gradient(transparent,rgba(0,0,0,0.5))]" />
                                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white px-4">
                                                                <h1 className="text-xl font-extrabold mb-1">
                                                                    {title}
                                                                </h1>
                                                                {desc && (
                                                                    <p className="text-gray-200 text-xs line-clamp-2">
                                                                        {desc}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                case "cards":
                                                    return (
                                                        <div className="grid grid-rows-2 h-full">
                                                            <div className="bg-white flex items-center justify-center p-4">
                                                                <div className="text-center">
                                                                    <h1 className="text-xl font-bold text-gray-900 mb-1">
                                                                        {title}
                                                                    </h1>
                                                                    {desc && (
                                                                        <p className="text-gray-600 text-xs line-clamp-3">
                                                                            {
                                                                                desc
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="bg-gray-100 grid grid-cols-3 gap-1 p-2">
                                                                <div className="bg-white h-20" />
                                                                <div className="bg-white h-20" />
                                                                <div className="bg-white h-20" />
                                                            </div>
                                                        </div>
                                                    );
                                                case "minimal":
                                                default:
                                                    return (
                                                        <div className="absolute inset-0">
                                                            {img ? (
                                                                <img
                                                                    src={img}
                                                                    alt={title}
                                                                    className="w-full h-full object-cover opacity-60"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-800" />
                                                            )}
                                                            <div className="absolute inset-0 bg-black/60" />
                                                            <div className="absolute inset-0 flex items-center justify-center text-white">
                                                                <h1 className="text-2xl font-bold">
                                                                    {title}
                                                                </h1>
                                                            </div>
                                                        </div>
                                                    );
                                            }
                                        } else {
                                            // Photos header (mobile)
                                            switch (tpl) {
                                                case "fullscreen":
                                                    return (
                                                        <div className="absolute inset-0">
                                                            {img ? (
                                                                <img
                                                                    src={img}
                                                                    alt={title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-linear-to-br from-slate-800 to-slate-600" />
                                                            )}
                                                            <div className="absolute inset-0 bg-black/40" />
                                                            <div className="absolute inset-0 flex items-center justify-center text-white px-4">
                                                                <div className="text-center">
                                                                    <h1 className="text-2xl font-extrabold mb-1">
                                                                        {title}
                                                                    </h1>
                                                                    {desc && (
                                                                        <p className="text-xs text-gray-200 line-clamp-3">
                                                                            {
                                                                                desc
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                case "split":
                                                    return (
                                                        <div className="grid grid-rows-2 h-full">
                                                            <div className="bg-white flex items-center justify-center p-4">
                                                                <div className="text-center">
                                                                    <h1 className="text-xl font-bold text-gray-900 mb-1">
                                                                        {title}
                                                                    </h1>
                                                                    {desc && (
                                                                        <p className="text-gray-600 text-xs line-clamp-3">
                                                                            {
                                                                                desc
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="relative">
                                                                {img ? (
                                                                    <img
                                                                        src={
                                                                            img
                                                                        }
                                                                        alt={
                                                                            title
                                                                        }
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-linear-to-br from-gray-700 to-gray-500" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                case "overlay":
                                                    return (
                                                        <div className="absolute inset-0">
                                                            {img ? (
                                                                <img
                                                                    src={img}
                                                                    alt={title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-linear-to-br from-gray-900 to-gray-700" />
                                                            )}
                                                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white px-4">
                                                                <h1 className="text-xl font-bold mb-1">
                                                                    {title}
                                                                </h1>
                                                                {desc && (
                                                                    <p className="text-gray-200 text-xs line-clamp-2">
                                                                        {desc}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                case "gradient":
                                                    return (
                                                        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-slate-800 to-gray-700">
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 shadow-xl">
                                                                    {img ? (
                                                                        <img
                                                                            src={
                                                                                img
                                                                            }
                                                                            alt={
                                                                                title
                                                                            }
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-linear-to-br from-slate-600 to-slate-400" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="absolute inset-0 bg-[radial-gradient(transparent,rgba(0,0,0,0.5))]" />
                                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white px-4">
                                                                <h1 className="text-xl font-extrabold mb-1">
                                                                    {title}
                                                                </h1>
                                                                {desc && (
                                                                    <p className="text-gray-200 text-xs line-clamp-2">
                                                                        {desc}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                case "cards":
                                                    return (
                                                        <div className="grid grid-rows-2 h-full">
                                                            <div className="bg-white flex items-center justify-center p-4">
                                                                <div className="text-center">
                                                                    <h1 className="text-xl font-bold text-gray-900 mb-1">
                                                                        {title}
                                                                    </h1>
                                                                    {desc && (
                                                                        <p className="text-gray-600 text-xs line-clamp-3">
                                                                            {
                                                                                desc
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="bg-gray-100 grid grid-cols-3 gap-1 p-2">
                                                                <div className="bg-white h-16" />
                                                                <div className="bg-white h-16" />
                                                                <div className="bg-white h-16" />
                                                            </div>
                                                        </div>
                                                    );
                                                case "minimal":
                                                default:
                                                    return (
                                                        <div className="absolute inset-0">
                                                            {img ? (
                                                                <img
                                                                    src={img}
                                                                    alt={title}
                                                                    className="w-full h-full object-cover opacity-60"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-800" />
                                                            )}
                                                            <div className="absolute inset-0 bg-black/60" />
                                                            <div className="absolute inset-0 flex items-center justify-center text-white">
                                                                <h1 className="text-2xl font-bold">
                                                                    {title}
                                                                </h1>
                                                            </div>
                                                        </div>
                                                    );
                                            }
                                        }
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-start w-full overflow-x-auto gap-4">
                        {[
                            { key: "minimal", label: "Minimal" },
                            { key: "fullscreen", label: "Pełny ekran" },
                            { key: "split", label: "Podział 50/50" },
                            { key: "overlay", label: "Overlay" },
                            { key: "gradient", label: "Gradient" },
                        ].map((tpl) => {
                            const isSaved =
                                (collection.hero_template || "minimal") ===
                                tpl.key;
                            const isPreview = selectedTemplate === tpl.key;
                            return (
                                <button
                                    key={tpl.key}
                                    onClick={() => setSelectedTemplate(tpl.key)}
                                    className={`group relative w-max text-left overflow-hidden rounded-xl border transition-all ${
                                        isPreview
                                            ? "border-blue-500"
                                            : isSaved
                                            ? "border-green-500"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <div className="p-3 flex items-center justify-between">
                                        <div className="text-sm font-medium text-gray-900">
                                            {tpl.label}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {isSaved && (
                                                <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                                                    <Check className="w-4 h-4" />{" "}
                                                    Zapisany
                                                </span>
                                            )}
                                            {isPreview && !isSaved && (
                                                <span className="inline-flex items-center gap-1 text-blue-600 text-xs font-medium">
                                                    <Check className="w-4 h-4" />{" "}
                                                    Podgląd
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <button
                            disabled={
                                saving ||
                                selectedTemplate ===
                                    (collection.hero_template || "minimal")
                            }
                            onClick={() => updateHeroTemplate(selectedTemplate)}
                            className={`px-4 py-2 text-sm rounded-md text-white ${
                                saving ||
                                selectedTemplate ===
                                    (collection.hero_template || "minimal")
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            {saving
                                ? "Zapisywanie..."
                                : "Zapisz wybrany wygląd"}
                        </button>
                        <button
                            disabled={saving}
                            onClick={() =>
                                setSelectedTemplate(
                                    collection.hero_template || "minimal"
                                )
                            }
                            className="px-4 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50"
                        >
                            Reset podglądu
                        </button>
                    </div>
                </div>

                {/* Upload Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Dodaj zdjęcia
                    </h2>

                    <label className="block">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleUpload}
                            disabled={uploading}
                            className="hidden"
                            id="photo-upload"
                        />
                        <div
                            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                                uploading
                                    ? "border-blue-300 bg-blue-50"
                                    : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                            }`}
                        >
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            {uploading ? (
                                <div>
                                    <div className="text-gray-900 font-medium mb-2">
                                        Uploaduję... {uploadProgress}%
                                    </div>
                                    <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${uploadProgress}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="text-gray-900 font-medium mb-2">
                                        Kliknij aby dodać zdjęcia
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Możesz wybrać wiele zdjęć na raz
                                    </div>
                                </div>
                            )}
                        </div>
                    </label>
                </div>

                {/* Photos Grid */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        Zdjęcia ({photos.length})
                    </h2>

                    {photos.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Upload className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p>Nie ma jeszcze żadnych zdjęć</p>
                            <p className="text-sm">
                                Użyj przycisku powyżej aby dodać pierwsze
                                zdjęcia
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {photos.map((photo) => (
                                <div
                                    key={photo.id}
                                    className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                                >
                                    <img
                                        src={photo.file_path}
                                        alt={photo.file_name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <div className="absolute inset-0 bg-black/40 bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <button
                                            onClick={() => {
                                                setPendingPhotoId(photo.id);
                                                setConfirmOpen(true);
                                            }}
                                            className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
        </div>
    );
}
