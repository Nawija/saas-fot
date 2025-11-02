// components/ui/SafeImage.tsx
"use client";

import { useState, useEffect, useRef, CSSProperties } from "react";
import { AlertCircle } from "lucide-react";

interface SafeImageProps {
    src: string;
    alt: string;
    className?: string;
    fallbackSrc?: string;
    width?: number;
    height?: number;
    fill?: boolean;
    sizes?: string;
    priority?: boolean;
    quality?: number;
    objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
    loading?: "lazy" | "eager";
    onLoad?: () => void;
    onError?: () => void;
    showErrorState?: boolean;
    skeletonClassName?: string;
    errorMessage?: string;
    useIntersectionObserver?: boolean;
    intersectionMargin?: string;
    style?: CSSProperties;
}

/**
 * SafeImage - Production-ready image component with:
 * - Lazy loading with Intersection Observer
 * - Loading skeleton states
 * - Error handling and fallback support
 * - Progressive enhancement
 * - Mobile-optimized loading
 * - Automatic retry on error
 * - Smooth fade-in transitions
 */
export default function SafeImage({
    src,
    alt,
    className = "",
    fallbackSrc,
    width,
    height,
    fill = false,
    sizes,
    priority = false,
    quality = 75,
    objectFit = "cover",
    loading = "lazy",
    onLoad,
    onError,
    showErrorState = true,
    skeletonClassName = "bg-linear-to-br from-gray-200 via-gray-100 to-gray-200",
    errorMessage = "Failed to load image",
    useIntersectionObserver = true,
    intersectionMargin = "50px",
    style,
}: SafeImageProps) {
    const [imageState, setImageState] = useState<
        "loading" | "loaded" | "error"
    >(priority ? "loading" : "loading");
    const [currentSrc, setCurrentSrc] = useState(src);
    const [isVisible, setIsVisible] = useState(
        !useIntersectionObserver || priority
    );
    const imgRef = useRef<HTMLDivElement>(null);
    const retryCountRef = useRef(0);
    const MAX_RETRIES = 2;

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (!useIntersectionObserver || priority || isVisible) return;
        if (!imgRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: intersectionMargin,
                threshold: 0.01,
            }
        );

        observer.observe(imgRef.current);

        return () => observer.disconnect();
    }, [useIntersectionObserver, priority, isVisible, intersectionMargin]);

    // Update src when prop changes
    useEffect(() => {
        setCurrentSrc(src);
        setImageState("loading");
        retryCountRef.current = 0;
    }, [src]);

    const handleLoad = () => {
        setImageState("loaded");
        onLoad?.();
    };

    const handleError = () => {
        // Try fallback if available
        if (fallbackSrc && currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
            setImageState("loading");
            return;
        }

        // Retry loading original image
        if (retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current++;
            setTimeout(() => {
                setCurrentSrc(`${src}?retry=${retryCountRef.current}`);
                setImageState("loading");
            }, 1000 * retryCountRef.current); // Exponential backoff
            return;
        }

        // Give up
        setImageState("error");
        onError?.();
    };

    const containerClasses = `relative overflow-hidden ${className}`;

    return (
        <div ref={imgRef} className={containerClasses} style={style}>
            {/* Loading skeleton */}
            {imageState === "loading" && (
                <div
                    className={`absolute inset-0 ${skeletonClassName} animate-pulse`}
                />
            )}

            {/* Error state */}
            {imageState === "error" && showErrorState && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                    <AlertCircle size={32} className="mb-2" />
                    <span className="text-xs text-center px-2">
                        {errorMessage}
                    </span>
                </div>
            )}

            {/* Image - Native img for zero Vercel costs */}
            {isVisible && imageState !== "error" && (
                <img
                    src={currentSrc}
                    alt={alt}
                    loading={priority ? "eager" : "lazy"}
                    decoding="async"
                    className={`transition-opacity duration-300 ${
                        fill
                            ? "absolute inset-0 w-full h-full"
                            : width && height
                            ? ""
                            : "w-full h-auto"
                    } ${imageState === "loaded" ? "opacity-100" : "opacity-0"}`}
                    style={{
                        objectFit: fill ? objectFit : undefined,
                        width: !fill && width ? `${width}px` : undefined,
                        height: !fill && height ? `${height}px` : undefined,
                    }}
                    onLoad={handleLoad}
                    onError={handleError}
                />
            )}
        </div>
    );
}
