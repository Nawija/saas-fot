// components/dashboard/collections/CollectionSidebar.tsx
import HeroTemplateCard from "./HeroTemplateCard";
import CollectionActions from "./CollectionActions";
import CollectionStats from "./CollectionStats";
import type { Collection, Photo } from "./types";

interface CollectionSidebarProps {
    collection: Collection;
    photos: Photo[];
    templateLabel: string;
    galleryUrl: string;
    onEditTemplate: () => void;
    onEditImage: () => void;
    onEditSettings: () => void;
    onDownloadAll: () => void;
}

export default function CollectionSidebar({
    collection,
    photos,
    templateLabel,
    galleryUrl,
    onEditTemplate,
    onEditImage,
    onEditSettings,
    onDownloadAll,
}: CollectionSidebarProps) {
    const totalSize = photos.reduce((sum, p) => sum + p.file_size, 0);

    return (
        <div className="lg:col-span-4 xl:col-span-3 space-y-6 lg:sticky lg:top-16 lg:self-start lg:overflow-y-auto lg:h-[85vh] lg:pr-3 scrollbar-hidden">
            {/* Hero Template Card */}
            <HeroTemplateCard
                heroImage={collection.hero_image}
                collectionName={collection.name}
                templateLabel={templateLabel}
                onEditImage={onEditImage}
                onEditTemplate={onEditTemplate}
            />

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-5">
                <CollectionActions
                    isPublic={collection.is_public}
                    photosCount={photos.length}
                    galleryUrl={galleryUrl}
                    onEditTemplate={onEditTemplate}
                    onEditImage={onEditImage}
                    onEditSettings={onEditSettings}
                    onDownloadAll={onDownloadAll}
                />
            </div>

            {/* Stats Card */}
            <CollectionStats
                photosCount={photos.length}
                totalSize={totalSize}
                createdAt={collection.created_at}
            />
        </div>
    );
}
