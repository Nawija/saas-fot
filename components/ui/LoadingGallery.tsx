"use client";

export default function LoadingGallery() {
    return (
        <div className="flex items-center justify-center h-screen bg-black w-full">
            <div className="w-16 h-16 rounded-full animate-spin bg-linear-to-tr from-gray-200 via-gray-500 to-gray-200 p-[3px]">
                <div className="h-full w-full rounded-full bg-black" />
            </div>
        </div>
    );
}
