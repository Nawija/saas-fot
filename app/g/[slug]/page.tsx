"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import LoadingGallery from "./loading";
import ResponsiveHeroImage from "@/components/gallery/hero/ResponsiveHeroImage";
import MainButton from "@/components/buttons/MainButton";

interface Collection {
    id: number;
    name: string;
    slug: string;
    description?: string;
    hero_image?: string;
    hero_image_mobile?: string;
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

// Helper function to get subdomain from hostname
const getSubdomain = (): string | null => {
    if (typeof window === "undefined") return null;
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname.match(/^\d+\.\d+\.\d+\.\d+/))
        return null;
    if (hostname.includes("seovileo.pl") && hostname !== "seovileo.pl") {
        return hostname.replace(".seovileo.pl", "");
    }
    return null;
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

                // Get subdomain from URL params or detect from hostname
                let subdomain = searchParams.get("subdomain");
                if (!subdomain) {
                    subdomain = getSubdomain();
                }
                console.log("🔍 Loading collection, subdomain:", subdomain);

                const apiUrl = subdomain
                    ? `/api/gallery/${slug}?subdomain=${subdomain}`
                    : `/api/gallery/${slug}`;

                console.log("📡 API URL:", apiUrl);

                const res = await fetch(apiUrl);
                const data = await res.json();

                if (data.ok) {
                    setCollection(data.collection);
                    if (data.collection.has_password) {
                        setShowPasswordPrompt(true);
                    } else {
                        // Redirect immediately if no password
                        setShowPasswordPrompt(false);
                        const photoParam = searchParams.get("photo");
                        let targetUrl = `/g/${slug}/p`;
                        if (subdomain) {
                            targetUrl;
                            if (photoParam) targetUrl += `&photo=${photoParam}`;
                        } else if (photoParam) {
                            targetUrl += `?photo=${photoParam}`;
                        }
                        console.log(
                            "✅ No password required, redirecting to:",
                            targetUrl
                        );
                        router.push(targetUrl);
                        return;
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
    }, [slug, searchParams, router]);

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

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            // Get subdomain from URL params or detect from hostname
            let subdomain = searchParams.get("subdomain");
            if (!subdomain) {
                subdomain = getSubdomain();
            }

            const verifyUrl = subdomain
                ? `/api/gallery/${slug}/verify?subdomain=${subdomain}`
                : `/api/gallery/${slug}/verify`;

            console.log("🔐 Verifying password...", {
                verifyUrl,
                subdomain,
                slug,
            });

            const res = await fetch(verifyUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            console.log("📡 Response status:", res.status);

            const data = await res.json();
            console.log("📦 Response data:", data);

            if (data.ok) {
                sessionStorage.setItem(`gallery_${slug}`, data.token);
                // Preserve photo parameter and subdomain if present
                const photoParam = searchParams.get("photo");
                let targetUrl = `/g/${slug}/p`;
                if (subdomain) {
                    targetUrl += `?subdomain=${subdomain}`;
                    if (photoParam) targetUrl += `&photo=${photoParam}`;
                } else if (photoParam) {
                    targetUrl += `?photo=${photoParam}`;
                }
                console.log("✅ Password correct, redirecting to:", targetUrl);
                router.push(targetUrl);
            } else {
                console.error("❌ Password verification failed:", data);
                setError(data.error || "Nieprawidłowe hasło");
            }
        } catch (error) {
            console.error("❌ Request error:", error);
            setError("Wystąpił błąd");
        }
    };

    if (loading) {
        return <LoadingGallery />;
    }

    if (error || !collection) {
        return (
            <div
                className="flex items-center justify-center p-4"
                style={{ minHeight: "100dvh" }}
            >
                <div className="text-center max-w-md mx-auto">
                    <div className="border border-white/10 rounded-2xl p-10 md:p-12">
                        <div className="mb-6">
                            <div className="w-16 h-16 mx-auto bg-red-700/10 rounded-full flex items-center justify-center mb-4">
                                <Lock
                                    className="w-8 h-8 text-red-900"
                                    strokeWidth={1.5}
                                />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-semibold mb-3 ">
                                {error || "Nie znaleziono galerii"}
                            </h1>
                            <p className=" text-sm leading-relaxed">
                                Sprawdź poprawność linku lub spróbuj ponownie
                                później
                            </p>
                        </div>
                        <MainButton
                            onClick={() => router.back()}
                            className="w-full px-6 py-2 font-medium"
                            variant="secondary"
                            label="Powrót"
                        />
                    </div>
                </div>
            </div>
        );
    }

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

    return (
        <div
            className="relative w-full flex items-center justify-center bg-black"
            style={{
                minHeight: "100dvh",
                height: "100dvh",
            }}
        >
            {showPasswordPrompt && collection.has_password && (
                <div className="absolute inset-0 z-10 h-full w-full overflow-hidden p-4">
                    {collection.hero_image && (
                        <ResponsiveHeroImage
                            desktop={collection.hero_image}
                            mobile={collection.hero_image_mobile}
                            alt={collection.name}
                            priority
                        />
                    )}
                </div>
            )}

            <div className="absolute inset-0 bg-linear-to-b z-20 from-black/20 via-black/40 backdrop-blur-md" />
            <div className="relative z-30 w-full py-12">
                {showPasswordPrompt &&
                    collection.has_password &&
                    renderPasswordPrompt()}
            </div>
        </div>
    );
}
