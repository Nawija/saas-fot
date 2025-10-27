"use client";

import React from "react";
import { LogOut } from "lucide-react";
import DownloadMenu from "@/components/gallery/DownloadMenu";

export interface GalleryHeaderProps {
    title: string;
    likedCount: number;
    totalCount: number;
    onDownload: (onlyFavorites: boolean) => void;
    onLogout?: () => void;
}

export default function GalleryHeader({
    title,
    likedCount,
    totalCount,
    onDownload,
    onLogout,
}: GalleryHeaderProps) {
    return (
        <div className="bg-white flex items-center justify-between py-6 px-4 shadow-sm">
            <p className="font-semibold text-lg">{title}</p>
            <div className="flex items-center justify-center gap-4">
                <DownloadMenu
                    likedCount={likedCount}
                    totalCount={totalCount}
                    onDownload={onDownload}
                />
                <button
                    type="button"
                    onClick={onLogout}
                    aria-label="Wyloguj"
                    className="text-red-600 cursor-pointer hover:text-red-700 transition-colors"
                >
                    <LogOut size={25} />
                </button>
            </div>
        </div>
    );
}
