"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import MainButton from "./MainButton";

interface ChangeAvatarProps {
    currentAvatar?: string | null;
}

export default function ChangeAvatar({ currentAvatar }: ChangeAvatarProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleFileSelect = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Walidacja rozmiaru
        if (file.size > 5 * 1024 * 1024) {
            setError("Plik jest za duży. Maksymalny rozmiar to 5MB");
            return;
        }

        // Walidacja typu
        if (!file.type.startsWith("image/")) {
            setError("Dozwolone są tylko pliki graficzne");
            return;
        }

        setError("");
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("avatar", file);

            const res = await fetch("/api/user/avatar", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                router.refresh();
            } else {
                if (res.status === 413 && data.upgradeRequired) {
                    toast.error("Brak miejsca", {
                        description:
                            data.message ||
                            "Przekroczono limit storage. Przekierowuję do zakupu rozszerzenia...",
                    });
                    router.push("/dashboard/billing");
                    return;
                }
                setError(data.error || "Błąd przesyłania");
            }
        } catch (error) {
            console.error("Upload error:", error);
            setError("Wystąpił błąd. Spróbuj ponownie.");
        } finally {
            setIsUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleDelete = async () => {
        if (!currentAvatar) return;
        setIsDeleting(true);
        try {
            const res = await fetch("/api/user/avatar", { method: "DELETE" });
            const data = await res.json();
            if (res.ok) {
                router.refresh();
            } else {
                setError(data.error || "Błąd usuwania");
            }
        } catch (error) {
            console.error("Delete error:", error);
            setError("Wystąpił błąd. Spróbuj ponownie.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <MainButton
                        icon={<Upload size={16} />}
                        onClick={() => fileInputRef.current?.click()}
                        loading={isUploading}
                        loadingText="Przesyłanie..."
                        label="Zmień avatar"
                    />

                    {currentAvatar && (
                        <MainButton
                            icon={<Trash2 size={16} />}
                            onClick={() => setConfirmOpen(true)}
                            loading={isDeleting}
                            loadingText="Usuwanie..."
                            variant="danger"
                            label="Usuń"
                        />
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <p className="text-xs text-gray-500">
                    Dozwolone formaty: JPG, PNG, WEBP, GIF. Maksymalny rozmiar:
                    5MB
                </p>
            </div>
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Czy na pewno chcesz usunąć avatar?"
                description="Tej operacji nie można cofnąć."
                confirmLabel="Usuń avatar"
                cancelLabel="Anuluj"
                onConfirm={handleDelete}
            />
        </>
    );
}
