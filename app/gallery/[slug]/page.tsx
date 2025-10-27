"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/components/ui/Loading";
import { getGalleryHeroTemplate } from "@/components/gallery/hero/registry";
import { Eye, Lock } from "lucide-react";

interface Collection {
    id: number;
    name: string;
    slug: string;
    description?: string;
    hero_image?: string;
    hero_template?: string;
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
                // Zapisz token dostępu w sessionStorage
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
        return <Loading />;
    }

    if (error || !collection) {
        return (
            <div className="h-screen flex items-center justify-center bg-black text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">
                        {error || "Nie znaleziono galerii"}
                    </h1>
                    <p className="text-gray-400">
                        Sprawdź czy link jest prawidłowy
                    </p>
                </div>
            </div>
        );
    }

    const template = collection.hero_template || "minimal";
    const HeroTemplate = getGalleryHeroTemplate(template);

    const renderPasswordPrompt = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <form
                onSubmit={handlePasswordSubmit}
                className="max-w-sm mx-auto bg-black/60 rounded-xl p-8 border border-white/20"
            >
                <Lock className="w-12 h-12 mx-auto mb-4 text-white" />
                <h3 className="text-2xl font-bold mb-2">
                    Galeria chroniona hasłem
                </h3>
                <p className="text-gray-300 mb-6">
                    Wprowadź hasło aby zobaczyć zdjęcia
                </p>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Wprowadź hasło"
                    className="w-full px-6 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-gray-300 mb-4 focus:outline-none focus:ring-2 focus:ring-white/50 text-center text-lg"
                    autoFocus
                />
                {error && <p className="text-red-300 mb-4 text-sm">{error}</p>}
                <button
                    type="submit"
                    className="w-full px-8 py-2 bg-white text-gray-900 font-bold rounded-xl shadow-2xl hover:bg-gray-100 transition-all duration-300 text-lg"
                >
                    Wejdź do galerii
                </button>
            </form>
        </div>
    );

    const renderPrimaryAction = () => (
        <button
            onClick={handleViewGallery}
            className="inline-flex items-center hover:bg-white/80 hover:border-black/20 gap-1 bg-white/90 px-6 py-3 border border-black/30 text-gray-800 hover:text-gray-700 font-semibold rounded transition"
        >
            <Eye size={20} />
            Zobacz jako gość
        </button>
    );

    // Unified render using existing templates but hiding their titles/buttons
    return (
        <div className="relative h-screen w-full overflow-hidden">
            {/* Render template inside a scoped container that hides text/buttons */}
            <div className="absolute inset-0">
                <div className="hero-landing-scope relative h-full w-full">
                    {HeroTemplate({
                        data: {
                            name: collection.name,
                            description: collection.description,
                            image: collection.hero_image,
                        },
                        elements: {},
                        options: {
                            disableAnimations: true,
                        },
                    })}
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

            {/* Center overlay with password form or view button */}
            <div className="absolute inset-0 z-10 flex items-center justify-center text-white px-4">
                <div className="max-w-md w-full flex items-center justify-center">
                    {showPasswordPrompt && collection.has_password
                        ? renderPasswordPrompt()
                        : renderPrimaryAction()}
                </div>
            </div>
        </div>
    );
}
