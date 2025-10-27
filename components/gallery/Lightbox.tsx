"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import type { Photo } from "@/types/gallery";

export interface LightboxProps {
    photos: Photo[];
    index: number;
    open: boolean;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
    onLike: (photoId: number) => void;
}

export default function Lightbox({
    photos,
    index,
    open,
    onClose,
    onPrev,
    onNext,
    onLike,
}: LightboxProps) {
    const [animating, setAnimating] = useState(false);
    const [shouldRender, setShouldRender] = useState(open);

    // Zoom & pan state
    const [zoomScale, setZoomScale] = useState(1);
    const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<{
        x: number;
        y: number;
        panX: number;
        panY: number;
    } | null>(null);
    const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(
        null
    );
    const containerRef = useRef<HTMLDivElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [isPinching, setIsPinching] = useState(false);
    const pinchStartDistanceRef = useRef(0);
    const pinchStartScaleRef = useRef(1);
    const pinchStartPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const pinchMidpointRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    // Mount/unmount with animation
    useEffect(() => {
        if (open) {
            setShouldRender(true);
            // Animate in
            setTimeout(() => setAnimating(false), 50);
            document.body.style.overflow = "hidden";
        } else if (shouldRender) {
            // Animate out then unmount
            setAnimating(true);
            const t = setTimeout(() => {
                setShouldRender(false);
                // Reset zoom state after unmount
                setZoomScale(1);
                setPan({ x: 0, y: 0 });
                document.body.style.overflow = "auto";
            }, 300);
            return () => clearTimeout(t);
        }
    }, [open]);

    // Reset zoom on photo change
    useEffect(() => {
        setZoomScale(1);
        setPan({ x: 0, y: 0 });
    }, [index]);

    // Keyboard navigation when visible
    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") onPrev();
            if (e.key === "ArrowRight") onNext();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose, onPrev, onNext]);

    const clampPan = (scale: number, next: { x: number; y: number }) => {
        const cw = containerRef.current?.clientWidth || window.innerWidth;
        const ch = containerRef.current?.clientHeight || window.innerHeight;
        const iw = imageRef.current?.clientWidth || cw;
        const ih = imageRef.current?.clientHeight || ch;
        const maxX = ((scale - 1) * iw) / 2;
        const maxY = ((scale - 1) * ih) / 2;
        return {
            x: Math.max(-maxX, Math.min(maxX, next.x)),
            y: Math.max(-maxY, Math.min(maxY, next.y)),
        };
    };

    const zoomAt = (clientX: number, clientY: number, nextScale: number) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) {
            setZoomScale(nextScale);
            return;
        }
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const offsetX = clientX - centerX;
        const offsetY = clientY - centerY;
        setPan((prev) =>
            clampPan(nextScale, {
                x: prev.x - offsetX * (nextScale - zoomScale),
                y: prev.y - offsetY * (nextScale - zoomScale),
            })
        );
        setZoomScale(nextScale);
    };

    if (!shouldRender || !photos[index]) return null;

    const current = photos[index];

    return (
        <div
            className={`fixed inset-0 bg-white flex items-center justify-center transition-opacity duration-300 ${
                animating ? "opacity-0" : "opacity-100"
            }`}
            style={{ zIndex: 9999 }}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className={`fixed top-4 right-4 p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition-all duration-300  z-10 ${
                    animating ? "opacity-0 scale-75" : "opacity-100 scale-100"
                }`}
                aria-label="Zamknij"
            >
                <X className="w-6 h-6 text-gray-500" />
            </button>

            {/* Navigation Arrows */}
            {photos.length > 1 && (
                <>
                    <button
                        onClick={onPrev}
                        className={`fixed left-6 top-1/2 -translate-y-1/2 p-4 z-10 ${
                            animating
                                ? "opacity-0 -translate-x-4"
                                : "opacity-100 translate-x-0"
                        }`}
                        aria-label="Poprzednie zdjęcie"
                    >
                        <ChevronLeft
                            className="w-12 h-12 text-zinc-800"
                            strokeWidth={1}
                        />
                    </button>
                    <button
                        onClick={onNext}
                        className={`fixed right-6 top-1/2 -translate-y-1/2 p-4 z-10 ${
                            animating
                                ? "opacity-0 translate-x-4"
                                : "opacity-100 translate-x-0"
                        }`}
                        aria-label="Następne zdjęcie"
                    >
                        <ChevronRight
                            className="w-12 h-12 text-zinc-800"
                            strokeWidth={1}
                        />
                    </button>
                </>
            )}

            {/* Photo Counter */}
            <div
                className={`fixed top-4 left-4 px-4 py-2 rounded-lg bg-gray-200 text-gray-500 font-medium  z-10 transition-all duration-300 ${
                    animating
                        ? "opacity-0 -translate-y-4"
                        : "opacity-100 translate-y-0"
                }`}
            >
                {index + 1} / {photos.length}
            </div>

            {/* Main Image Container */}
            <div
                ref={containerRef}
                className="w-full h-full flex items-center justify-center p-2 md:p-4 select-none"
                style={{ touchAction: "none" }}
                onDoubleClick={(e) => {
                    e.preventDefault();
                    const next = zoomScale > 1 ? 1 : 2.5;
                    zoomAt(e.clientX, e.clientY, next);
                }}
                onWheel={(e) => {
                    e.preventDefault();
                    const delta = -e.deltaY;
                    const factor = delta > 0 ? 1.1 : 0.9;
                    const next = Math.max(1, Math.min(4, zoomScale * factor));
                    zoomAt(e.clientX, e.clientY, next);
                }}
                onMouseDown={(e) => {
                    if (zoomScale === 1) return;
                    setIsDragging(true);
                    dragStartRef.current = {
                        x: e.clientX,
                        y: e.clientY,
                        panX: pan.x,
                        panY: pan.y,
                    };
                }}
                onMouseMove={(e) => {
                    if (!isDragging || !dragStartRef.current) return;
                    const dx = e.clientX - dragStartRef.current.x;
                    const dy = e.clientY - dragStartRef.current.y;
                    const next = {
                        x: dragStartRef.current.panX + dx,
                        y: dragStartRef.current.panY + dy,
                    };
                    setPan(clampPan(zoomScale, next));
                }}
                onMouseUp={() => {
                    setIsDragging(false);
                    dragStartRef.current = null;
                }}
                onMouseLeave={() => {
                    setIsDragging(false);
                    dragStartRef.current = null;
                }}
                onTouchStart={(e) => {
                    if (e.touches.length === 1) {
                        const t = e.touches[0];
                        // Double-tap detect
                        const now = Date.now();
                        if (
                            lastTapRef.current &&
                            now - lastTapRef.current.time < 300
                        ) {
                            // Double tap
                            if (zoomScale > 1) {
                                setZoomScale(1);
                                setPan({ x: 0, y: 0 });
                            } else {
                                setZoomScale(2.5);
                            }
                            lastTapRef.current = null;
                        } else {
                            lastTapRef.current = {
                                time: now,
                                x: t.clientX,
                                y: t.clientY,
                            };
                        }

                        if (zoomScale > 1) {
                            setIsDragging(true);
                            dragStartRef.current = {
                                x: t.clientX,
                                y: t.clientY,
                                panX: pan.x,
                                panY: pan.y,
                            };
                        }
                    }
                }}
                onTouchMove={(e) => {
                    // Pinch-zoom handling
                    if (e.touches.length === 2) {
                        setIsPinching(true);
                        const [t1, t2] = [e.touches[0], e.touches[1]];
                        const dx = t2.clientX - t1.clientX;
                        const dy = t2.clientY - t1.clientY;
                        const dist = Math.hypot(dx, dy);
                        if (pinchStartDistanceRef.current === 0) {
                            pinchStartDistanceRef.current = dist;
                            pinchStartScaleRef.current = zoomScale;
                            pinchStartPanRef.current = { ...pan };
                            const midX = (t1.clientX + t2.clientX) / 2;
                            const midY = (t1.clientY + t2.clientY) / 2;
                            pinchMidpointRef.current = { x: midX, y: midY };
                            return;
                        }

                        const ratio = dist / pinchStartDistanceRef.current;
                        const nextScale = Math.max(
                            1,
                            Math.min(4, pinchStartScaleRef.current * ratio)
                        );
                        // Zoom around midpoint
                        const rect =
                            containerRef.current?.getBoundingClientRect();
                        if (rect) {
                            const centerX = rect.left + rect.width / 2;
                            const centerY = rect.top + rect.height / 2;
                            const offsetX =
                                pinchMidpointRef.current.x - centerX;
                            const offsetY =
                                pinchMidpointRef.current.y - centerY;
                            const baseScale = pinchStartScaleRef.current;
                            const nextPan = clampPan(nextScale, {
                                x:
                                    pinchStartPanRef.current.x -
                                    offsetX * (nextScale - baseScale),
                                y:
                                    pinchStartPanRef.current.y -
                                    offsetY * (nextScale - baseScale),
                            });
                            setZoomScale(nextScale);
                            setPan(nextPan);
                        }
                        return;
                    }

                    if (!isDragging || !dragStartRef.current) return;
                    if (e.touches.length !== 1) return;
                    const t = e.touches[0];
                    const dx = t.clientX - dragStartRef.current.x;
                    const dy = t.clientY - dragStartRef.current.y;
                    const next = {
                        x: dragStartRef.current.panX + dx,
                        y: dragStartRef.current.panY + dy,
                    };
                    setPan(clampPan(zoomScale, next));
                }}
                onTouchEnd={(e) => {
                    if (e.touches.length < 2) {
                        // End pinch
                        setIsPinching(false);
                        pinchStartDistanceRef.current = 0;
                    }
                    if (e.touches.length === 0) {
                        setIsDragging(false);
                        dragStartRef.current = null;
                    }
                }}
            >
                <img
                    ref={imageRef}
                    src={current.file_path}
                    alt={`Zdjęcie ${index + 1}`}
                    draggable="false"
                    className={`max-w-full max-h-full object-contain will-change-transform ${
                        animating ? "opacity-0 scale-95" : "opacity-100"
                    }`}
                    style={{
                        maxHeight: "95vh",
                        maxWidth: "95vw",
                        transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoomScale})`,
                        transition:
                            isDragging || isPinching
                                ? "none"
                                : "transform 200ms ease",
                        cursor:
                            zoomScale > 1
                                ? isDragging
                                    ? "grabbing"
                                    : "grab"
                                : "zoom-in",
                    }}
                />
            </div>

            {/* Like Button */}
            <div
                className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-10 transition-all duration-300 ${
                    animating
                        ? "opacity-0 translate-y-4"
                        : "opacity-100 translate-y-0"
                }`}
            >
                <button
                    onClick={() => onLike(current.id)}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors  ${
                        current.isLiked
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                    }`}
                >
                    <Heart
                        className={`w-5 h-5 ${
                            current.isLiked ? "fill-current" : ""
                        }`}
                    />
                    {current.likes}
                </button>
            </div>
        </div>
    );
}
