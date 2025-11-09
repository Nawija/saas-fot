"use client";

import { useState, useEffect } from "react";
import { Upload, CheckCircle2, AlertCircle, Loader } from "lucide-react";
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
    const [showComplete, setShowComplete] = useState(false);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpload(e);
        setKey((prev) => prev + 1);
    };

    // Auto-hide after upload complete
    useEffect(() => {
        if (!uploading && uploadedCount > 0 && uploadedCount === totalCount) {
            setShowComplete(true);
            const timer = setTimeout(() => {
                setShowComplete(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [uploading, uploadedCount, totalCount]);

    const isComplete = !uploading && uploadedCount > 0 && showComplete;
    const isSuccess = uploadedCount === totalCount;

    return (
        <>
            {/* Mobile */}
            <motion.div
                className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
            >
                <AnimatePresence mode="wait">
                    {uploading || isComplete ? (
                        <motion.div
                            key="progress"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <AnimatePresence mode="wait">
                                    {uploading ? (
                                        <Loader className="animate-spin h-4 w-4 text-gray-700" />
                                    ) : isSuccess ? (
                                        <motion.div
                                            key="success"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                        >
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="error"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                        >
                                            <AlertCircle className="h-5 w-5 text-red-600" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <motion.span
                                    className="text-sm font-medium text-gray-900"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    {uploading
                                        ? `Uploading ${uploadedCount}/${totalCount}...`
                                        : isSuccess
                                        ? `${uploadedCount} photos uploaded`
                                        : "Upload complete"}
                                </motion.span>
                            </div>
                            {uploading && (
                                <motion.div
                                    className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"
                                    initial={{ opacity: 0, scaleX: 0.9 }}
                                    animate={{ opacity: 1, scaleX: 1 }}
                                >
                                    <motion.div
                                        className="bg-linear-to-r from-sky-300 via-indigo-300 to-blue-400 h-2 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${uploadProgress}%`,
                                        }}
                                    />
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="button"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4"
                        >
                            <label className="block cursor-pointer">
                                <input
                                    key={key}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleUpload}
                                    className="hidden"
                                />
                                <div className="flex items-center justify-center gap-2 bg-linear-to-r from-sky-500 via-indigo-500 to-pink-400 text-white rounded-lg py-3 px-4">
                                    <Upload className="h-5 w-5" />
                                    <span className="font-medium">
                                        Upload Photos
                                    </span>
                                </div>
                            </label>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Desktop */}
            <div className="hidden lg:block fixed bottom-6 right-6 z-50">
                <AnimatePresence mode="wait">
                    {uploading || isComplete ? (
                        <motion.div
                            key="card"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-lg shadow-xl border w-80 p-4"
                        >
                            <div className="flex items-center gap-2 pb-2">
                                <AnimatePresence mode="wait">
                                    {uploading ? (
                                        <Loader className="animate-spin h-4 w-4 text-gray-700" />
                                    ) : isSuccess ? (
                                        <motion.div
                                            key="success"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                        >
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="error"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                        >
                                            <AlertCircle className="h-5 w-5 text-red-600" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <motion.span
                                    className="text-sm font-semibold text-gray-900"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    {uploading ? "Uploading" : "Complete"}
                                </motion.span>
                            </div>
                            {uploading && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                >
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span
                                            key={`${uploadedCount}-${totalCount}`}
                                        >
                                            {uploadedCount} of {totalCount}
                                        </span>
                                        <span
                                            key={uploadProgress}
                                            className="font-semibold"
                                        >
                                            {uploadProgress}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                            className="bg-linear-to-r from-sky-300 via-indigo-300 to-blue-400 h-2 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${uploadProgress}%`,
                                            }}
                                            transition={{
                                                duration: 0.3,
                                                ease: "easeOut",
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.label
                            key="fab"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="block cursor-pointer group"
                        >
                            <input
                                key={key}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleUpload}
                                className="hidden"
                            />
                            <div className="bg-linear-60 from-blue-500 to-indigo-400 border-indigo-300 border text-white rounded-full p-4 shadow-lg hover:scale-105 transition">
                                <Upload className="h-6 w-6" />
                            </div>
                            <div className="absolute bottom-full right-0 mb-2 pointer-events-none">
                                <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                    Upload photos
                                </div>
                            </div>
                        </motion.label>
                    )}
                </AnimatePresence>
            </div>

            <div className="lg:hidden h-20" />
        </>
    );
}
