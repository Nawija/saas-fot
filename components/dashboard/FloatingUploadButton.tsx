"use client";

import { useState, useEffect } from "react";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
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
                className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
                <AnimatePresence mode="wait">
                    {uploading || isComplete ? (
                        <motion.div
                            key="progress"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="p-4"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <AnimatePresence mode="wait">
                                    {uploading ? (
                                        <motion.div
                                            key="spinner"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"
                                        />
                                    ) : isSuccess ? (
                                        <motion.div
                                            key="success"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                                type: "spring",
                                                damping: 10,
                                                stiffness: 200,
                                            }}
                                        >
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="error"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                                type: "spring",
                                                damping: 10,
                                                stiffness: 200,
                                            }}
                                        >
                                            <AlertCircle className="h-5 w-5 text-red-600" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <motion.span
                                    className="text-sm font-medium text-gray-900"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2 }}
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
                                    transition={{ duration: 0.2 }}
                                >
                                    <motion.div
                                        className="bg-blue-600 h-2 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${uploadProgress}%`,
                                        }}
                                        transition={{
                                            duration: 0.3,
                                            ease: "easeOut",
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
                            transition={{ duration: 0.2 }}
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
                                <motion.div
                                    className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-3 px-4"
                                    whileHover={{
                                        scale: 1.02,
                                        backgroundColor: "#2563eb",
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <Upload className="h-5 w-5" />
                                    <span className="font-medium">
                                        Upload Photos
                                    </span>
                                </motion.div>
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
                            transition={{
                                type: "spring",
                                damping: 20,
                                stiffness: 200,
                            }}
                            className="bg-white rounded-lg shadow-xl border w-80 p-4"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <AnimatePresence mode="wait">
                                    {uploading ? (
                                        <motion.div
                                            key="spinner"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"
                                        />
                                    ) : isSuccess ? (
                                        <motion.div
                                            key="success"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                                type: "spring",
                                                damping: 10,
                                                stiffness: 200,
                                            }}
                                        >
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="error"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                                type: "spring",
                                                damping: 10,
                                                stiffness: 200,
                                            }}
                                        >
                                            <AlertCircle className="h-5 w-5 text-red-600" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <motion.span
                                    className="text-sm font-semibold text-gray-900"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {uploading ? "Uploading" : "Complete"}
                                </motion.span>
                            </div>
                            {uploading && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex justify-between text-xs text-gray-600 mb-2">
                                        <motion.span
                                            key={`${uploadedCount}-${totalCount}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            {uploadedCount} of {totalCount}
                                        </motion.span>
                                        <motion.span
                                            key={uploadProgress}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            {uploadProgress}%
                                        </motion.span>
                                    </div>
                                    <motion.div
                                        className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"
                                        initial={{ opacity: 0, scaleX: 0.9 }}
                                        animate={{ opacity: 1, scaleX: 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <motion.div
                                            className="bg-blue-600 h-2 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${uploadProgress}%`,
                                            }}
                                            transition={{
                                                duration: 0.3,
                                                ease: "easeOut",
                                            }}
                                        />
                                    </motion.div>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.label
                            key="fab"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{
                                type: "spring",
                                damping: 15,
                                stiffness: 200,
                            }}
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
                            <motion.div
                                className="bg-blue-600 text-white rounded-full p-4 shadow-lg"
                                whileHover={{
                                    scale: 1.1,
                                    backgroundColor: "#2563eb",
                                    boxShadow:
                                        "0 20px 25px -5px rgb(37 99 235 / 0.3)",
                                }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                            >
                                <Upload className="h-6 w-6" />
                            </motion.div>
                            <motion.div
                                className="absolute bottom-full right-0 mb-2 pointer-events-none"
                                initial={{ opacity: 0, y: 5 }}
                                whileHover={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                    Upload photos
                                </div>
                            </motion.div>
                        </motion.label>
                    )}
                </AnimatePresence>
            </div>

            <div className="lg:hidden h-20" />
        </>
    );
}
