"use client";

export default function LoadingGallery() {
    return (
        <div
            className="flex items-center justify-center bg-gray-50 w-full"
            style={{ height: "100dvh" }}
        >
            <div className="w-16 h-16 rounded-full animate-spin bg-linear-to-tr from-gray-100 via-gray-700 to-gray-900 p-[3px]">
                <div className="h-full w-full rounded-full bg-gray-50" />
            </div>
        </div>
    );
}
