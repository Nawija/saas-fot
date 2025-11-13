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
    currentTitle?: string;
    currentDescription?: string;
    // file may be null if user only edits title/description
    onSave: (
        file?: File | null,
        title?: string,
        description?: string
    ) => Promise<void>;
    saving: boolean;
}

export default function HeroImageEditModal({
    open,
    onClose,
    currentHeroImage,
    currentTitle,
    currentDescription,
    onSave,
    saving,
}: HeroImageEditModalProps) {
    const [heroFile, setHeroFile] = useState<File | null>(null);
    const [title, setTitle] = useState<string>(currentTitle || "");
    const [description, setDescription] = useState<string>(
        currentDescription || ""
    );

    const handleSave = async () => {
        // allow saving title/description even if image was not changed
        await onSave(heroFile, title, description);
        // Zamknij modal - rodzic odświeży widok
        onClose();
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
                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring focus:ring-blue-400 transition-colors duration-150"
                            aria-label="Close editor (Esc)"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </AlertDialogHeader>

                <div className="py-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <HeroImageEditor
                        onImageReady={setHeroFile}
                        initialImage={currentHeroImage}
                    />
                    <div className="mt-4 xl:mt-0 space-y-3">
                        <div>
                            <label className="block text-sm font-medium">
                                Title
                            </label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring focus:ring-blue-400"
                                placeholder="Collection title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="mt-1 block w-full min-h-36 rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring focus:ring-blue-400"
                                rows={3}
                                placeholder="Short description"
                            />
                        </div>
                    </div>
                </div>
                <AlertDialogFooter>
                    <MainButton
                        onClick={handleSave}
                        label="Save changes"
                        variant="primary"
                        loading={saving}
                        disabled={
                            saving ||
                            (!heroFile &&
                                title === (currentTitle || "") &&
                                description === (currentDescription || ""))
                        }
                    />
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
