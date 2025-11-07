// components/dashboard/collections/CollectionGallerySection.tsx
import { Trash2, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import MainButton from "@/components/buttons/MainButton";
import PhotosGrid from "@/components/dashboard/PhotosGrid";
import type { Photo } from "./types";

interface CollectionGallerySectionProps {
    photos: Photo[];
    deletingAll?: boolean;
    onDeletePhoto: (photoId: number) => void;
    onDeleteAll: () => void;
}

export default function CollectionGallerySection({
    photos,
    deletingAll = false,
    onDeletePhoto,
    onDeleteAll,
}: CollectionGallerySectionProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-5 py-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-900">
                        Photo gallery ({photos.length})
                    </h2>
                    {photos.length > 0 && (
                        <MainButton
                            onClick={onDeleteAll}
                            loading={deletingAll}
                            disabled={deletingAll}
                            loadingText="Deleting..."
                            icon={<Trash2 size={15} />}
                            label={"Delete all"}
                            variant="danger"
                            className="text-xs md:text-sm"
                        />
                    )}
                </div>
            </div>
            <div className="p-5">
                {photos.length > 0 ? (
                    <PhotosGrid photos={photos} onDeletePhoto={onDeletePhoto} />
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="text-center py-16"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{
                                delay: 0.1,
                                duration: 0.3,
                                ease: "easeOut",
                            }}
                            className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-2xl mb-4"
                        >
                            <ImageIcon className="w-8 h-8 text-gray-300" />
                        </motion.div>
                        <motion.h3
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                            className="text-lg font-medium text-gray-900 mb-2"
                        >
                            No photos yet
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                            className="text-sm text-gray-500"
                        >
                            Upload photos to start building your gallery
                        </motion.p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
