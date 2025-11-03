import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function usePhotoUpload(
    collectionId: string | null,
    onUploadComplete: () => Promise<void>
) {
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    async function uploadFiles(fileArray: File[]) {
        if (!collectionId) return;

        setUploading(true);
        setUploadProgress(0);

        const totalFiles = fileArray.length;
        let uploaded = 0;
        let quotaErrorRedirected = false;

        const uploadSingle = async (file: File) => {
            const formData = new FormData();
            formData.append("file", file);
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
                if (
                    uploadRes.status === 413 &&
                    (errorData?.upgradeRequired || errorData?.message)
                ) {
                    if (!quotaErrorRedirected) {
                        quotaErrorRedirected = true;
                        toast.error("Out of space", {
                            description:
                                errorData.message || "Storage limit exceeded",
                        });
                        router.push("/dashboard/billing");
                    }
                    throw new Error("Storage limit reached");
                }
                throw new Error(`Failed to upload ${file.name}`);
            }

            const { url, size, width, height } = await uploadRes.json();

            const saveRes = await fetch(
                `/api/collections/${collectionId}/photos`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        file_name: file.name,
                        file_path: url,
                        file_size: size,
                        width,
                        height,
                    }),
                }
            );

            if (!saveRes.ok) {
                let errorData: any = {};
                try {
                    errorData = await saveRes.json();
                } catch {}
                if (
                    saveRes.status === 413 &&
                    (errorData?.upgradeRequired || errorData?.message)
                ) {
                    if (!quotaErrorRedirected) {
                        quotaErrorRedirected = true;
                        toast.error("Out of space", {
                            description:
                                errorData.message || "Storage limit exceeded",
                        });
                        router.push("/dashboard/billing");
                    }
                    throw new Error("Storage limit reached");
                }
                throw new Error(`Failed to save ${file.name}`);
            }

            uploaded++;
            setUploadProgress(Math.round((uploaded / totalFiles) * 100));
        };

        try {
            const CONCURRENCY = 4;
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

            await onUploadComplete();
            toast.success(`Uploaded ${uploaded} of ${totalFiles} photos`);
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Error uploading photos");
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        await uploadFiles(Array.from(files));
    };

    const handleDrop = async (files: FileList) => {
        if (files.length === 0) return;
        await uploadFiles(Array.from(files));
    };

    return {
        uploading,
        uploadProgress,
        handleUpload,
        handleDrop,
    };
}
