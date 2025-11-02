"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    RotateCw,
    RotateCcw,
    Upload,
    X,
    ZoomIn,
    ZoomOut,
    Move,
} from "lucide-react";

interface HeroImageEditorProps {
    onImageReady: (file: File) => void;
    initialImage?: string;
}

interface ImageTransform {
    x: number;
    y: number;
    scale: number;
    rotation: number; // 0, 90, 180, 270
}

export default function HeroImageEditor({
    onImageReady,
    initialImage,
}: HeroImageEditorProps) {
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>(initialImage || "");
    const [transform, setTransform] = useState<ImageTransform>({
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
    });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
    const [isEditing, setIsEditing] = useState(false); // New state: editing mode

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Load image and get natural dimensions
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setOriginalFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
                setTransform({ x: 0, y: 0, scale: 1, rotation: 0 });
                setIsEditing(true); // Enable editing mode when new image is selected
            };
            reader.readAsDataURL(file);
            // Reset input value AFTER reading so same file can be selected again
            e.target.value = "";
        }
        // If no file selected (user cancelled), do nothing - old image stays
    };

    // Load initial image if provided
    useEffect(() => {
        if (initialImage && !preview) {
            setPreview(initialImage);
            // Create a dummy file for the original image
            fetch(initialImage)
                .then((res) => res.blob())
                .then((blob) => {
                    const file = new File([blob], "hero.jpg", {
                        type: "image/jpeg",
                    });
                    setOriginalFile(file);
                })
                .catch((err) => {
                    console.error("Error loading initial image:", err);
                });
        }
    }, [initialImage, preview]);

    // Update image size when preview changes
    useEffect(() => {
        if (preview && imageRef.current) {
            const img = new Image();
            img.onload = () => {
                setNaturalSize({ width: img.width, height: img.height });
                calculateInitialScale(img.width, img.height);
            };
            img.src = preview;
        }
    }, [preview]);

    // Constrain position to prevent image from going outside container
    const constrainPosition = useCallback(
        (x: number, y: number) => {
            if (!containerRef.current || !imageRef.current) return { x, y };

            const container = containerRef.current;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            const isRotated =
                transform.rotation === 90 || transform.rotation === 270;
            const imgWidth = isRotated ? naturalSize.height : naturalSize.width;
            const imgHeight = isRotated
                ? naturalSize.width
                : naturalSize.height;

            const scaledWidth = imgWidth * transform.scale;
            const scaledHeight = imgHeight * transform.scale;

            // Calculate boundaries
            const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
            const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);

            return {
                x: Math.min(Math.max(x, -maxX), maxX),
                y: Math.min(Math.max(y, -maxY), maxY),
            };
        },
        [transform.scale, transform.rotation, naturalSize]
    );

    // Calculate initial scale to fit container
    const calculateInitialScale = (imgWidth: number, imgHeight: number) => {
        if (!containerRef.current) return;

        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        // For rotations of 90 or 270, swap dimensions
        const rotation = transform.rotation;
        const isRotated = rotation === 90 || rotation === 270;
        const effectiveWidth = isRotated ? imgHeight : imgWidth;
        const effectiveHeight = isRotated ? imgWidth : imgHeight;

        const scaleX = containerWidth / effectiveWidth;
        const scaleY = containerHeight / effectiveHeight;
        // Dokładnie pokryj kontener bez dodatkowego zoom
        const initialScale = Math.max(scaleX, scaleY);

        setTransform((prev) => ({ ...prev, scale: initialScale, x: 0, y: 0 }));
    };

    // Mouse drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!preview || !isEditing) return; // Only allow drag when in editing mode
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - transform.x,
            y: e.clientY - transform.y,
        });
    };

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging || !containerRef.current || !imageRef.current)
                return;

            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;

            const constrained = constrainPosition(newX, newY);

            setTransform((prev) => ({
                ...prev,
                x: constrained.x,
                y: constrained.y,
            }));
        },
        [isDragging, dragStart, constrainPosition]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Touch drag handlers for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        if (!preview || !isEditing) return; // Only allow drag when in editing mode
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({
            x: touch.clientX - transform.x,
            y: touch.clientY - transform.y,
        });
    };

    const handleTouchMove = useCallback(
        (e: TouchEvent) => {
            if (!isDragging || !containerRef.current || !imageRef.current)
                return;
            e.preventDefault(); // Prevent scrolling while dragging

            const touch = e.touches[0];
            const newX = touch.clientX - dragStart.x;
            const newY = touch.clientY - dragStart.y;

            const constrained = constrainPosition(newX, newY);

            setTransform((prev) => ({
                ...prev,
                x: constrained.x,
                y: constrained.y,
            }));
        },
        [isDragging, dragStart, constrainPosition]
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

    // Rotation handlers
    const rotateLeft = () => {
        const newRotation = (transform.rotation - 90 + 360) % 360;
        setTransform((prev) => ({
            ...prev,
            rotation: newRotation,
            x: 0,
            y: 0,
        }));
        // Recalculate scale for new rotation
        setTimeout(() => {
            calculateInitialScale(naturalSize.width, naturalSize.height);
        }, 0);
    };

    const rotateRight = () => {
        const newRotation = (transform.rotation + 90) % 360;
        setTransform((prev) => ({
            ...prev,
            rotation: newRotation,
            x: 0,
            y: 0,
        }));
        // Recalculate scale for new rotation
        setTimeout(() => {
            calculateInitialScale(naturalSize.width, naturalSize.height);
        }, 0);
    };

    // Zoom handlers with position constraint
    const zoomIn = useCallback(() => {
        setTransform((prev) => {
            const newScale = Math.min(prev.scale * 1.15, 5);

            // Recalculate constrained position with new scale
            if (!containerRef.current) return { ...prev, scale: newScale };

            const container = containerRef.current;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            const isRotated = prev.rotation === 90 || prev.rotation === 270;
            const imgWidth = isRotated ? naturalSize.height : naturalSize.width;
            const imgHeight = isRotated
                ? naturalSize.width
                : naturalSize.height;

            const scaledWidth = imgWidth * newScale;
            const scaledHeight = imgHeight * newScale;

            const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
            const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);

            return {
                ...prev,
                scale: newScale,
                x: Math.min(Math.max(prev.x, -maxX), maxX),
                y: Math.min(Math.max(prev.y, -maxY), maxY),
            };
        });
    }, [naturalSize]);

    const zoomOut = useCallback(() => {
        if (!containerRef.current) return;

        setTransform((prev) => {
            const containerWidth = containerRef.current!.clientWidth;
            const containerHeight = containerRef.current!.clientHeight;

            const isRotated = prev.rotation === 90 || prev.rotation === 270;
            const effectiveWidth = isRotated
                ? naturalSize.height
                : naturalSize.width;
            const effectiveHeight = isRotated
                ? naturalSize.width
                : naturalSize.height;

            const scaleX = containerWidth / effectiveWidth;
            const scaleY = containerHeight / effectiveHeight;
            const minScale = Math.max(scaleX, scaleY);

            const newScale = Math.max(prev.scale * 0.85, minScale);

            const scaledWidth = effectiveWidth * newScale;
            const scaledHeight = effectiveHeight * newScale;

            const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
            const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);

            return {
                ...prev,
                scale: newScale,
                x: Math.min(Math.max(prev.x, -maxX), maxX),
                y: Math.min(Math.max(prev.y, -maxY), maxY),
            };
        });
    }, [naturalSize]);

    // Generate final image
    const generateFinalImage = useCallback(async () => {
        if (
            !preview ||
            !originalFile ||
            !containerRef.current ||
            !canvasRef.current
        )
            return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size to match container aspect ratio (16:9)
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        // Use 4K resolution for desktop hero (będzie przeskalowane przez Sharp)
        // Ale zachowujemy obraz w 16:9 aspect ratio
        const outputWidth = 3840; // 4K width
        const outputHeight = 2160; // 4K height (16:9)

        canvas.width = outputWidth;
        canvas.height = outputHeight;

        // Load original image
        const img = new Image();
        img.crossOrigin = "anonymous"; // Enable CORS for R2 images
        img.src = preview;

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        }).catch((err) => {
            console.error("Error loading image:", err);
            return;
        });

        // Calculate scale factor from preview to output
        const scaleFactorX = outputWidth / containerWidth;
        const scaleFactorY = outputHeight / containerHeight;

        // Clear canvas with black background
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, outputWidth, outputHeight);

        // Save context state
        ctx.save();

        // Translate to center of canvas
        ctx.translate(outputWidth / 2, outputHeight / 2);

        // Apply rotation
        ctx.rotate((transform.rotation * Math.PI) / 180);

        // Calculate scaled dimensions
        const scaledWidth = img.width * transform.scale * scaleFactorX;
        const scaledHeight = img.height * transform.scale * scaleFactorY;

        // Apply translation (scaled)
        const offsetX = transform.x * scaleFactorX;
        const offsetY = transform.y * scaleFactorY;

        // Draw image centered with high quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(
            img,
            -scaledWidth / 2 + offsetX,
            -scaledHeight / 2 + offsetY,
            scaledWidth,
            scaledHeight
        );

        // Restore context
        ctx.restore();

        // Convert canvas to blob with high quality
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    const fileName = originalFile.name || "hero-image.jpg";
                    const file = new File(
                        [blob],
                        fileName.replace(/\.[^/.]+$/, ".jpg"),
                        { type: "image/jpeg" }
                    );
                    onImageReady(file);
                }
            },
            "image/jpeg",
            0.95 // High quality (95%)
        );
    }, [preview, originalFile, transform, onImageReady]);

    // Regenerate image when transform changes (debounced)
    useEffect(() => {
        if (!preview) return;

        const timeout = setTimeout(() => {
            generateFinalImage();
        }, 300); // Debounce 300ms

        return () => clearTimeout(timeout);
    }, [transform, preview, generateFinalImage]);

    const resetTransform = () => {
        setTransform({ x: 0, y: 0, scale: 1, rotation: 0 });
        calculateInitialScale(naturalSize.width, naturalSize.height);
    };

    return (
        <div className="space-y-4">
            {/* Canvas for generating final image (hidden) */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Main Editor */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
                <div
                    ref={containerRef}
                    className="relative aspect-video rounded-xl overflow-hidden bg-gray-200/70"
                    style={{ touchAction: isEditing ? "none" : "auto" }}
                >
                    {preview ? (
                        <>
                            {/* Image with transforms */}
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
                                <img
                                    ref={imageRef}
                                    src={preview}
                                    alt="Hero preview"
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
                            </div>

                            {/* Helper overlay - tylko w trybie edycji */}
                            {isEditing && (
                                <div className="absolute inset-0 pointer-events-none">
                                    {/* Center guide lines */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="absolute w-px h-8 bg-white/30" />
                                        <div className="absolute h-px w-8 bg-white/30" />
                                    </div>
                                </div>
                            )}

                            {/* Change Image Button - widoczny TYLKO gdy NIE edytujemy */}
                            {!isEditing && !isDragging && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
                                    <label className="px-6 py-3 bg-white/95 hover:bg-white backdrop-blur-sm text-gray-900 text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xl hover:shadow-2xl active:scale-95 border-2 border-gray-200 hover:border-blue-500 pointer-events-auto">
                                        <Upload className="w-5 h-5 text-blue-500" />
                                        <span>Change image</span>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            )}

                            {/* Drag hint - tylko w trybie edycji */}
                            {isEditing && !isDragging && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 text-white text-xs rounded-full flex items-center gap-2 pointer-events-none">
                                    <Move className="w-3 h-3" />
                                    <span className="hidden sm:inline">
                                        Drag to reposition
                                    </span>
                                    <span className="inline sm:hidden">
                                        Swipe to move
                                    </span>
                                </div>
                            )}
                        </>
                    ) : (
                        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors group">
                            <Upload className="w-12 h-12 text-gray-500 group-hover:text-gray-400 mb-3 transition-colors" />
                            <span className="text-sm font-medium text-gray-500 group-hover:text-gray-300 transition-colors">
                                Click to add hero image
                            </span>
                            <span className="text-xs text-gray-500 mt-2">
                                Recommended: 1920x1080px or higher
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

                {/* Controls - tylko w trybie edycji */}
                {preview && isEditing && (
                    <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                        {/* Zoom */}
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                            <button
                                type="button"
                                onClick={zoomOut}
                                className="p-2 hover:bg-white rounded-md transition-colors"
                                title="Zoom out"
                            >
                                <ZoomOut className="w-4 h-4 text-gray-700" />
                            </button>
                            <span className="px-3 text-sm font-medium text-gray-700 min-w-[60px] text-center">
                                {Math.round(transform.scale * 100)}%
                            </span>
                            <button
                                type="button"
                                onClick={zoomIn}
                                className="p-2 hover:bg-white rounded-md transition-colors"
                                title="Zoom in"
                            >
                                <ZoomIn className="w-4 h-4 text-gray-700" />
                            </button>
                        </div>

                        {/* Rotation */}
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                            <button
                                type="button"
                                onClick={rotateLeft}
                                className="p-2 hover:bg-white rounded-md transition-colors"
                                title="Rotate left 90°"
                            >
                                <RotateCcw className="w-4 h-4 text-gray-700" />
                            </button>
                            <span className="px-3 text-sm font-medium text-gray-700 min-w-[50px] text-center">
                                {transform.rotation}°
                            </span>
                            <button
                                type="button"
                                onClick={rotateRight}
                                className="p-2 hover:bg-white rounded-md transition-colors"
                                title="Rotate right 90°"
                            >
                                <RotateCw className="w-4 h-4 text-gray-700" />
                            </button>
                        </div>

                        {/* Reset */}
                        <button
                            type="button"
                            onClick={resetTransform}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                        >
                            Reset position
                        </button>
                    </div>
                )}

                {/* Tips */}
                {preview && isEditing ? (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                        <ul className="text-xs text-blue-900 space-y-1">
                            <li className="hidden sm:block">
                                • Drag the image to reposition
                            </li>
                            <li>• Use zoom to adjust the crop</li>
                            <li>
                                • Rotate for portrait images or different
                                orientation
                            </li>
                            <li>• Recommended: 1920x1080px or higher</li>
                        </ul>
                    </div>
                ) : preview && !isEditing ? (
                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-xs text-gray-600 text-center">
                            <strong>Current hero image.</strong> Click "Change
                            image" above to select a new one and adjust its
                            position.
                        </p>
                    </div>
                ) : (
                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-xs text-gray-600">
                            <strong>Hero image is optional.</strong> You can add
                            it now or skip and add photos directly to your
                            gallery. The hero image creates a beautiful header
                            for your gallery page.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
