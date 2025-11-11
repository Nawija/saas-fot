"use client";

export default function LoadingGallery() {
    return (
        <div
            className="flex items-center justify-center bg-linear-to-b from-white to-gray-50 w-full"
            style={{ height: "100dvh" }}
        >
            <div className="text-center">
                <div className="w-12 h-12 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 text-sm">Loading...</p>
            </div>
        </div>
    );
}
