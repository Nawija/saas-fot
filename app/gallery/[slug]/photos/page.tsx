"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import LoadingGallery from "@/components/ui/LoadingGallery";
import type { Photo, Collection } from "@/types/gallery";
import GalleryHero from "@/components/gallery/GalleryHero";
import { getPhotos as apiGetPhotos } from "@/lib/services/galleryService";
import Image from "next/image";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";

const PHOTOS_PER_PAGE = 20;

// helpers
const createEmptyColumns = (n: number) =>
    Array.from({ length: n }, () => [] as Photo[]);

const distributePhotosIntoColumns = (photos: Photo[], n: number) => {
    const cols = createEmptyColumns(n);
    const heights = new Array(n).fill(0);
    photos.forEach((p) => {
        const aspect = (p.height || 1) / (p.width || 1);
        let minIdx = 0;
        for (let i = 1; i < n; i++)
            if (heights[i] < heights[minIdx]) minIdx = i;
        cols[minIdx].push(p);
        heights[minIdx] += aspect;
    });
    return cols;
};

const flattenLeftToRight = (cols: Photo[][]) => {
    const arr: Photo[] = [];
    const maxLen = Math.max(...cols.map((c) => c.length));
    for (let row = 0; row < maxLen; row++) {
        for (let col = 0; col < cols.length; col++) {
            const p = cols[col]?.[row];
            if (p) arr.push(p);
        }
    }
    return arr;
};

const getPhotoIndexFromHash = (photos: Photo[]) => {
    if (typeof window === "undefined") return null;
    const match = window.location.hash.match(/\d+$/);
    if (!match) return null;
    const idx = parseInt(match[0], 10) - 1;
    return idx >= 0 && idx < photos.length ? idx : null;
};

const getPhotoIndexFromQuery = (photos: Photo[], paramName = "photo") => {
    if (typeof window === "undefined") return null;
    try {
        const params = new URL(window.location.href).searchParams;
        const val = params.get(paramName);
        if (!val) return null;
        const id = parseInt(val, 10);
        if (Number.isNaN(id)) return null;
        const idx = photos.findIndex((p) => p.id === id);
        return idx !== -1 ? idx : null;
    } catch (e) {
        return null;
    }
};

export default function GalleryPhotosPage() {
    const params = useParams();
    const router = useRouter();
    const [collection, setCollection] = useState<Collection | null>(null);
    const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
    const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [columnsCount, setColumnsCount] = useState(3);
    const [singleMode, setSingleMode] = useState(false);
    const [singlePhoto, setSinglePhoto] = useState<Photo | null>(null);
    const suppressScrollRef = useRef(false);

    const galleryRef = useRef<HTMLDivElement>(null);
    const lightboxRef = useRef<PhotoSwipeLightbox | null>(null);

    // responsive columns
    useEffect(() => {
        const updateCols = () => {
            const w = window.innerWidth;
            setColumnsCount(w < 640 ? 1 : w < 1024 ? 2 : 3);
        };
        updateCols();
        window.addEventListener("resize", updateCols);
        return () => window.removeEventListener("resize", updateCols);
    }, []);

    // fetch gallery
    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const token = sessionStorage.getItem(`gallery_${params.slug}`);
                const { ok, collection, photos, status } = await apiGetPhotos(
                    String(params.slug),
                    token ?? undefined
                );
                if (ok && collection && photos) {
                    const sorted = [...photos].sort((a, b) =>
                        a.file_path.localeCompare(b.file_path, undefined, {
                            numeric: true,
                        })
                    );
                    setCollection(collection);
                    setAllPhotos(sorted);
                    setDisplayedPhotos(sorted.slice(0, PHOTOS_PER_PAGE));
                    // jeśli jest ?photo=ID -> przejdź w tryb pojedynczego zdjęcia
                    try {
                        const val = new URL(
                            window.location.href
                        ).searchParams.get("photo");
                        if (val) {
                            const target = sorted.find(
                                (p) => String(p.id) === String(val)
                            );
                            if (target) {
                                setSingleMode(true);
                                setSinglePhoto(target);
                            }
                        }
                    } catch (e) {
                        // ignore
                    }
                } else if (status === 401) {
                    router.push(`/gallery/${params.slug}`);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchGallery();
    }, [params.slug, router]);

    // infinite scroll
    const handleScroll = useCallback(() => {
        if (isLoadingMore) return;
        const { scrollTop, scrollHeight, clientHeight } =
            document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 300) {
            setIsLoadingMore(true);
            setPage((prev) => prev + 1);
        }
    }, [isLoadingMore]);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        if (page === 1) return;
        const start = (page - 1) * PHOTOS_PER_PAGE;
        const nextBatch = allPhotos.slice(start, start + PHOTOS_PER_PAGE);
        if (nextBatch.length > 0) {
            setDisplayedPhotos((prev) => [...prev, ...nextBatch]);
        }
        setIsLoadingMore(false);
    }, [page, allPhotos]);

    // columns memoized
    const columns = useMemo(
        () => distributePhotosIntoColumns(displayedPhotos, columnsCount),
        [displayedPhotos, columnsCount]
    );

    // flat array for Lightbox
    const flatForHidden = useMemo(
        () =>
            flattenLeftToRight(
                distributePhotosIntoColumns(allPhotos, columnsCount)
            ),
        [allPhotos, columnsCount]
    );

    const openPhotoInLightbox = (id: string | number) => {
        const idx = flatForHidden.findIndex((p) => String(p.id) === String(id));
        const orderContainer = document.getElementById("pswp-order");
        const link = orderContainer?.querySelectorAll("a[data-photo-id]")[
            idx
        ] as HTMLAnchorElement | undefined;

        if (!link) return;

        // zapamiętaj aktualną pozycję scrolla
        const prevScrollY = window.scrollY || window.pageYOffset || 0;

        // kliknij link (otworzy lightbox)
        link.click();

        // natychmiast przywróć pozycję scrolla, żeby przeglądarka nie zdążyła przewinąć do linku
        // używamy requestAnimationFrame + setTimeout dla odporności na różne przeglądarki/frames
        requestAnimationFrame(() => {
            window.scrollTo(0, prevScrollY);
            // dodatkowe zabezpieczenie po kilku ms
            setTimeout(() => window.scrollTo(0, prevScrollY), 50);
        });

        // aktualizacja URL bez przewijania
        if (typeof window !== "undefined" && "history" in window) {
            try {
                const url = new URL(window.location.href);
                url.searchParams.set("photo", String(id));
                window.history.replaceState(null, "", url.toString());
            } catch {
                window.history.replaceState(
                    null,
                    "",
                    `${window.location.pathname}?photo=${id}`
                );
            }
        }
    };

    // init Lightbox
    useEffect(() => {
        // jeśli tryb pojedynczego zdjęcia — nie inicjujemy lightboxa (wyświetlamy tylko to zdjęcie)
        if (singleMode) return;

        const orderContainer = document.getElementById("pswp-order");
        if (!orderContainer) return;

        if (lightboxRef.current) lightboxRef.current.destroy();

        const lightbox = new PhotoSwipeLightbox({
            gallery: "#pswp-order",
            children: "a",
            pswpModule: () => import("photoswipe"),
            bgOpacity: 0.95,
            spacing: 0.1,
            loop: true,
        });

        lightbox.init();
        lightboxRef.current = lightbox;

        // Event aktualizacji URL przy zmianie zdjęcia -> sync z ?photo=ID
        lightbox.on("change", () => {
            const pswp = (lightbox as any).pswp; // instancja PhotoSwipe
            if (pswp && typeof pswp.currIndex === "number") {
                const idx = pswp.currIndex;
                const photo = flatForHidden?.[idx];
                if (photo) {
                    try {
                        const url = new URL(window.location.href);
                        url.searchParams.set("photo", String(photo.id));
                        window.history.replaceState(null, "", url.toString());
                    } catch (e) {
                        window.history.replaceState(
                            null,
                            "",
                            `${window.location.pathname}?photo=${photo.id}`
                        );
                    }
                }
            }
        });

        // jeśli ?photo=ID w URL -> otwórz odpowiednie zdjęcie od razu
        const idxFromQuery = getPhotoIndexFromQuery(flatForHidden, "photo");
        if (idxFromQuery !== null) {
            const link = orderContainer.querySelectorAll("a[data-photo-id]")[
                idxFromQuery
            ] as HTMLAnchorElement | undefined;
            if (link) setTimeout(() => link.click(), 50);
        }

        lightbox.on("close", () => {
            try {
                const pswp = (lightbox as any).pswp;
                let idx: number | null = null;
                if (pswp && typeof pswp.currIndex === "number") {
                    idx = pswp.currIndex;
                }

                let photoId: number | null = null;
                if (
                    idx !== null &&
                    typeof flatForHidden?.[idx] !== "undefined"
                ) {
                    photoId = flatForHidden[idx].id;
                } else {
                    // fallback: spróbuj odczytać z URL param "photo"
                    try {
                        const params = new URL(window.location.href)
                            .searchParams;
                        const val = params.get("photo");
                        if (val) {
                            const pid = parseInt(val, 10);
                            if (!Number.isNaN(pid)) photoId = pid;
                        }
                    } catch {
                        // ignore
                    }
                }

                // jeżeli mamy id zdjęcia -> przewiń do jego miniatury
                if (photoId !== null) {
                    // dajemy większy delay, żeby DOM zdążył ułożyć się po zamknięciu lightboxa i animacji
                    setTimeout(() => {
                        const el =
                            document.getElementById(`photo-id-${photoId}`) ||
                            (document.querySelector(
                                `[data-photo-id="${photoId}"]`
                            ) as HTMLElement | null);

                        if (el) {
                            // używamy smooth przewijania do centrum
                            el.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                            });
                        }
                    }, 500); // zwiększony delay z 120 na 500 ms
                }

                // usuń parametr z URL
                try {
                    const url = new URL(window.location.href);
                    url.searchParams.delete("photo");
                    window.history.replaceState(null, "", url.toString());
                } catch {
                    window.history.replaceState(
                        null,
                        "",
                        window.location.pathname
                    );
                }
            } catch {
                // ignore
            }
        });

        return () => lightbox.destroy();
    }, [columnsCount, flatForHidden]);

    if (loading) return <LoadingGallery />;

    if (!collection)
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Brak dostępu</h1>
                    <button
                        onClick={() => router.push(`/gallery/${params.slug}/photos`)}
                        className="text-white/70 hover:text-white"
                    >
                        Powrót do galerii
                    </button>
                </div>
            </div>
        );

    // Single-photo mode view
    if (singleMode && singlePhoto) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-4xl mb-6 flex items-center justify-start">
                    <button
                        onClick={() => router.push(`/gallery/${params.slug}`)}
                        className="px-4 py-2 bg-white/10 text-white rounded-md hover:bg-white/20"
                    >
                        Powrót do galerii
                    </button>
                </div>
                <div className="w-full flex-1 flex items-center justify-center">
                    <div className="w-full max-w-5xl">
                        <Image
                            src={singlePhoto.file_path}
                            alt={singlePhoto.file_path}
                            width={singlePhoto.width || 1200}
                            height={singlePhoto.height || 800}
                            className="w-full h-auto object-contain mx-auto"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <GalleryHero collection={collection} />
            <div className="min-h-screen bg-neutral-950 py-12 px-2">
                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-medium text-white mb-2">
                        {collection.name}
                    </h2>
                    <p className="text-white/60">
                        {allPhotos.length}{" "}
                        {allPhotos.length === 1 ? "zdjęcie" : "zdjęć"}
                    </p>
                </div>

                <div id="gallery" ref={galleryRef} className="flex gap-1">
                    {columns.length === 0 ? (
                        <div className="w-full text-center text-white/60 py-6">
                            Brak zdjęć
                        </div>
                    ) : (
                        columns.map((col, colIndex) => (
                            <div key={colIndex} className="flex-1 space-y-1">
                                {col.map((photo) => (
                                    <a
                                        id={`photo-id-${photo.id}`}
                                        key={photo.id}
                                        href={photo.file_path}
                                        data-pswp-src={photo.file_path}
                                        data-pswp-width={photo.width}
                                        data-pswp-height={photo.height}
                                        data-photo-id={photo.id}
                                        className="mb-1 block w-full group cursor-pointer overflow-hidden bg-neutral-900"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            openPhotoInLightbox(photo.id);
                                        }}
                                    >
                                        <div
                                            className="relative w-full"
                                            style={{
                                                aspectRatio: `${photo.width} / ${photo.height}`,
                                            }}
                                        >
                                            <Image
                                                src={photo.file_path}
                                                alt={`Photo ${photo.id}`}
                                                fill
                                                loading="lazy"
                                                className="object-cover transition-opacity duration-500 opacity-100"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ))
                    )}
                </div>

                {/* Hidden anchors for Lightbox */}
                <div
                    id="pswp-order"
                    style={{
                        position: "absolute",
                        left: -9999,
                        width: 1,
                        height: 1,
                        overflow: "hidden",
                    }}
                    aria-hidden
                >
                    {flatForHidden.map((photo) => (
                        <a
                            key={`hidden-${photo.id}`}
                            href={photo.file_path}
                            data-pswp-src={photo.file_path}
                            data-pswp-width={photo.width}
                            data-pswp-height={photo.height}
                            data-photo-id={photo.id}
                        />
                    ))}
                </div>

                {displayedPhotos.length < allPhotos.length && (
                    <div className="text-center text-white/70 py-6">
                        Ładowanie kolejnych zdjęć...
                    </div>
                )}
            </div>
        </>
    );
}
