"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Eye, Lock } from "lucide-react";
import LoadingGallery from "../loading";

interface Collection {
    id: number;
    name: string;
    slug: string;
    description?: string;
    hero_image?: string;
    hero_template?: string;
    hero_font?: string;
    is_public: boolean;
    has_password: boolean;
}

const FONT_MAP: Record<string, { href: string; family: string }> = {
    inter: {
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
        family: "'Inter', sans-serif",
    },
    playfair: {
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap",
        family: "'Playfair Display', serif",
    },
    poppins: {
        href: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap",
        family: "'Poppins', sans-serif",
    },
};

export default function GalleryLandingPage() {
    const params = useParams<{ slug: string }>();
    const router = useRouter();
    const searchParams = useSearchParams();
    const slug = params.slug;
    const [collection, setCollection] = useState<Collection | null>(null);
    const [loading, setLoading] = useState(true);
    const [password, setPassword] = useState("");
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!slug) return;

        const loadCollection = async () => {
            try {
                setLoading(true);

                // Sprawdź czy jest subdomena w parametrach URL
                const subdomain = searchParams.get("subdomain");
                const apiUrl = subdomain
                    ? `/api/gallery/${slug}?subdomain=${subdomain}`
                    : `/api/gallery/${slug}`;

                const res = await fetch(apiUrl);
                const data = await res.json();

                if (data.ok) {
                    setCollection(data.collection);
                    if (data.collection.has_password) {
                        setShowPasswordPrompt(true);
                    } else {
                        setShowPasswordPrompt(false);
                    }
                    setError("");
                } else {
                    setError("Nie znaleziono galerii");
                    setCollection(null);
                }
            } catch (error) {
                console.error("Error:", error);
                setError("Wystąpił błąd");
                setCollection(null);
            } finally {
                setLoading(false);
            }
        };

        void loadCollection();
    }, [slug, searchParams]);

    useEffect(() => {
        if (!collection?.hero_font) return;
        const font = FONT_MAP[collection.hero_font as keyof typeof FONT_MAP];
        if (!font) return;
        const id = "gallery-font-link";
        let link = document.getElementById(id) as HTMLLinkElement | null;
        if (!link) {
            link = document.createElement("link");
            link.id = id;
            link.rel = "stylesheet";
            document.head.appendChild(link);
        }
        link.href = font.href;
    }, [collection?.hero_font]);

    const handleViewGallery = () => {
        if (collection?.has_password && !showPasswordPrompt) {
            setShowPasswordPrompt(true);
        } else {
            // Preserve photo parameter if present
            const photoParam = searchParams.get("photo");
            const targetUrl = photoParam
                ? `/g/${slug}/p?photo=${photoParam}`
                : `/g/${slug}/p`;
            router.push(targetUrl);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch(`/api/gallery/${slug}/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (data.ok) {
                sessionStorage.setItem(`gallery_${slug}`, data.token);
                // Preserve photo parameter if present
                const photoParam = searchParams.get("photo");
                const targetUrl = photoParam
                    ? `/g/${slug}/p?photo=${photoParam}`
                    : `/g/${slug}/p`;
                router.push(targetUrl);
            } else {
                setError("Nieprawidłowe hasło");
            }
        } catch (error) {
            setError("Wystąpił błąd");
        }
    };

    if (loading) {
        return <LoadingGallery />;
    }

    if (error || !collection) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
                <div className="text-center max-w-md mx-auto">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 md:p-12 shadow-2xl">
                        <h1 className="text-3xl md:text-4xl font-medium mb-4 text-white">
                            {error || "Nie znaleziono galerii"}
                        </h1>
                        <p className="text-white/70">
                            Sprawdź poprawność linku
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const template = collection.hero_template || "minimal";
    const fontKey = collection.hero_font || "inter";
    const fontFamily = FONT_MAP[fontKey]?.family || FONT_MAP.inter.family;

    const renderPasswordPrompt = () => (
        <div className="w-full max-w-md mx-auto px-3">
            <div className="bg-white/10 backdrop-blur-xl border-2 border-white/20 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="p-10 md:p-12" style={{ fontFamily }}>
                    <div className="flex justify-center mb-8">
                        <div className="w-14 h-14 bg-white/20 flex items-center justify-center border-2 border-white/20">
                            <Lock
                                className="w-6 h-6 text-white"
                                strokeWidth={1.5}
                            />
                        </div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-medium text-center mb-3 text-white">
                        Galeria prywatna
                    </h3>
                    <p className="text-white/70 text-center mb-8 text-sm">
                        Wprowadź hasło, aby uzyskać dostęp
                    </p>
                    <form onSubmit={handlePasswordSubmit} className="space-y-3">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Hasło"
                            className="w-full px-5 py-3 bg-white/10 border-2 border-white/30 text-white placeholder-white/50 text-center focus:outline-none focus:bg-white/15 focus:border-white transition-all duration-200"
                            autoFocus
                        />
                        {error && (
                            <p className="text-red-300 text-sm text-center">
                                {error}
                            </p>
                        )}
                        <button
                            type="submit"
                            className="group relative w-full px-4 py-3 bg-white text-black font-semibold overflow-hidden hover:bg-neutral-100 active:scale-[0.99] transition-all duration-200"
                        >
                            <span className="relative z-10">
                                Wejdź do galerii
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );

    const renderViewButton = () => (
        <div className="w-full max-w-2xl mx-auto text-center px-4">
            <div className="space-y-12" style={{ fontFamily }}>
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-white leading-tight tracking-tight">
                        {collection.name}
                    </h1>
                    {collection.description && (
                        <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
                            {collection.description}
                        </p>
                    )}
                </div>
                <div>
                    <button
                        onClick={handleViewGallery}
                        className="group relative inline-flex items-center justify-center gap-3 border border-white/90 text-white/90 hover:text-neutral-900 px-8 w-max py-3 font-semibold text-base overflow-hidden hover:bg-neutral-100 active:scale-[0.99] transition-all duration-300"
                    >
                        <span className="relative z-10 flex items-center gap-3 text-sm lg:text-base">
                            <Eye size={22} strokeWidth={2} />
                            <span>Zobacz galerię</span>
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    </button>
                </div>
            </div>
        </div>
    );

    const getBackgroundStyle = () => {
        const hasHeroImage = collection.hero_image;

        if (!hasHeroImage) {
            return {
                background: "black",
            };
        }

        return {
            backgroundImage: `url(${collection.hero_image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
        };
    };

    return (
        <div
            className="relative min-h-screen w-full flex items-center justify-center p-4"
            style={getBackgroundStyle()}
        >
            <div className="absolute inset-0 bg-black/80" />
            <div className="relative z-10 w-full py-12">
                {showPasswordPrompt && collection.has_password
                    ? renderPasswordPrompt()
                    : renderViewButton()}
            </div>
        </div>
    );
}
