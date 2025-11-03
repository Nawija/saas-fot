import PhotoUploadSection from "@/components/dashboard/PhotoUploadSection";

interface UploadSectionCardProps {
    uploading: boolean;
    uploadProgress: number;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDrop: (files: FileList) => void;
}

export default function UploadSectionCard({
    uploading,
    uploadProgress,
    onUpload,
    onDrop,
}: UploadSectionCardProps) {
    return (
        <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="text-xl font-light text-gray-900 tracking-tight">
                    Upload Photos
                </h2>
                <p className="text-sm text-gray-500 mt-1 font-light">
                    Drag and drop or click to select files
                </p>
            </div>
            <div className="p-6">
                <PhotoUploadSection
                    uploading={uploading}
                    uploadProgress={uploadProgress}
                    onUpload={onUpload}
                    onDrop={onDrop}
                />
            </div>
        </div>
    );
}
