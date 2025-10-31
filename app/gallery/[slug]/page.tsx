"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

// Konfiguracja fontów
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

    // Załaduj wybrany font
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

    // Renderowanie formularza hasła
    const renderPasswordPrompt = () => (
        <div className="w-full max-w-md mx-auto px-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="p-10 md:p-12" style={{ fontFamily }}>
                    <div className="flex justify-center mb-8">
                        <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
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
                    <form onSubmit={handlePasswordSubmit} className="space-y-5">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Hasło"
                            className="w-full px-5 py-3.5 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-white/50 text-center focus:outline-none focus:bg-white/15 focus:border-white/50 transition-all duration-200"
                            autoFocus
                        />
                        {error && (
                            <p className="text-red-300 text-sm text-center">
                                {error}
                            </p>
                        )}
                        <button
                            type="submit"
                            className="w-full px-6 py-3.5 bg-white text-black font-medium rounded-2xl hover:bg-white/95 active:scale-[0.98] transition-all duration-200 shadow-lg"
                        >
                            Wejdź do galerii
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );

    // Renderowanie przycisku "Zobacz"
    const renderViewButton = () => (
        <div className="w-full max-w-2xl mx-auto text-center px-4">
            <div className="space-y-8" style={{ fontFamily }}>
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-white leading-tight tracking-tight">
                        {collection.name}
                    </h1>
                    {collection.description && (
                        <p className="text-white/80 text-lg md:text-xl leading-relaxed max-w-xl mx-auto">
                            {collection.description}
                        </p>
                    )}
                </div>
                <div>
                    <button
                        onClick={handleViewGallery}
                        className="inline-flex items-center justify-center gap-2.5 bg-white text-black px-10 py-4 rounded-full font-medium text-base hover:bg-white/95 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl"
                    >
                        <Eye size={20} strokeWidth={2} />
                        <span>Zobacz galerię</span>
                    </button>
                </div>
            </div>
        </div>
    );

    // Funkcja do wyboru stylu tła
    const getBackgroundStyle = () => {
        const hasHeroImage = collection.hero_image;

        if (!hasHeroImage) {
            // Bez hero image - elegancki gradient
            return {
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            };
        }

        // Z hero image
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
            {/* Premium overlay */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Subtelna tekstura */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage:
                        'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E")',
                }}
            />

            {/* Zawartość */}
            <div className="relative z-10 w-full py-12">
                {showPasswordPrompt && collection.has_password
                    ? renderPasswordPrompt()
                    : renderViewButton()}
            </div>
        </div>
    );
}
