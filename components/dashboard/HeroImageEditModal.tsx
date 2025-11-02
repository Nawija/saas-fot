"use client";

import { useState } from "react";
import MainButton from "@/components/buttons/MainButton";
import HeroImageEditor from "./HeroImageEditor";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";

interface HeroImageEditModalProps {
    open: boolean;
    onClose: () => void;
    currentHeroImage?: string;
    onSave: (file: File) => Promise<void>;
    saving: boolean;
}

export default function HeroImageEditModal({
    open,
    onClose,
    currentHeroImage,
    onSave,
    saving,
}: HeroImageEditModalProps) {
    const [heroFile, setHeroFile] = useState<File | null>(null);

    const handleSave = async () => {
        if (heroFile) {
            await onSave(heroFile);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-start justify-center flex-col">
                            <AlertDialogTitle>Edit image</AlertDialogTitle>
                            <AlertDialogDescription>
                                Adjust position, zoom and rotation of the hero
                                image
                            </AlertDialogDescription>
                        </div>

                        <button
                            onClick={onClose}
                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
                            aria-label="Close editor (Esc)"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <MainButton
                        onClick={handleSave}
                        label="Save changes"
                        variant="primary"
                        loading={saving}
                        disabled={!heroFile}
                    />
                </AlertDialogFooter>

                <div className="py-4">
                    <HeroImageEditor
                        onImageReady={setHeroFile}
                        initialImage={currentHeroImage}
                    />
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
