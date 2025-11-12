// components/dashboard/collections/CollectionActions.tsx
import {
    Paintbrush,
    ImagePlus,
    Globe,
    Lock,
    Download,
    Eye,
} from "lucide-react";
import MainButton from "@/components/buttons/MainButton";

interface CollectionActionsProps {
    isPublic: boolean;
    photosCount: number;
    galleryUrl: string;
    onEditTemplate: () => void;
    onEditImage: () => void;
    onEditSettings: () => void;
    onDownloadAll: () => void;
}

export default function CollectionActions({
    isPublic,
    photosCount,
    galleryUrl,
    onEditTemplate,
    onEditImage,
    onEditSettings,
    onDownloadAll,
}: CollectionActionsProps) {
    return (
        <div className="grid grid-cols-5 gap-2">
            <MainButton
                onClick={onEditImage}
                icon={<ImagePlus size={22} />}
                variant="secondary"
            />
            <MainButton
                onClick={onEditTemplate}
                icon={<Paintbrush size={22} />}
                variant="secondary"
            />
            <MainButton
                onClick={onEditSettings}
                icon={isPublic ? <Globe size={22} /> : <Lock size={22} />}
                variant="secondary"
            />
            <MainButton
                onClick={onDownloadAll}
                icon={<Download size={22} />}
                variant="secondary"
                disabled={photosCount === 0}
            />
            <MainButton
                href={galleryUrl}
                target="_blank"
                icon={<Eye size={22} />}
                variant="secondary"
            />
        </div>
    );
}
