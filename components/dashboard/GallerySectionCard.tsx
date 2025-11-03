import { Trash2 } from "lucide-react";
import MainButton from "@/components/buttons/MainButton";
import PhotosGrid from "@/components/dashboard/PhotosGrid";

interface Photo {
    id: number;
    file_path: string;
    file_name: string;
    file_size: number;
    width?: number;
    height?: number;
    created_at: string;
}

interface GallerySectionCardProps {
    photos: Photo[];
    onDeletePhoto: (photoId: number) => void;
    onDeleteAll: () => void;
}

export default function GallerySectionCard({
    photos,
    onDeletePhoto,
    onDeleteAll,
}: GallerySectionCardProps) {
    if (photos.length === 0) {
        return (
            <div className="bg-white border border-gray-200 overflow-hidden">
                <div className="p-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 mb-6">
                        <Trash2 className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-light text-gray-900 mb-2">
                        No photos yet
                    </h3>
                    <p className="text-sm text-gray-400 font-light">
                        Upload your first photos to get started
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-light text-gray-900 tracking-tight">
                            Gallery
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {photos.length}{" "}
                            {photos.length === 1 ? "photo" : "photos"}
                        </p>
                    </div>
                    <MainButton
                        onClick={onDeleteAll}
                        icon={<Trash2 className="w-4 h-4" />}
                        label="Delete All"
                        variant="danger"
                    />
                </div>
            </div>
            <div className="p-6">
                <PhotosGrid photos={photos} onDeletePhoto={onDeletePhoto} />
            </div>
        </div>
    );
}
