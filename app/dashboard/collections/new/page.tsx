"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Lock, Globe } from "lucide-react";

export default function NewCollectionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        password: "",
        is_public: true,
    });
    const [heroImage, setHeroImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();
    };

    const handleNameChange = (name: string) => {
        setFormData({
            ...formData,
            name,
            slug: generateSlug(name),
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setHeroImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // KROK 1: Utwórz kolekcję (bez hero image)
            const res = await fetch("/api/collections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    hero_image: "", // Puste na razie
                }),
            });

            const data = await res.json();

            if (!data.ok) {
                alert(data.error || "Błąd tworzenia galerii");
                return;
            }

            const collectionId = data.collection.id;

            // KROK 2: Upload hero image jeśli jest (z collectionId)
            if (heroImage) {
                const imageFormData = new FormData();
                imageFormData.append("file", heroImage);
                imageFormData.append("type", "hero");
                imageFormData.append("collectionId", collectionId.toString());

                const uploadRes = await fetch("/api/collections/upload", {
                    method: "POST",
                    body: imageFormData,
                });

                const uploadData = await uploadRes.json();

                if (uploadData.ok) {
                    // KROK 3: Zaktualizuj kolekcję z hero image URL
                    await fetch(`/api/collections/${collectionId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            hero_image: uploadData.url,
                        }),
                    });

                    // KROK 4: Zaktualizuj storage_used
                    await fetch("/api/user/update-storage", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            size: uploadData.size,
                        }),
                    });
                }
            }

            // Przekieruj do strony kolekcji (z możliwością dodania zdjęć)
            router.push(`/dashboard/collections/${collectionId}`);
        } catch (error) {
            console.error("Error:", error);
            alert("Wystąpił błąd");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Header */}
                <Link
                    href="/dashboard/collections"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Powrót do galerii
                </Link>

                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                    Nowa galeria zdjęć
                </h1>
                <p className="text-gray-600 text-lg mb-10">
                    Stwórz piękną galerię i podziel się nią ze swoimi klientami
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Hero Image Upload */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Zdjęcie główne (Hero Image)
                        </label>
                        <div className="relative">
                            {preview ? (
                                <div className="relative h-64 rounded-xl overflow-hidden group">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <label className="cursor-pointer px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg">
                                            Zmień zdjęcie
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-colors bg-gray-50">
                                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                    <span className="text-sm font-medium text-gray-600">
                                        Kliknij aby dodać zdjęcie
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1">
                                        To zdjęcie będzie wyświetlane na całym
                                        ekranie
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Nazwa galerii *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) =>
                                    handleNameChange(e.target.value)
                                }
                                placeholder="np. Ania & Tomek - Ślub"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Adres URL (slug)
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                    /gallery/
                                </span>
                                <input
                                    type="text"
                                    required
                                    value={formData.slug}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            slug: e.target.value,
                                        })
                                    }
                                    placeholder="ania-tomek-slub"
                                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Ten link będzie udostępniany klientom
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Opis (opcjonalny)
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Krótki opis galerii..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Ustawienia prywatności
                        </h3>

                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() =>
                                    setFormData({
                                        ...formData,
                                        is_public: true,
                                    })
                                }
                                className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                                    formData.is_public
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <Globe className="w-5 h-5" />
                                <div className="text-left">
                                    <div className="font-semibold">
                                        Publiczna
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Każdy z linkiem może zobaczyć
                                    </div>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setFormData({
                                        ...formData,
                                        is_public: false,
                                    })
                                }
                                className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                                    !formData.is_public
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <Lock className="w-5 h-5" />
                                <div className="text-left">
                                    <div className="font-semibold">
                                        Z hasłem
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Wymaga hasła dostępu
                                    </div>
                                </div>
                            </button>
                        </div>

                        {!formData.is_public && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Hasło dostępu
                                </label>
                                <input
                                    type="text"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password: e.target.value,
                                        })
                                    }
                                    placeholder="np. AniaITomek2024"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Hasło, które otrzymają Twoi klienci
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex items-center gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {loading ? "Tworzenie..." : "Utwórz galerię"}
                        </button>
                        <Link
                            href="/dashboard/collections"
                            className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                        >
                            Anuluj
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
