// app/dashboard/collections/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Loading from "@/components/ui/Loading";
import CollectionHeader from "@/components/dashboard/CollectionHeader";
import HeroTemplateCard from "@/components/dashboard/HeroTemplateCard";
import CollectionStatsCard from "@/components/dashboard/CollectionStatsCard";
import UploadSectionCard from "@/components/dashboard/UploadSectionCard";
import GallerySectionCard from "@/components/dashboard/GallerySectionCard";
import HeroSheetPanel, {
    ImageEditPanel,
    TemplatePanel,
    SettingsPanel,
} from "@/components/dashboard/HeroSheetPanel";
import { HERO_TEMPLATES } from "@/components/dashboard/hero-templates/registry";
import CopyLinkButton from "@/components/buttons/CopyLinkButton";
import UpgradeDialog from "@/components/ui/UpgradeDialog";
import { useCollectionDetail } from "@/hooks/useCollectionDetail";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + " " + sizes[i];
}

export default function CollectionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [collectionId, setCollectionId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>("minimal");
    const [selectedFont, setSelectedFont] = useState<string>("inter");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingPhotoId, setPendingPhotoId] = useState<number | null>(null);
    const [confirmDeleteAllOpen, setConfirmDeleteAllOpen] = useState(false);
    const [activePanel, setActivePanel] = useState<
        "image" | "template" | "settings" | null
    >(null);
    const [savingSettings, setSavingSettings] = useState(false);
    const [savingHeroImage, setSavingHeroImage] = useState(false);
    const [origin, setOrigin] = useState("");
    const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
    const [upgradeContext, setUpgradeContext] = useState({
        title: "Feature available on higher plans",
        description: "",
        feature: "",
    });

    const {
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
    } = useCollectionDetail(collectionId);

    const { uploading, uploadProgress, handleUpload, handleDrop } =
        usePhotoUpload(collectionId, async () => {
            await fetchPhotos();
            await fetchCollection();
        });

    useEffect(() => {
        if (typeof window !== "undefined") {
            setOrigin(window.location.origin);
        }
    }, []);

    useEffect(() => {
        params.then((p) => setCollectionId(p.id));
    }, [params]);

    useEffect(() => {
        if (collection?.hero_template) {
            setSelectedTemplate(collection.hero_template);
        }
        if (collection?.hero_font) {
            setSelectedFont(collection.hero_font);
        }
    }, [collection]);

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
                    setUpgradeContext({
                        title: err?.error || "Template unavailable",
                        description:
                            err?.message ||
                            "This template requires a higher plan.",
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
            toast.success("Hero design saved");
            setActivePanel(null);
        } catch (e: any) {
            toast.error(e?.message || "Failed to save");
        } finally {
            setSaving(false);
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
            setActivePanel(null);
        } catch (error: any) {
            toast.error(error.message || "Error saving settings");
        } finally {
            setSavingSettings(false);
        }
    }

    async function handleSaveHeroImage(
        file: File,
        position: { x: number; y: number }
    ) {
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

            console.log("[Frontend] Sending position to API:", position);

            const updateRes = await fetch(`/api/collections/${collectionId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hero_image: url,
                    hero_image_mobile: urlMobile,
                    hero_image_position_x: position.x,
                    hero_image_position_y: position.y,
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
            setActivePanel(null);
        } catch (error) {
            toast.error("Error updating hero image");
        } finally {
            setSavingHeroImage(false);
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

    const galleryUrl = username
        ? `https://${username}.seovileo.pl/g/${collection.slug}`
        : `${origin}/g/${collection.slug}`;

    const totalSize = formatFileSize(
        photos.reduce((sum, p) => sum + p.file_size, 0)
    );

    const createdAt = new Date(collection.created_at).toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        }
    );

    return (
        <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
            {/* Top Bar */}
            <div className="bg-white/70 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="px-3 md:px-6 py-3 max-w-[1920px] mx-auto">
                    <CollectionHeader collection={collection} photos={photos} />
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1920px] mx-auto px-3 md:px-6 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Hero Preview - Sticky */}
                    <div className="lg:col-span-5 xl:col-span-3">
                        <div className="sticky top-24">
                            <HeroTemplateCard
                                currentTemplate={currentTemplate}
                                collectionName={collection.name}
                                collectionDescription={collection.description}
                                heroImage={collection.hero_image}
                                heroFont={collection.hero_font}
                                heroImagePositionX={
                                    collection.hero_image_position_x
                                }
                                heroImagePositionY={
                                    collection.hero_image_position_y
                                }
                                onEditImage={() => setActivePanel("image")}
                                onEditTemplate={() =>
                                    setActivePanel("template")
                                }
                                onViewGallery={() =>
                                    window.open(galleryUrl, "_blank")
                                }
                                onDownload={() =>
                                    downloadAllPhotos(collection.slug)
                                }
                                onSettings={() => setActivePanel("settings")}
                                isPublic={collection.is_public}
                                photosCount={photos.length}
                            />

                            {/* Stats Card */}
                            <div className="mt-6">
                                <CollectionStatsCard
                                    photosCount={photos.length}
                                    totalSize={totalSize}
                                    createdAt={createdAt}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="lg:col-span-7 xl:col-span-9 space-y-8">
                        {/* Copy Link */}
                        <div className="mb-4">
                            <CopyLinkButton
                                url={galleryUrl}
                                showUrl={true}
                                label="Copy Link"
                                variant="default"
                            />
                        </div>

                        {/* Upload Section */}
                        <UploadSectionCard
                            uploading={uploading}
                            uploadProgress={uploadProgress}
                            onUpload={handleUpload}
                            onDrop={handleDrop}
                        />

                        {/* Gallery Section */}
                        <GallerySectionCard
                            photos={photos}
                            onDeletePhoto={handleDeletePhotoClick}
                            onDeleteAll={() => setConfirmDeleteAllOpen(true)}
                        />
                    </div>
                </div>
            </div>

            {/* Sheet Panel */}
            <HeroSheetPanel
                activePanel={activePanel}
                onClose={() => setActivePanel(null)}
            >
                {activePanel === "image" && (
                    <ImageEditPanel
                        currentImage={collection.hero_image}
                        onSave={handleSaveHeroImage}
                        saving={savingHeroImage}
                    />
                )}

                {activePanel === "template" && (
                    <TemplatePanel
                        templates={HERO_TEMPLATES}
                        selectedTemplate={selectedTemplate}
                        savedTemplate={collection.hero_template || "minimal"}
                        selectedFont={selectedFont}
                        collectionName={collection.name}
                        collectionDescription={collection.description}
                        heroImage={collection.hero_image}
                        onSelectTemplate={setSelectedTemplate}
                        onSelectFont={setSelectedFont}
                        onSave={() =>
                            updateHeroSettings(selectedTemplate, selectedFont)
                        }
                        onReset={() => {
                            setSelectedTemplate(
                                collection.hero_template || "minimal"
                            );
                            setSelectedFont(collection.hero_font || "inter");
                        }}
                        saving={saving}
                    />
                )}

                {activePanel === "settings" && (
                    <SettingsPanel
                        isPublic={collection.is_public}
                        passwordPlain={collection.password_plain}
                        userPlan={userPlan}
                        onSave={handleSaveSettings}
                        saving={savingSettings}
                        onUpgradeRequired={() => {
                            setActivePanel(null);
                            setUpgradeContext({
                                title: "Password-protected gallery",
                                description:
                                    "Password protection requires a paid plan.",
                                feature: "Password protection",
                            });
                            setUpgradeDialogOpen(true);
                        }}
                    />
                )}
            </HeroSheetPanel>

            {/* Confirm Dialogs */}
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete this photo?"
                description="This action cannot be undone."
                confirmLabel="Delete"
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
                }. This action cannot be undone.`}
                confirmLabel="Delete All"
                cancelLabel="Cancel"
                onConfirm={async () => {
                    await deleteAllPhotos();
                    setConfirmDeleteAllOpen(false);
                }}
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
