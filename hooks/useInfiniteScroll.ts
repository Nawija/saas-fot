"use client";

import { useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
    enabled?: boolean;
    hasMore: boolean;
    loadingMore: boolean;
    rootMargin?: string;
    threshold?: number;
    onLoadMore: () => void;
}

export function useInfiniteScroll({
    enabled = true,
    hasMore,
    loadingMore,
    rootMargin = "200px",
    threshold = 0.1,
    onLoadMore,
}: UseInfiniteScrollOptions) {
    const triggerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!enabled) return;
        const el = triggerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && hasMore && !loadingMore) {
                    onLoadMore();
                }
            },
            { root: null, rootMargin, threshold }
        );

        observer.observe(el);
        return () => observer.unobserve(el);
    }, [enabled, hasMore, loadingMore, rootMargin, threshold, onLoadMore]);

    return { triggerRef } as const;
}
