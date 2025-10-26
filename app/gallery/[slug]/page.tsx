"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/components/ui/Loading";
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

    const renderPasswordPrompt = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <form
                onSubmit={handlePasswordSubmit}
                className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20"
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
                    className="w-full px-6 py-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-gray-300 mb-4 focus:outline-none focus:ring-2 focus:ring-white/50 text-center text-lg"
                    autoFocus
                />
                {error && <p className="text-red-300 mb-4 text-sm">{error}</p>}
                <button
                    type="submit"
                    className="w-full px-8 py-4 bg-white text-gray-900 font-bold rounded-xl shadow-2xl hover:bg-gray-100 transition-all duration-300 text-lg"
                >
                    Wejdź do galerii
                </button>
            </form>
        </div>
    );

    const renderPrimaryAction = () => (
        <button
            onClick={handleViewGallery}
            className="inline-flex items-center hover:bg-white/20 hover:border-white/10 gap-1 bg-white/10 px-4 py-2 border border-white/30 text-white/80 hover:text-white"
        >
            <Eye size={20} />
            Zobacz jako gość
        </button>
    );

    const MinimalHero = () => (
        <div className="relative h-screen w-full overflow-hidden">
            <div className="absolute inset-0">
                {collection.hero_image ? (
                    <img
                        src={collection.hero_image}
                        alt={collection.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-gray-900 to-gray-700" />
                )}
                <div className="absolute inset-0 bg-black/80" />
            </div>
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">
                        {collection.name}
                    </h1>
                    {collection.description && (
                        <p className="text-xl md:text-2xl text-gray-200 mb-12 drop-shadow-lg">
                            {collection.description}
                        </p>
                    )}
                    {showPasswordPrompt && collection.has_password
                        ? renderPasswordPrompt()
                        : renderPrimaryAction()}
                </div>
            </div>
        </div>
    );

    const FullscreenHero = () => (
        <div className="relative h-screen w-full overflow-hidden">
            {collection.hero_image ? (
                <img
                    src={collection.hero_image}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-linear-to-br from-slate-800 to-slate-600" />
            )}
            <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/20 to-black/60" />
            <div className="absolute inset-0 flex items-center justify-center text-white px-6">
                <div className="text-center">
                    <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-6">
                        {collection.name}
                    </h1>
                    {collection.description && (
                        <p className="text-2xl md:text-3xl text-gray-200 mb-10 max-w-4xl mx-auto">
                            {collection.description}
                        </p>
                    )}
                    {showPasswordPrompt && collection.has_password
                        ? renderPasswordPrompt()
                        : renderPrimaryAction()}
                </div>
            </div>
        </div>
    );

    const SplitHero = () => (
        <div className="relative h-screen w-full grid grid-cols-1 md:grid-cols-2">
            <div className="relative order-2 md:order-1 flex items-center justify-center p-10 bg-white">
                <div className="max-w-lg">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                        {collection.name}
                    </h1>
                    {collection.description && (
                        <p className="text-lg md:text-xl text-gray-600 mb-8">
                            {collection.description}
                        </p>
                    )}
                    <div className="text-gray-800">
                        {showPasswordPrompt && collection.has_password ? (
                            renderPasswordPrompt()
                        ) : (
                            <button
                                onClick={handleViewGallery}
                                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
                            >
                                Zobacz zdjęcia
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="relative order-1 md:order-2">
                {collection.hero_image ? (
                    <img
                        src={collection.hero_image}
                        alt={collection.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-gray-700 to-gray-500" />
                )}
            </div>
        </div>
    );

    const OverlayHero = () => (
        <div className="relative h-screen w-full overflow-hidden">
            <div className="absolute inset-0">
                {collection.hero_image ? (
                    <img
                        src={collection.hero_image}
                        alt={collection.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-gray-900 to-gray-700" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
            </div>
            <div className="relative z-10 h-full flex flex-col items-center justify-end text-white px-6 pb-16">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow">
                        {collection.name}
                    </h1>
                    {collection.description && (
                        <p className="text-xl md:text-2xl text-gray-200 mb-8 drop-shadow">
                            {collection.description}
                        </p>
                    )}
                    {showPasswordPrompt && collection.has_password
                        ? renderPasswordPrompt()
                        : renderPrimaryAction()}
                </div>
            </div>
        </div>
    );

    const GradientHero = () => (
        <div className="relative h-screen w-full bg-linear-to-br from-gray-900 via-slate-800 to-gray-700 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                    {collection.hero_image ? (
                        <img
                            src={collection.hero_image}
                            alt={collection.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-linear-to-br from-slate-600 to-slate-400" />
                    )}
                </div>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(transparent,rgba(0,0,0,0.5))]" />
            <div className="relative z-10 h-full flex flex-col items-center justify-end text-white px-6 pb-16">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow">
                        {collection.name}
                    </h1>
                    {collection.description && (
                        <p className="text-lg md:text-2xl text-gray-200 mb-8 drop-shadow">
                            {collection.description}
                        </p>
                    )}
                    {showPasswordPrompt && collection.has_password
                        ? renderPasswordPrompt()
                        : renderPrimaryAction()}
                </div>
            </div>
        </div>
    );

    switch (template) {
        case "fullscreen":
            return <FullscreenHero />;
        case "split":
            return <SplitHero />;
        case "overlay":
            return <OverlayHero />;
        case "gradient":
            return <GradientHero />;
        case "cards":
            // Tymczasowo użyj split jako zbliżony styl
            return <SplitHero />;
        case "minimal":
        default:
            return <MinimalHero />;
    }
}
