// app/dashboard/collections/[id]/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import Loading from "@/components/ui/Loading";
import CollectionHeader from "@/components/dashboard/CollectionHeader";
import PhotoUploadSection from "@/components/dashboard/PhotoUploadSection";
import { HERO_TEMPLATES } from "@/components/dashboard/hero-templates/registry";
import HeroPreviewModal from "@/components/dashboard/HeroPreviewModal";
import CollectionSettingsModal from "@/components/dashboard/CollectionSettingsModal";
import HeroImageEditModal from "@/components/dashboard/HeroImageEditModal";
import CopyLinkButton from "@/components/buttons/CopyLinkButton";
import UpgradeDialog from "@/components/ui/UpgradeDialog";
import FloatingUploadButton from "@/components/dashboard/FloatingUploadButton";
import {
    CollectionSidebar,
    CollectionGallerySection,
    UploadErrorsList,
    useCollectionData,
    usePhotoUpload,
    useHeroSettings,
    useCollectionSettings,
} from "@/components/dashboard/collections";
import { Heart, Image, Download } from "lucide-react";
import MainButton from "@/components/buttons/MainButton";
import { toast } from "sonner";
import EmptyState from "@/components/dashboard/EmptyState";
import { getThumbnailUrl } from "@/lib/utils/getThumbnailUrl";

export default function CollectionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [collectionId, setCollectionId] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<string>("minimal");
    const [selectedFont, setSelectedFont] = useState<string>("inter");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingPhotoId, setPendingPhotoId] = useState<number | null>(null);
    const [confirmDeleteAllOpen, setConfirmDeleteAllOpen] = useState(false);
    const [heroModalOpen, setHeroModalOpen] = useState(false);
    const [heroImageEditModalOpen, setHeroImageEditModalOpen] = useState(false);
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [origin, setOrigin] = useState("");
    const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
    const [upgradeContext, setUpgradeContext] = useState({
        title: "Feature available on higher plans",
        description: "",
        feature: "",
    });

    const {
        collection,
        photos,
        loading,
        deletingAll,
        userPlan,
        username,
        setCollection,
        fetchCollection,
        fetchPhotos,
        deletePhoto,
        deleteAllPhotos,
        downloadAllPhotos,
    } = useCollectionData(collectionId);

    const {
        uploading,
        uploadProgress,
        uploadErrors,
        setUploadErrors,
        uploadPhotos,
    } = usePhotoUpload(collectionId);

    // Liked photos state (paginated)
    const [likedPhotos, setLikedPhotos] = useState<
        ((typeof photos)[number] & { likeCount?: number })[]
    >([]);
    const [likedLoading, setLikedLoading] = useState(false);
    const [likedPage, setLikedPage] = useState(1);
    const LIKED_PAGE_SIZE = 50;
    const [likedTotal, setLikedTotal] = useState(0);
    const [likedLoadingMore, setLikedLoadingMore] = useState(false);

    const fetchLikedPageNow = async (page = likedPage, append = false) => {
        if (!collectionId) {
            setLikedPhotos([]);
            setLikedTotal(0);
            return;
        }

        // when appending, set a separate loading-more flag
        if (append) setLikedLoadingMore(true);
        else setLikedLoading(true);

        try {
            const res = await fetch(
                `/api/collections/${collectionId}/liked-photos`,
                { credentials: "same-origin" }
            );
            if (!res.ok) {
                if (!append) {
                    setLikedPhotos([]);
                    setLikedTotal(0);
                }
                return;
            }
            const data = await res.json();
            if (append) {
                setLikedPhotos((prev) => [...prev, ...(data.photos || [])]);
            } else {
                setLikedPhotos(data.photos || []);
            }
            setLikedTotal(data.total || 0);
        } catch (err) {
            console.error("Error fetching liked photos:", err);
            if (!append) {
                setLikedPhotos([]);
                setLikedTotal(0);
            }
        } finally {
            if (append) setLikedLoadingMore(false);
            else setLikedLoading(false);
        }
    };

    // initial load for liked photos (replace)
    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!mounted) return;
            await fetchLikedPageNow(1, false);
            setLikedPage(1);
        })();
        return () => {
            mounted = false;
        };
    }, [collectionId]);

    // infinite horizontal scroll: append pages when sentinel visible
    const likedScrollerRef = useRef<HTMLDivElement | null>(null);
    const likedSentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const scroller = likedScrollerRef.current;
        const sentinel = likedSentinelRef.current;
        if (!scroller || !sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (
                        entry.isIntersecting &&
                        !likedLoadingMore &&
                        !likedLoading
                    ) {
                        const currentTotalPages = Math.max(
                            1,
                            Math.ceil(likedTotal / LIKED_PAGE_SIZE)
                        );
                        if (likedPage < currentTotalPages) {
                            const next = likedPage + 1;
                            setLikedPage(next);
                            fetchLikedPageNow(next, true);
                        }
                    }
                });
            },
            { root: scroller, rootMargin: "200px", threshold: 0.1 }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [
        likedScrollerRef.current,
        likedSentinelRef.current,
        likedLoadingMore,
        likedLoading,
        likedPage,
        likedTotal,
    ]);

    const [uploadedCount, setUploadedCount] = useState(0);
    const [totalUploadCount, setTotalUploadCount] = useState(0);

    // Lazy thumbnail component: only sets img src when the thumbnail enters the viewport
    function LazyThumb({ photo }: { photo: any }) {
        const imgRef = useRef<HTMLImageElement | null>(null);
        const [src, setSrc] = useState<string | undefined>(undefined);

        useEffect(() => {
            const el = imgRef.current;
            if (!el) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setSrc(getThumbnailUrl(photo.file_path));
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { root: null, rootMargin: "200px", threshold: 0.01 }
            );

            observer.observe(el);
            return () => observer.disconnect();
        }, [photo.file_path]);

        return (
            <img
                ref={imgRef}
                src={src}
                alt={photo.file_name}
                loading="lazy"
                decoding="async"
                className="w-full h-44 object-cover rounded-md"
            />
        );
    }

    // Gallery pagination
    const [galleryPage, setGalleryPage] = useState(1);
    const GALLERY_PAGE_SIZE = 20;
    const [galleryPhotos, setGalleryPhotos] = useState<typeof photos>([]);
    const [galleryTotal, setGalleryTotal] = useState(0);
    const fetchGalleryPageNow = async (page = galleryPage) => {
        if (!collectionId) {
            setGalleryPhotos([]);
            setGalleryTotal(0);
            return;
        }
        try {
            const res = await fetch(
                `/api/collections/${collectionId}/photos?page=${page}&pageSize=${GALLERY_PAGE_SIZE}`
            );
            if (!res.ok) {
                setGalleryPhotos([]);
                setGalleryTotal(0);
                return;
            }
            const data = await res.json();
            setGalleryPhotos(data.photos || []);
            setGalleryTotal(data.total || 0);
        } catch (err) {
            console.error("Error fetching gallery page:", err);
            setGalleryPhotos([]);
            setGalleryTotal(0);
        }
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!mounted) return;
            await fetchGalleryPageNow(galleryPage);
        })();
        return () => {
            mounted = false;
        };
    }, [collectionId, galleryPage]);

    const { saving, savingHeroImage, updateHeroSettings, saveHeroImage } =
        useHeroSettings(
            collectionId,
            collection,
            setCollection,
            (context: {
                title: string;
                description: string;
                feature: string;
            }) => {
                setUpgradeContext(context);
                setUpgradeDialogOpen(true);
                setHeroModalOpen(false);
            }
        );

    const { savingSettings, saveSettings } = useCollectionSettings(
        collectionId,
        setCollection
    );

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
        if (!collection) return;
        if (collection.hero_template) {
            setSelectedTemplate(collection.hero_template);
        }
        if (collection.hero_font) {
            setSelectedFont(collection.hero_font);
        }
    }, [collection]);

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

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setTotalUploadCount(files.length);
        setUploadedCount(0);

        await uploadPhotos(files, async () => {
            await fetchPhotos();
            await fetchCollection();
            setUploadedCount(files.length);
        });

        // Refresh paginated gallery and liked lists explicitly
        await fetchGalleryPageNow(1);
        setGalleryPage(1);
        await fetchLikedPageNow(1);
        setLikedPage(1);
    }

    async function handleDrop(files: FileList) {
        if (files.length === 0) return;

        setTotalUploadCount(files.length);
        setUploadedCount(0);

        await uploadPhotos(files, async () => {
            await fetchPhotos();
            await fetchCollection();
            setUploadedCount(files.length);
        });

        // Refresh paginated gallery and liked lists explicitly
        await fetchGalleryPageNow(1);
        setGalleryPage(1);
        await fetchLikedPageNow(1);
        setLikedPage(1);
    }

    async function downloadLikedPhotos() {
        if (!collectionId || likedTotal === 0) return;

        try {
            toast.info("Przygotowuję pobieranie polubionych zdjęć...");

            const response = await fetch(
                `/api/collections/${collectionId}/download-liked-zip`,
                { credentials: "same-origin" }
            );

            if (!response.ok) {
                throw new Error("Failed to download");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${collection?.slug || "photos"}-liked.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Pobieranie uruchomione!");
        } catch (error) {
            console.error("Error downloading liked photos:", error);
            toast.error("Błąd podczas pobierania polubionych zdjęć");
        }
    }

    function handleDeletePhotoClick(photoId: number) {
        setPendingPhotoId(photoId);
        setConfirmOpen(true);
    }

    async function handleSaveSettings(isPublic: boolean, password?: string) {
        const success = await saveSettings(isPublic, password);
        if (success) {
            setSettingsModalOpen(false);
        }
    }

    async function handleSaveHeroImage(
        file?: File | null,
        title?: string,
        description?: string
    ) {
        // If an image file was provided, upload it first
        if (file) {
            const success = await saveHeroImage(file);
            if (!success) {
                return;
            }
        }

        // If title/description provided, update the collection
        try {
            if (
                collectionId &&
                (typeof title !== "undefined" ||
                    typeof description !== "undefined")
            ) {
                const body: any = {};
                if (typeof title !== "undefined") body.name = title;
                if (typeof description !== "undefined")
                    body.description = description;

                // Only call API if something to update
                if (Object.keys(body).length > 0) {
                    const res = await fetch(
                        `/api/collections/${collectionId}`,
                        {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(body),
                        }
                    );

                    if (res.ok) {
                        const result = await res.json();
                        setCollection(result.collection);
                        toast.success("Collection updated");
                    } else {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(
                            err?.error || "Failed to update collection"
                        );
                    }
                }
            }

            // Close modal after successful operations
            setHeroImageEditModalOpen(false);
        } catch (err: any) {
            console.error("Error saving hero image/title/description:", err);
            toast.error(err?.message || "Error saving collection data");
        }
    }

    async function handleUpdateHeroSettings(tpl: string, font: string) {
        const success = await updateHeroSettings(tpl, font);
        if (success) {
            setSelectedTemplate(tpl);
            setSelectedFont(font);
            setHeroModalOpen(false);
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

    const galleryUrl = username
        ? `https://${username}.seovileo.pl/g/${collection.slug}`
        : `${origin}/g/${collection.slug}`;

    return (
        <div className="min-h-screen pb-24 lg:pb-32">
            {/* Top Bar */}
            <div className="bg-white/70 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
                    <CollectionHeader collection={collection} photos={photos} />
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1500px] mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                    {/* Left Sidebar */}
                    <CollectionSidebar
                        collection={collection}
                        photos={photos}
                        likedPhotos={likedPhotos}
                        templateLabel={currentTemplate?.label || "Minimal"}
                        galleryUrl={galleryUrl}
                        onEditTemplate={() => setHeroModalOpen(true)}
                        onEditImage={() => setHeroImageEditModalOpen(true)}
                        onEditSettings={() => setSettingsModalOpen(true)}
                        onDownloadAll={downloadAllPhotos}
                    />

                    {/* Right Content - Upload & Gallery */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                        <CopyLinkButton
                            url={galleryUrl}
                            showUrl={true}
                            label="Copy"
                            variant="default"
                        />

                        {/* Upload Section - Desktop Only */}
                        <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden">
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

                        <Accordion
                            type="single"
                            collapsible
                            defaultValue="gallery"
                            className="space-y-6"
                        >
                            <AccordionItem
                                value="liked"
                                className="bg-white rounded-2xl border border-gray-200 px-6 last:border-b"
                            >
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        <Heart size={20} className="fill-red-500 text-red-500" />
                                        Polubione zdjęcia ({likedPhotos.length})
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="mb-6 flex justify-end">
                                        <MainButton
                                            onClick={async () =>
                                                await downloadLikedPhotos()
                                            }
                                            label="Pobierz polubione"
                                            icon={<Download size={14} />}
                                            disabled={
                                                likedTotal === 0 || likedLoading
                                            }
                                        />
                                    </div>
                                    {likedLoading ? (
                                        <div className="bg-white rounded-2xl border border-gray-200 p-4">
                                            <div className="text-sm text-gray-600">
                                                Ładowanie polubionych zdjęć...
                                            </div>
                                        </div>
                                    ) : likedPhotos.length > 0 ? (
                                        <>
                                            <div>
                                                <div
                                                    ref={likedScrollerRef}
                                                    className="flex gap-3 overflow-x-auto"
                                                >
                                                    {likedPhotos.map((p) => (
                                                        <div
                                                            key={p.id}
                                                            className="w-28 shrink-0 relative"
                                                        >
                                                            <LazyThumb
                                                                photo={p}
                                                            />
                                                            <div className="text-xs text-gray-500 p-1 flex items-center gap-1 absolute z-10 -top-0.5 -right-0.5 bg-white px-1 rounded-md">
                                                                {p.likeCount}
                                                                <Heart
                                                                    size={12}
                                                                    className="fill-red-500 text-red-500"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {/* sentinel for loading next page */}
                                                    <div
                                                        ref={likedSentinelRef}
                                                        className="w-2 shrink-0"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <EmptyState
                                            title="No liked photos"
                                            description="You haven't liked any photos yet."
                                        />
                                    )}
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem
                                value="gallery"
                                className="bg-white rounded-2xl border border-gray-200 px-6 last:border-b"
                            >
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        <Image size={20} />
                                        Photo Gallery (
                                        {collection?.photo_count ??
                                            photos.length}
                                        )
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <UploadErrorsList
                                        errors={uploadErrors}
                                        onClose={() => setUploadErrors([])}
                                    />

                                    <CollectionGallerySection
                                        photos={galleryPhotos}
                                        deletingAll={deletingAll}
                                        onDeletePhoto={handleDeletePhotoClick}
                                        onDeleteAll={() =>
                                            setConfirmDeleteAllOpen(true)
                                        }
                                        page={galleryPage}
                                        total={galleryTotal}
                                        pageSize={GALLERY_PAGE_SIZE}
                                        onPageChange={(p) => setGalleryPage(p)}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
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
                        await deletePhoto(pendingPhotoId);
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
                    await deleteAllPhotos();
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
                    handleUpdateHeroSettings(template, font)
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
                currentTitle={collection.name}
                currentDescription={collection.description}
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

            {/* Floating Upload Button */}
            <FloatingUploadButton
                uploading={uploading}
                uploadProgress={uploadProgress}
                onUpload={handleUpload}
                uploadedCount={uploadedCount}
                totalCount={totalUploadCount}
            />
        </div>
    );
}
