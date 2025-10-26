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

    return (
        <div className="relative h-screen w-full overflow-hidden">
            {/* Hero Image Background */}
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
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/80" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
                <div className="max-w-3xl mx-auto text-center">
                    {/* Title */}
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg animate-in fade-in slide-in-from-top-4 duration-700">
                        {collection.name}
                    </h1>

                    {/* Description */}
                    {collection.description && (
                        <p className="text-xl md:text-2xl text-gray-200 mb-12 drop-shadow-lg animate-in fade-in slide-in-from-top-4 duration-700 delay-150">
                            {collection.description}
                        </p>
                    )}

                    {/* Password Prompt or Button */}
                    {showPasswordPrompt && collection.has_password ? (
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
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Wprowadź hasło"
                                    className="w-full px-6 py-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-gray-300 mb-4 focus:outline-none focus:ring-2 focus:ring-white/50 text-center text-lg"
                                    autoFocus
                                />
                                {error && (
                                    <p className="text-red-300 mb-4 text-sm">
                                        {error}
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    className="w-full px-8 py-4 bg-white text-gray-900 font-bold rounded-xl shadow-2xl hover:bg-gray-100 transition-all duration-300 text-lg"
                                >
                                    Wejdź do galerii
                                </button>
                            </form>
                        </div>
                    ) : (
                        <button
                            onClick={handleViewGallery}
                            className="inline-flex items-center hover:bg-white/20 hover:border-white/10 gap-1 bg-white/10 px-4 py-2 border border-white/30 text-white/80 hover:text-white"
                        >
                            <Eye size={20} />
                            Zobacz jako gość
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
