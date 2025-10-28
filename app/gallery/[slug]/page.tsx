"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getGalleryHeroTemplate } from "@/components/gallery/hero/registry";
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

export default function GalleryLandingPage() {
    const params = useParams();
    const router = useRouter();
    const [collection, setCollection] = useState<Collection | null>(null);
    const [loading, setLoading] = useState(true);
    const [password, setPassword] = useState("");
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCollection();
    }, []);

    useEffect(() => {
        if (!collection?.hero_font) return;
        const FONT_MAP: Record<string, { href: string }> = {
            inter: {
                href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap",
            },
            playfair: {
                href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap",
            },
            poppins: {
                href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap",
            },
        };
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

    const fetchCollection = async () => {
        try {
            const res = await fetch(`/api/gallery/${params.slug}`);
            const data = await res.json();

            if (data.ok) {
                setCollection(data.collection);
                if (data.collection.has_password) {
                    setShowPasswordPrompt(true);
                }
            } else {
                setError("Nie znaleziono galerii");
            }
        } catch (error) {
            console.error("Error:", error);
            setError("Wystąpił błąd");
        } finally {
            setLoading(false);
        }
    };

    const handleViewGallery = () => {
        if (collection?.has_password && !showPasswordPrompt) {
            setShowPasswordPrompt(true);
        } else {
            router.push(`/gallery/${params.slug}/photos`);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch(`/api/gallery/${params.slug}/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (data.ok) {
                sessionStorage.setItem(`gallery_${params.slug}`, data.token);
                router.push(`/gallery/${params.slug}/photos`);
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
            <div className="h-screen flex items-center justify-center bg-black text-white">
                <div className="text-center tracking-tight">
                    <h1 className="text-3xl font-semibold mb-3">
                        {error || "Nie znaleziono galerii"}
                    </h1>
                    <p className="text-neutral-500 text-sm uppercase">
                        Sprawdź poprawność linku
                    </p>
                </div>
            </div>
        );
    }

    const template = collection.hero_template || "minimal";
    const HeroTemplate = getGalleryHeroTemplate(template);
    const fontKey = collection.hero_font || "inter";
    const FONT_FAMILY: Record<string, string> = {
        inter: "'Inter', sans-serif",
        playfair: "'Playfair Display', serif",
        poppins: "'Poppins', sans-serif",
    };

    const renderPasswordPrompt = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 w-full">
            <form
                onSubmit={handlePasswordSubmit}
                className="max-w-sm mx-auto bg-black/70 border border-neutral-700 p-10 backdrop-blur-md text-center"
            >
                <Lock className="w-10 h-10 mx-auto mb-6 text-white/90" />
                <h3 className="text-xl font-semibold mb-1">Galeria prywatna</h3>
                <p className="text-neutral-400 text-sm mb-8">
                    Wprowadź hasło, aby uzyskać dostęp
                </p>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Hasło"
                    className="w-full px-5 py-3 bg-black border border-neutral-700 text-white placeholder-neutral-500 text-center focus:outline-none focus:border-white transition"
                    autoFocus
                />
                {error && (
                    <p className="text-red-400 text-sm mt-3 mb-4">{error}</p>
                )}
                <button
                    type="submit"
                    className="w-full mt-4 px-6 py-3 bg-white text-black font-medium tracking-wide uppercase text-sm border border-white hover:bg-transparent hover:text-white transition-all"
                >
                    Wejdź
                </button>
            </form>
        </div>
    );

    const renderPrimaryAction = () => (
        <button
            onClick={handleViewGallery}
            className="inline-flex items-center justify-center gap-2 bg-transparent border border-white px-8 py-3 text-white uppercase tracking-wide text-sm hover:bg-white hover:text-black transition-all duration-300"
        >
            <Eye size={18} />
            Zobacz jako gość
        </button>
    );

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black">
            <div className="absolute inset-0 bg-black/70 lg:bg-black/80 z-10" />
            <div className="absolute inset-0">
                <div className="hero-landing-scope relative h-full w-full">
                    <div style={{ fontFamily: FONT_FAMILY[fontKey] }}>
                        {HeroTemplate({
                            data: {
                                name: collection.name,
                                description: collection.description,
                                image: collection.hero_image,
                            },
                            elements: {},
                            options: { disableAnimations: true },
                        })}
                    </div>
                </div>
                <style jsx global>{`
                    .hero-landing-scope h1,
                    .hero-landing-scope h2,
                    .hero-landing-scope p,
                    .hero-landing-scope a,
                    .hero-landing-scope button {
                        display: none !important;
                    }
                `}</style>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center text-white px-4">
                <div className="max-w-md w-full">
                    {showPasswordPrompt && collection.has_password
                        ? renderPasswordPrompt()
                        : renderPrimaryAction()}
                </div>
            </div>
        </div>
    );
}
