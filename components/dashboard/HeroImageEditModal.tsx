"use client";

import { useState, useEffect } from "react";
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
                    <AlertDialogTitle>Edit hero image</AlertDialogTitle>
                    <AlertDialogDescription>
                        Adjust position, zoom and rotation of the hero image
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4">
                    <HeroImageEditor
                        onImageReady={setHeroFile}
                        initialImage={currentHeroImage}
                    />
                </div>

                <AlertDialogFooter>
                    <MainButton
                        onClick={onClose}
                        label="Cancel"
                        variant="secondary"
                        disabled={saving}
                    />
                    <MainButton
                        onClick={handleSave}
                        label="Save changes"
                        variant="primary"
                        loading={saving}
                        disabled={!heroFile}
                    />
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
