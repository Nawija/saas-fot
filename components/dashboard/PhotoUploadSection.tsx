// components/dashboard/PhotoUploadSection.tsx
"use client";

import { Upload } from "lucide-react";

interface PhotoUploadSectionProps {
    uploading: boolean;
    uploadProgress: number;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PhotoUploadSection({
    uploading,
    uploadProgress,
    onUpload,
}: PhotoUploadSectionProps) {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
                Dodaj zdjęcia
            </h2>

            <label className="block">
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onUpload}
                    disabled={uploading}
                    className="hidden"
                    id="photo-upload"
                />
                <div
                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                        uploading
                            ? "border-blue-300 bg-blue-50"
                            : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                    }`}
                >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    {uploading ? (
                        <div>
                            <div className="text-gray-900 font-medium mb-2">
                                Uploaduję... {uploadProgress}%
                            </div>
                            <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${uploadProgress}%`,
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="text-gray-900 font-medium mb-2">
                                Kliknij aby dodać zdjęcia
                            </div>
                            <div className="text-sm text-gray-600">
                                Możesz wybrać wiele zdjęć na raz
                            </div>
                        </div>
                    )}
                </div>
            </label>
        </div>
    );
}
