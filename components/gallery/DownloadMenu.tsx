"use client";

import { Heart, Download } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface DownloadMenuProps {
    totalCount: number;
    likedCount: number;
    onDownload: (onlyFavorites: boolean) => void;
}

export default function DownloadMenu({
    totalCount,
    likedCount,
    onDownload,
}: DownloadMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Download size={25} className="cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                    onClick={() => onDownload(true)}
                    className="flex items-center gap-3 py-3"
                >
                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">
                            Pobierz ulubione
                        </span>
                        <span className="text-xs text-gray-500">
                            {likedCount} zdjęć
                        </span>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onDownload(false)}
                    className="flex items-center gap-3 py-3"
                >
                    <Download className="w-5 h-5 text-gray-700" />
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">
                            Pobierz wszystko
                        </span>
                        <span className="text-xs text-gray-500">
                            {totalCount} zdjęć
                        </span>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
