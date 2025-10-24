"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2, Loader2 } from "lucide-react";

interface ChangeAvatarProps {
    currentAvatar?: string | null;
}

export default function ChangeAvatar({ currentAvatar }: ChangeAvatarProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");

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

        const confirmed = confirm("Czy na pewno chcesz usunąć avatar?");
        if (!confirmed) return;

        setIsDeleting(true);

        try {
            const res = await fetch("/api/user/avatar", {
                method: "DELETE",
            });

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
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isDeleting}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    {isUploading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Przesyłanie...</span>
                        </>
                    ) : (
                        <>
                            <Upload size={16} />
                            <span>Zmień avatar</span>
                        </>
                    )}
                </button>

                {currentAvatar && (
                    <button
                        onClick={handleDelete}
                        disabled={isUploading || isDeleting}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Usuwanie...</span>
                            </>
                        ) : (
                            <>
                                <Trash2 size={16} />
                                <span>Usuń</span>
                            </>
                        )}
                    </button>
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
                Dozwolone formaty: JPG, PNG, WEBP, GIF. Maksymalny rozmiar: 5MB
            </p>
        </div>
    );
}
