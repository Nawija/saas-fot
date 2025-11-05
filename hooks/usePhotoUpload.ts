// hooks/usePhotoUpload.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { UploadError } from "@/components/dashboard/collections/types";

export function usePhotoUpload(collectionId: string | null) {
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadErrors, setUploadErrors] = useState<UploadError[]>([]);

    async function compressIfNeeded(file: File): Promise<File> {
        const fileSizeMB = file.size / 1024 / 1024;

        if (file.size <= 1 * 1024 * 1024) {
            console.log(
                `✅ ${file.name}: ${fileSizeMB.toFixed(2)}MB - OK (small)`
            );
            return file;
        }

        console.log(
            `🔄 Compressing ${file.name}: ${fileSizeMB.toFixed(2)}MB...`
        );

        try {
            console.log(`[COMPRESS] Loading browser-image-compression...`);
            const imageCompression = (await import("browser-image-compression"))
                .default;
            console.log(`[COMPRESS] Loaded! Starting compression...`);

            const options = {
                maxSizeMB: 1.5,
                maxWidthOrHeight: 2048,
                useWebWorker: false,
                initialQuality: 0.6,
                alwaysKeepResolution: false,
            };

            console.log(`[COMPRESS] Options:`, options);
            const compressed = await imageCompression(file, options);
            console.log(`[COMPRESS] Compression complete!`);
            const compressedSizeMB = compressed.size / 1024 / 1024;
            const reduction = (
                (1 - compressedSizeMB / fileSizeMB) *
                100
            ).toFixed(0);

            console.log(
                `✅ ${file.name}: ${fileSizeMB.toFixed(
                    2
                )}MB → ${compressedSizeMB.toFixed(2)}MB (-${reduction}%)`
            );

            if (compressed.size > 3 * 1024 * 1024) {
                throw new Error(
                    `Still too large after compression: ${compressedSizeMB.toFixed(
                        2
                    )}MB`
                );
            }

            return compressed;
        } catch (error) {
            console.error("❌ Compression failed:", error);
            toast.error(`Compression failed for ${file.name}`, {
                id: `compress-${file.name}`,
                description: "File may be too large to upload.",
            });

            throw new Error(
                `File ${file.name} is too large (${fileSizeMB.toFixed(
                    1
                )}MB) and compression failed`
            );
        }
    }

    async function uploadPhotos(
        files: FileList,
        onSuccess: () => Promise<void>
    ) {
        if (!collectionId) return;

        setUploading(true);
        setUploadProgress(0);
        setUploadErrors([]);

        const fileArray = Array.from(files);
        const totalFiles = fileArray.length;
        let uploaded = 0;
        let quotaErrorRedirected = false;
        const errors: UploadError[] = [];
        const uploadedPhotos: Array<{
            file_name: string;
            file_path: string;
            file_size: number;
            width: number;
            height: number;
        }> = [];

        const uploadSingle = async (file: File) => {
            const originalSizeMB = file.size / 1024 / 1024;
            const originalSizeFormatted = `${originalSizeMB.toFixed(2)} MB`;
            console.log(
                `[UPLOAD] Original: ${file.name} - ${originalSizeFormatted}`
            );

            try {
                const fileToUpload = await compressIfNeeded(file);
                const compressedSizeMB = fileToUpload.size / 1024 / 1024;
                const compressedSizeFormatted = `${compressedSizeMB.toFixed(
                    2
                )} MB`;

                console.log(
                    `[UPLOAD] Compressed: ${fileToUpload.name} - ${compressedSizeFormatted}`
                );

                if (fileToUpload.size > 4 * 1024 * 1024) {
                    errors.push({
                        fileName: file.name,
                        originalSize: originalSizeFormatted,
                        compressedSize: compressedSizeFormatted,
                        reason: `Plik za duży nawet po kompresji. Maksymalny rozmiar: 4 MB.`,
                    });
                    throw new Error(
                        `File too large: ${compressedSizeFormatted}`
                    );
                }

                const formData = new FormData();
                formData.append("file", fileToUpload);
                formData.append("type", "photo");
                formData.append("collectionId", collectionId);

                const uploadRes = await fetch("/api/collections/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) {
                    let errorData: any = {};
                    try {
                        errorData = await uploadRes.json();
                    } catch {}

                    if (uploadRes.status === 413) {
                        if (errorData?.upgradeRequired || errorData?.message) {
                            if (!quotaErrorRedirected) {
                                quotaErrorRedirected = true;
                                toast.error("Out of space", {
                                    description:
                                        errorData.message ||
                                        "Storage limit exceeded. Redirecting to upgrade...",
                                });
                                router.push("/dashboard/billing");
                            }
                            errors.push({
                                fileName: file.name,
                                originalSize: originalSizeFormatted,
                                compressedSize: compressedSizeFormatted,
                                reason: "Przekroczono limit miejsca na dysku.",
                            });
                        } else {
                            errors.push({
                                fileName: file.name,
                                originalSize: originalSizeFormatted,
                                compressedSize: compressedSizeFormatted,
                                reason: "Plik za duży (błąd 413 z serwera).",
                            });
                        }
                        throw new Error("Upload failed: 413");
                    }

                    errors.push({
                        fileName: file.name,
                        originalSize: originalSizeFormatted,
                        compressedSize: compressedSizeFormatted,
                        reason: `Błąd serwera (${uploadRes.status}).`,
                    });
                    throw new Error(`Failed to upload ${file.name}`);
                }

                const { url, size, width, height } = await uploadRes.json();

                uploadedPhotos.push({
                    file_name: file.name,
                    file_path: url,
                    file_size: size,
                    width,
                    height,
                });

                uploaded++;
                setUploadProgress(Math.round((uploaded / totalFiles) * 100));
            } catch (err: any) {
                if (!errors.some((e) => e.fileName === file.name)) {
                    errors.push({
                        fileName: file.name,
                        originalSize: originalSizeFormatted,
                        reason: err.message || "Nieznany błąd podczas uploadu.",
                    });
                }
                console.error(`[UPLOAD] Error for ${file.name}:`, err);
            }
        };

        try {
            const CONCURRENCY = 22;
            let index = 0;

            const worker = async () => {
                while (index < totalFiles) {
                    const currentIndex = index++;
                    const file = fileArray[currentIndex];
                    try {
                        await uploadSingle(file);
                    } catch (err) {
                        console.error("Upload failed for", file.name, err);
                    }
                }
            };

            const workers = Array.from(
                { length: Math.min(CONCURRENCY, totalFiles) },
                () => worker()
            );
            await Promise.all(workers);

            if (uploadedPhotos.length > 0) {
                const saveRes = await fetch(
                    `/api/collections/${collectionId}/photos/batch`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ photos: uploadedPhotos }),
                    }
                );

                if (!saveRes.ok) {
                    const errorData = await saveRes.json().catch(() => ({}));
                    if (saveRes.status === 413 && errorData?.upgradeRequired) {
                        toast.error("Out of space", {
                            description:
                                errorData.message || "Storage limit exceeded.",
                        });
                        router.push("/dashboard/billing");
                        return;
                    }
                    throw new Error("Failed to save photos to database");
                }
            }

            await onSuccess();

            if (errors.length > 0) {
                setUploadErrors(errors);
                toast.error(`${errors.length} zdjęć się nie dodało`, {
                    description: "Zobacz listę błędów poniżej.",
                    duration: 10000,
                });
            }

            if (uploaded > 0) {
                toast.success(`Dodano ${uploaded} z ${totalFiles} zdjęć`);
            } else if (errors.length === 0) {
                toast.error("Nie udało się dodać żadnego zdjęcia");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Błąd podczas uploadu zdjęć");
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }

    return {
        uploading,
        uploadProgress,
        uploadErrors,
        setUploadErrors,
        uploadPhotos,
    };
}
