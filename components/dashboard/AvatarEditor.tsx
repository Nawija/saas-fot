"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    RotateCw,
    RotateCcw,
    Upload,
    ZoomIn,
    ZoomOut,
    Move,
} from "lucide-react";

interface AvatarEditorProps {
    onImageReady: (file: File) => void;
    initialImage?: string;
    initialFile?: File;
}

interface ImageTransform {
    x: number;
    y: number;
    scale: number;
    rotation: number;
}

export default function AvatarEditor({
    onImageReady,
    initialImage,
    initialFile,
}: AvatarEditorProps) {
    const [originalFile, setOriginalFile] = useState<File | null>(
        initialFile || null
    );
    const [preview, setPreview] = useState<string>(initialImage || "");
    const [transform, setTransform] = useState<ImageTransform>({
        x: 0,
        y: 0,
        scale: 0.2, // Default 130% zoom
        rotation: 0,
    });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isEditing, setIsEditing] = useState(!!initialImage); // Auto-enable editing if image provided

    const containerRef = useRef<HTMLDivElement>(null);
    const maskRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setOriginalFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
                setTransform({ x: 0, y: 0, scale: 0.2, rotation: 0 }); // Reset with 20% zoom
                setIsEditing(true);
            };
            reader.readAsDataURL(file);
            e.target.value = "";
        }
    };

    const generateFinalImage = useCallback(async () => {
        if (!preview || !originalFile || !maskRef.current || !canvasRef.current)
            return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const maskWidth = maskRef.current.clientWidth;
        const maskHeight = maskRef.current.clientHeight;

        // Avatar rozmiar 200x200px (kwadrat)
        const outputSize = 200;
        canvas.width = outputSize;
        canvas.height = outputSize;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = preview;

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        }).catch((err) => {
            console.error("Error loading image:", err);
            return;
        });

        const scaleFactorX = outputSize / maskWidth;
        const scaleFactorY = outputSize / maskHeight;

        ctx.fillStyle = "#f3f4f6";
        ctx.fillRect(0, 0, outputSize, outputSize);

        ctx.save();
        ctx.translate(outputSize / 2, outputSize / 2);
        ctx.rotate((transform.rotation * Math.PI) / 180);

        const scaledWidth = img.width * transform.scale * scaleFactorX;
        const scaledHeight = img.height * transform.scale * scaleFactorY;

        const translationX = transform.x * scaleFactorX;
        const translationY = transform.y * scaleFactorY;

        ctx.drawImage(
            img,
            -scaledWidth / 2 + translationX,
            -scaledHeight / 2 + translationY,
            scaledWidth,
            scaledHeight
        );

        ctx.restore();

        // Convert canvas to blob with Promise
        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, "image/jpeg", 0.9);
        });

        if (blob) {
            const file = new File([blob], originalFile.name, {
                type: "image/jpeg",
            });
            onImageReady(file);
        }
    }, [preview, originalFile, transform, onImageReady]);

    useEffect(() => {
        if (initialImage && !preview) {
            setPreview(initialImage);
            setIsEditing(true); // Enable editing mode for initial image
            fetch(initialImage)
                .then((res) => res.blob())
                .then((blob) => {
                    const file = new File([blob], "avatar.jpg", {
                        type: "image/jpeg",
                    });
                    setOriginalFile(file);
                })
                .catch((err) => {
                    console.error("Error loading initial image:", err);
                });
        } else if (preview && originalFile && isEditing) {
            // Generate immediately when all conditions are met
            generateFinalImage();
        }
    }, [initialImage, preview, originalFile, isEditing, generateFinalImage]);

    useEffect(() => {
        if (isEditing && preview && originalFile) {
            generateFinalImage();
        }
    }, [transform, preview, isEditing, originalFile, generateFinalImage]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isEditing) return;
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - transform.x,
            y: e.clientY - transform.y,
        });
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!isEditing) return;
        e.preventDefault();
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({
            x: touch.clientX - transform.x,
            y: touch.clientY - transform.y,
        });
    };

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging) return;

            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;

            setTransform((prev) => ({
                ...prev,
                x: newX,
                y: newY,
            }));
        },
        [isDragging, dragStart]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleTouchMove = useCallback(
        (e: TouchEvent) => {
            if (!isDragging || e.touches.length === 0) return;
            e.preventDefault();

            const touch = e.touches[0];
            const newX = touch.clientX - dragStart.x;
            const newY = touch.clientY - dragStart.y;

            setTransform((prev) => ({
                ...prev,
                x: newX,
                y: newY,
            }));
        },
        [isDragging, dragStart]
    );

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            window.addEventListener("touchmove", handleTouchMove, {
                passive: false,
            });
            window.addEventListener("touchend", handleTouchEnd);

            return () => {
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("mouseup", handleMouseUp);
                window.removeEventListener("touchmove", handleTouchMove);
                window.removeEventListener("touchend", handleTouchEnd);
            };
        }
    }, [
        isDragging,
        handleMouseMove,
        handleMouseUp,
        handleTouchMove,
        handleTouchEnd,
    ]);

    const rotateLeft = () => {
        const newRotation = (transform.rotation - 90 + 360) % 360;
        setTransform((prev) => ({
            ...prev,
            rotation: newRotation,
            x: 0,
            y: 0,
        }));
    };

    const rotateRight = () => {
        const newRotation = (transform.rotation + 90) % 360;
        setTransform((prev) => ({
            ...prev,
            rotation: newRotation,
            x: 0,
            y: 0,
        }));
    };

    const zoomIn = () => {
        setTransform((prev) => ({
            ...prev,
            scale: Math.min(prev.scale + 0.1, 3),
        }));
    };

    const zoomOut = () => {
        setTransform((prev) => ({
            ...prev,
            scale: Math.max(prev.scale - 0.1, 0.1),
        }));
    };

    const resetTransform = () => {
        setTransform({ x: 0, y: 0, scale: 0.2, rotation: 0 }); // Reset to 20% zoom
    };

    return (
        <div className="space-y-6">
            <canvas ref={canvasRef} className="hidden" />

            {/* Avatar Preview - centered, smaller */}
            <div className="flex flex-col items-center gap-4">
                <div
                    ref={containerRef}
                    className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-xl overflow-hidden bg-gray-200"
                    style={{ touchAction: isEditing ? "none" : "auto" }}
                >
                    {preview ? (
                        <>
                            <div
                                className={`absolute inset-0 flex items-center justify-center ${
                                    isEditing
                                        ? isDragging
                                            ? "cursor-grabbing"
                                            : "cursor-grab"
                                        : "cursor-default"
                                }`}
                                onMouseDown={handleMouseDown}
                                onTouchStart={handleTouchStart}
                            >
                                {/* Full image - full opacity */}
                                <img
                                    ref={imageRef}
                                    src={preview}
                                    alt="Avatar preview"
                                    className="absolute select-none pointer-events-none"
                                    style={{
                                        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
                                        transformOrigin: "center",
                                        maxWidth: "none",
                                        maxHeight: "none",
                                        transition: isDragging
                                            ? "none"
                                            : "transform 0.1s ease-out",
                                    }}
                                    draggable={false}
                                />

                                {/* Dark overlay with circular cutout */}
                                <div
                                    className="absolute inset-0 pointer-events-none sm:hidden"
                                    style={{
                                        background:
                                            "radial-gradient(circle at center, transparent 64px, rgba(255, 255, 255, 0.35) 64px)",
                                    }}
                                />
                                <div
                                    className="absolute inset-0 pointer-events-none hidden sm:block"
                                    style={{
                                        background:
                                            "radial-gradient(circle at center, transparent 80px, rgba(255, 255, 255, 0.45) 80px)",
                                    }}
                                />

                                {/* Circular ring to show boundary */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div
                                        ref={maskRef}
                                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full ring-4 ring-white/90 shadow-2xl"
                                    />
                                </div>
                            </div>

                            {isEditing && (
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <div className="absolute flex items-center justify-center">
                                        <div className="absolute w-px h-6 bg-white/60" />
                                        <div className="absolute h-px w-6 bg-white/60" />
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-linear-to-br hover:from-gray-800 hover:to-gray-700 transition-all group">
                            <Upload className="w-12 h-12 text-gray-400 group-hover:text-gray-300 mb-3 transition-colors" />
                            <span className="text-sm font-medium text-gray-300 px-2 text-center">
                                Add photo
                            </span>
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>

                {/* Drag hint badge */}
                {preview && isEditing && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                        <Move className="w-3 h-3" />
                        <span className="hidden sm:inline">
                            Drag to adjust position
                        </span>
                        <span className="inline sm:hidden">Drag to adjust</span>
                    </div>
                )}
            </div>

            {/* Controls - compact and centered */}
            {preview && isEditing && (
                <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        {/* Zoom */}
                        <div className="flex items-center gap-0.5 bg-gray-50 rounded-lg p-0.5 border border-gray-200">
                            <button
                                type="button"
                                onClick={zoomOut}
                                className="p-1.5 hover:bg-white rounded-md transition-colors"
                                title="Zoom out"
                            >
                                <ZoomOut className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                            <span className="px-2 text-xs font-medium text-gray-700 min-w-[45px] text-center">
                                {Math.round(transform.scale * 100)}%
                            </span>
                            <button
                                type="button"
                                onClick={zoomIn}
                                className="p-1.5 hover:bg-white rounded-md transition-colors"
                                title="Zoom in"
                            >
                                <ZoomIn className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                        </div>

                        {/* Rotation */}
                        <div className="flex items-center gap-0.5 bg-gray-50 rounded-lg p-0.5 border border-gray-200">
                            <button
                                type="button"
                                onClick={rotateLeft}
                                className="p-1.5 hover:bg-white rounded-md transition-colors"
                                title="Rotate left"
                            >
                                <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                            <span className="px-2 text-xs font-medium text-gray-700 min-w-10 text-center">
                                {transform.rotation}°
                            </span>
                            <button
                                type="button"
                                onClick={rotateRight}
                                className="p-1.5 hover:bg-white rounded-md transition-colors"
                                title="Rotate right"
                            >
                                <RotateCw className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                        </div>

                        {/* Reset */}
                        <button
                            type="button"
                            onClick={resetTransform}
                            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-lg transition-colors border border-gray-200"
                        >
                            Reset
                        </button>
                    </div>

                    {/* Tips */}
                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            Drag the image • Zoom to fill • Rotate if needed
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
