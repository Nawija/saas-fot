// NEW PREMIUM VERSION WITH REAL PROGRESS — MOBILE FLOATING BUTTON

"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Upload, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingUploadButtonProps {
    uploading: boolean;
    uploadProgress: number;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    uploadedCount?: number;
    totalCount?: number;
}

const baseClasses =
    "bg-blue-50 hover:bg-blue-100 text-blue-800 hover:text-blue-600 border border-blue-300 hover:border-blue-200";
const springTransition = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
};

const FloatingUploadButton = memo(function FloatingUploadButton({
    uploading,
    uploadProgress,
    onUpload,
    uploadedCount = 0,
    totalCount = 0,
}: FloatingUploadButtonProps) {
    const [key, setKey] = useState(0);
    const [state, setState] = useState<"welcome" | "idle" | "loading">(
        "welcome"
    );

    const handleUpload = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!e.target.files?.length) return;
            setState("loading");
            onUpload(e);
            setKey((prev) => prev + 1);
        },
        [onUpload]
    );

    // Initial welcome animation
    useEffect(() => {
        const timer = setTimeout(() => {
            setState("idle");
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    // change UI automatically when progress hits 100% or all files uploaded
    useEffect(() => {
        if (uploading) {
            setState("loading");
        }
    }, [uploading]);

    useEffect(() => {
        const finishedByProgress = uploadProgress === 100 && !uploading;
        const finishedByCount =
            totalCount > 0 && uploadedCount === totalCount && !uploading;

        if (finishedByProgress || finishedByCount) {
            setState("idle");
        }
    }, [uploading, uploadProgress, uploadedCount, totalCount]);

    return (
        <div className="fixed bottom-6 right-6 z-40">
            <label className="cursor-pointer block">
                <input
                    key={key}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUpload}
                    className="hidden"
                />

                <AnimatePresence mode="wait">
                    {state === "welcome" && (
                        <motion.div
                            key="welcome"
                            initial={{ width: 64, opacity: 0 }}
                            animate={{ width: 128, opacity: 1 }}
                            exit={{ width: 64, opacity: 0 }}
                            transition={springTransition}
                            className={`${baseClasses} h-12 rounded-full flex items-center justify-center gap-2 px-4 overflow-hidden`}
                        >
                            <Upload size={20} />
                            <span className="text-sm font-medium">Upload</span>
                        </motion.div>
                    )}

                    {state === "idle" && (
                        <motion.div
                            key="idle"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={springTransition}
                            className={`${baseClasses} w-12 h-12 rounded-full flex items-center justify-center`}
                        >
                            <Upload size={20} />
                        </motion.div>
                    )}

                    {state === "loading" && (
                        <motion.div
                            key="loading"
                            initial={{ width: 64, opacity: 0 }}
                            animate={{ width: 260, opacity: 1 }}
                            exit={{ width: 64, opacity: 0 }}
                            transition={springTransition}
                            className={`${baseClasses} h-12 rounded-full flex items-center gap-4 px-4 overflow-hidden`}
                        >
                            <Loader className="w-6 h-6 animate-spin" />

                            <div className="w-full flex items-center gap-3">
                                <div className="flex-1">
                                    <motion.div
                                        className="w-full h-1 bg-gray-200 border rounded-full overflow-hidden"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={springTransition}
                                    >
                                        <motion.div
                                            className="h-full bg-linear-to-r from-sky-300 via-indigo-300 to-blue-400"
                                            animate={{
                                                width: `${uploadProgress}%`,
                                            }}
                                            transition={{
                                                ease: "linear",
                                                duration: 0.1,
                                            }}
                                        />
                                    </motion.div>
                                </div>

                                <div className="w-12 text-right text-xs tabular-nums">
                                    {Math.min(
                                        100,
                                        Math.max(0, Math.round(uploadProgress))
                                    )}
                                    %
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </label>
        </div>
    );
});

export default FloatingUploadButton;
