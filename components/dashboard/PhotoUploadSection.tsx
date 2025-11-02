// components/dashboard/PhotoUploadSection.tsx
"use client";

import { useState, useRef } from "react";
import { Loader, Upload } from "lucide-react";
import Loading from "../ui/Loading";

interface PhotoUploadSectionProps {
    uploading: boolean;
    uploadProgress: number;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDrop?: (files: FileList) => void;
}

export default function PhotoUploadSection({
    uploading,
    uploadProgress,
    onUpload,
    onDrop,
}: PhotoUploadSectionProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Only set isDragging to false if we're leaving the drop zone entirely
        if (
            dropZoneRef.current &&
            !dropZoneRef.current.contains(e.relatedTarget as Node)
        ) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const validateFile = (file: File): boolean => {
        // Check file type
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/heic",
            "image/heif",
        ];
        if (!allowedTypes.includes(file.type.toLowerCase())) {
            return false;
        }

        // Check file size (max 50MB for safety)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            return false;
        }

        return true;
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (uploading) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            // Filter and validate image files
            const imageFiles = Array.from(files).filter(
                (file) => file.type.startsWith("image/") && validateFile(file)
            );

            if (imageFiles.length > 0 && onDrop) {
                // Create a new FileList-like object
                const dataTransfer = new DataTransfer();
                imageFiles.forEach((file) => dataTransfer.items.add(file));
                onDrop(dataTransfer.files);
            }

            // Show warning if some files were rejected
            const rejectedCount = files.length - imageFiles.length;
            if (rejectedCount > 0) {
                console.warn(
                    `${rejectedCount} file(s) rejected: invalid type or size > 50MB`
                );
            }
        }
    };

    const handleClick = () => {
        if (!uploading && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="bg-white rounded-2xl p-2 mb-2">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic,image/heif"
                multiple
                onChange={onUpload}
                disabled={uploading}
                className="hidden"
                id="photo-upload"
            />
            <div
                ref={dropZoneRef}
                onClick={handleClick}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed z-10 rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    uploading
                        ? "border-blue-300 bg-blue-50"
                        : isDragging
                        ? "border-blue-500 bg-blue-100 scale-[1.02] shadow-lg"
                        : "border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                }`}
            >
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                    {uploading ? (
                        <Loader
                            size={33}
                            className="text-blue-400 animate-spin"
                        />
                    ) : (
                        <Upload
                            className={`w-12 h-12 transition-all duration-200 ${
                                isDragging
                                    ? "text-blue-600 scale-125"
                                    : "text-blue-400"
                            }`}
                        />
                    )}
                </div>
                {uploading ? (
                    <div>
                        <div className="text-gray-900 font-medium mb-2">
                            Uploading... {uploadProgress}%
                        </div>
                        <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-linear-to-r from-sky-300 via-indigo-300 to-blue-400 h-2 rounded-full transition-all animate-pulse duration-300"
                                style={{
                                    width: `${uploadProgress}%`,
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        <div
                            className={`font-medium mb-2 transition-all duration-200 ${
                                isDragging
                                    ? "text-blue-700 text-lg"
                                    : "text-gray-900"
                            }`}
                        >
                            {isDragging
                                ? "Drop photos here"
                                : "Drag photos here or click to select"}
                        </div>
                        <div
                            className={`text-sm transition-all duration-200 ${
                                isDragging
                                    ? "text-sky-600 font-medium"
                                    : "text-gray-600"
                            }`}
                        >
                            {isDragging
                                ? "Release to upload"
                                : "You can select multiple photos at once"}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
