// NEW PREMIUM VERSION WITH REAL PROGRESS — MOBILE FLOATING BUTTON

"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Loader, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingUploadButtonProps {
    uploading: boolean;
    uploadProgress: number;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    uploadedCount?: number;
    totalCount?: number;
}

export default function FloatingUploadButton({
    uploading,
    uploadProgress,
    onUpload,
    uploadedCount = 0,
    totalCount = 0,
}: FloatingUploadButtonProps) {
    const [key, setKey] = useState(0);
    const [state, setState] = useState<"idle" | "loading" | "done">("idle");
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setState("loading");
        onUpload(e);
        setKey((prev) => prev + 1);
    };

    // change UI automatically when progress hits 100% or all files uploaded
    useEffect(() => {
        if (uploading) {
            setState("loading");
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [uploading]);

    useEffect(() => {
        const finishedByProgress = uploadProgress === 100 && !uploading;
        const finishedByCount =
            totalCount > 0 && uploadedCount === totalCount && !uploading;

        if (finishedByProgress || finishedByCount) {
            setState("done");

            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(() => {
                setState("idle");
                timerRef.current = null;
            }, 1200);
        }
    }, [uploading, uploadProgress, uploadedCount, totalCount]);

    // clear timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

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
                    {state === "idle" && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center"
                        >
                            <Upload size={26} />
                        </motion.div>
                    )}

                    {state === "loading" && (
                        <motion.div
                            key="loading"
                            initial={{ width: 64 }}
                            animate={{ width: 260 }}
                            exit={{ width: 64 }}
                            transition={{ type: "tween", duration: 0.22 }}
                            className="h-16 rounded-full bg-black text-white flex items-center gap-4 px-4 overflow-hidden"
                        >
                            <Loader className="w-6 h-6 animate-spin" />

                            <div className="w-full flex items-center gap-3">
                                <div className="flex-1">
                                    <motion.div
                                        className="w-full h-1 bg-white/20 rounded-full overflow-hidden"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <motion.div
                                            className="h-full bg-white"
                                            animate={{
                                                width: `${uploadProgress}%`,
                                            }}
                                            transition={{ ease: "linear" }}
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

                    {state === "done" && (
                        <div
                            key="done"
                            className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center px-4"
                        >
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <CheckCircle2 size={26} className="text-green-600" />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </label>
        </div>
    );
}
