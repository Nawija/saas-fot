// app/dashboard/collections/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
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

    // Liked photos state: fetch like counts for photos and show those with > 0 likes
    const [likedPhotos, setLikedPhotos] = useState<
        ((typeof photos)[number] & { likeCount: number })[]
    >([]);
    const [likedLoading, setLikedLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        async function fetchLikedForCollection() {
            if (!collectionId) {
                setLikedPhotos([]);
                return;
            }

            setLikedLoading(true);
            try {
                const res = await fetch(
                    `/api/collections/${collectionId}/liked-photos`
                );
                if (!res.ok) {
                    setLikedPhotos([]);
                    return;
                }
                const data = await res.json();
                if (!mounted) return;
                const list = data.photos || [];
                setLikedPhotos(list);
            } catch (err) {
                console.error("Error fetching liked photos:", err);
                if (mounted) setLikedPhotos([]);
            } finally {
                if (mounted) setLikedLoading(false);
            }
        }

        fetchLikedForCollection();

        return () => {
            mounted = false;
        };
    }, [photos]);

    const [uploadedCount, setUploadedCount] = useState(0);
    const [totalUploadCount, setTotalUploadCount] = useState(0);

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

    async function handleSaveHeroImage(file: File) {
        const success = await saveHeroImage(file);
        if (success) {
            setHeroImageEditModalOpen(false);
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
                    {/* Left Sidebar */}
                    <CollectionSidebar
                        collection={collection}
                        photos={photos}
                        templateLabel={currentTemplate?.label || "Minimal"}
                        galleryUrl={galleryUrl}
                        onEditTemplate={() => setHeroModalOpen(true)}
                        onEditImage={() => setHeroImageEditModalOpen(true)}
                        onEditSettings={() => setSettingsModalOpen(true)}
                        onDownloadAll={downloadAllPhotos}
                    />

                    {/* Right Content - Upload & Gallery */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                        {/* Copy Gallery Link */}
                        <div className="mb-6">
                            <CopyLinkButton
                                url={galleryUrl}
                                showUrl={true}
                                label="Copy"
                                variant="default"
                            />
                        </div>

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

                        {/* Liked Photos (polubione zdjęcia) */}
                        {likedLoading ? (
                            <div className="bg-white rounded-2xl border border-gray-200 p-4">
                                <div className="text-sm text-gray-600">
                                    Ładowanie polubionych zdjęć...
                                </div>
                            </div>
                        ) : likedPhotos.length > 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-200 p-4">
                                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                                    Polubione zdjęcia
                                </h3>
                                <div className="flex gap-3 overflow-x-auto">
                                    {likedPhotos.map((p) => (
                                        <div
                                            key={p.id}
                                            className="w-28 shrink-0"
                                        >
                                            <img
                                                src={p.file_path}
                                                alt={p.file_name}
                                                className="w-full h-20 object-cover rounded-md"
                                            />
                                            <div className="text-xs text-gray-500 mt-1">
                                                {p.likeCount}{" "}
                                                {p.likeCount === 1
                                                    ? "polubienie"
                                                    : "polubień"}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-200 p-4">
                                <div className="text-sm text-gray-600">
                                    Brak polubionych zdjęć.
                                </div>
                            </div>
                        )}

                        {/* Upload Errors */}
                        <UploadErrorsList
                            errors={uploadErrors}
                            onClose={() => setUploadErrors([])}
                        />

                        {/* Gallery Section */}
                        <CollectionGallerySection
                            photos={photos}
                            deletingAll={deletingAll}
                            onDeletePhoto={handleDeletePhotoClick}
                            onDeleteAll={() => setConfirmDeleteAllOpen(true)}
                        />
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
