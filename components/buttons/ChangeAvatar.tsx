"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import MainButton from "./MainButton";
import AvatarEditor from "@/components/dashboard/AvatarEditor";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface ChangeAvatarProps {
    currentAvatar?: string | null;
}

export default function ChangeAvatar({ currentAvatar }: ChangeAvatarProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [editorOpen, setEditorOpen] = useState(false);
    const [processedFile, setProcessedFile] = useState<File | null>(null);
    const [tempImageUrl, setTempImageUrl] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File is too large. Max size: 5MB");
            return;
        }

        // Store the original file and create preview URL
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setTempImageUrl(reader.result as string);
            setEditorOpen(true);
        };
        reader.readAsDataURL(file);
    };

    const handleChangeAvatar = () => {
        fileInputRef.current?.click();
    };

    const handleImageReady = (file: File) => {
        setProcessedFile(file);
    };

    const handleUpload = async () => {
        if (!processedFile) {
            toast.error("No image selected");
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("avatar", processedFile);

            const res = await fetch("/api/user/avatar", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Avatar updated successfully");
                setEditorOpen(false);
                setProcessedFile(null);
                setTempImageUrl("");
                router.refresh();
            } else {
                if (res.status === 413 && data.upgradeRequired) {
                    toast.error("Out of space", {
                        description:
                            data.message ||
                            "Storage limit exceeded. Redirecting to upgrade...",
                    });
                    router.push("/dashboard/billing");
                    return;
                }
                toast.error(data.error || "Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!currentAvatar) return;
        setIsDeleting(true);
        try {
            const res = await fetch("/api/user/avatar", { method: "DELETE" });
            const data = await res.json();
            if (res.ok) {
                toast.success("Avatar deleted");
                router.refresh();
            } else {
                toast.error(data.error || "Delete failed");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
            />

            <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                    <MainButton
                        icon={<Upload size={16} />}
                        onClick={handleChangeAvatar}
                        loading={isUploading}
                        loadingText="Uploading..."
                        label="Change avatar"
                        className="w-full sm:w-max"
                    />

                    {currentAvatar && (
                        <MainButton
                            icon={<Trash2 size={16} />}
                            onClick={() => setConfirmOpen(true)}
                            loading={isDeleting}
                            loadingText="Deleting..."
                            variant="danger"
                            label="Delete"
                            className="w-full sm:w-max"
                        />
                    )}
                </div>

                <p className="text-xs text-gray-500">
                    Allowed formats: JPG, PNG, WEBP, GIF. Max size: 5MB
                </p>
            </div>

            {/* Avatar Editor Dialog */}
            <AlertDialog
                open={editorOpen}
                onOpenChange={(open) => {
                    setEditorOpen(open);
                    if (!open) {
                        setTempImageUrl("");
                        setProcessedFile(null);
                        setSelectedFile(null);
                    }
                }}
            >
                <AlertDialogContent className="max-w-md sm:max-w-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-center">
                            Edit Profile Photo
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            Position and size your photo
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AvatarEditor
                        onImageReady={handleImageReady}
                        initialImage={
                            tempImageUrl || currentAvatar || undefined
                        }
                        initialFile={selectedFile || undefined}
                    />

                    <AlertDialogFooter className="sm:justify-center gap-2">
                        <AlertDialogCancel
                            onClick={() => {
                                setEditorOpen(false);
                                setProcessedFile(null);
                                setTempImageUrl("");
                                setSelectedFile(null);
                            }}
                            className="sm:flex-1"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleUpload}
                            disabled={!processedFile || isUploading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed sm:flex-1"
                        >
                            {isUploading ? "Uploading..." : "Save Photo"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete avatar?"
                description="This action cannot be undone."
                confirmLabel="Delete avatar"
                cancelLabel="Cancel"
                onConfirm={handleDelete}
            />
        </>
    );
}
