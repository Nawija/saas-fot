"use client";

export default function LoadingGallery() {
    return (
        <div className="flex items-center justify-center h-[95vh] bg-black w-full">
            <div className="w-16 h-16 rounded-full animate-spin bg-linear-to-tr from-blue-200 via-indigo-500 to-purple-200 p-[3px]">
                <div className="h-full w-full rounded-full bg-black" />
            </div>
        </div>
    );
}
