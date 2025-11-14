// components/dashboard/collections/CollectionActions.tsx
import { Paintbrush, Globe, Lock, Download, Eye, Edit } from "lucide-react";
import MainButton from "@/components/buttons/MainButton";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";

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
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="inline-block">
                        <MainButton
                            onClick={onEditImage}
                            icon={<Edit size={22} />}
                            variant="secondary"
                        />
                    </div>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>Edytuj</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="inline-block">
                        <MainButton
                            onClick={onEditTemplate}
                            icon={<Paintbrush size={22} />}
                            variant="secondary"
                        />
                    </div>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>Szablony</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="inline-block">
                        <MainButton
                            onClick={onEditSettings}
                            icon={
                                isPublic ? (
                                    <Globe size={22} />
                                ) : (
                                    <Lock size={22} />
                                )
                            }
                            variant="secondary"
                        />
                    </div>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>
                    {isPublic ? "Publiczna" : "Prywatna"}
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="inline-block">
                        <MainButton
                            onClick={onDownloadAll}
                            icon={<Download size={22} />}
                            variant="secondary"
                            disabled={photosCount === 0}
                        />
                    </div>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>Pobierz wszystko</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="inline-block">
                        <MainButton
                            href={galleryUrl}
                            target="_blank"
                            icon={<Eye size={22} />}
                            variant="secondary"
                        />
                    </div>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>Zobacz galerię</TooltipContent>
            </Tooltip>
        </div>
    );
}
