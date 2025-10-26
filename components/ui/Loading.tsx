"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex items-center justify-center h-[75vh] w-full">
            <Loader2 size={70} className="animate-spin text-blue-500" />
        </div>
    );
}
