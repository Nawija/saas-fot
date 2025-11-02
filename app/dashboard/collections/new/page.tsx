"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Globe } from "lucide-react";
import { toast } from "sonner";
import MainButton from "@/components/buttons/MainButton";
import UpgradeDialog from "@/components/ui/UpgradeDialog";
import HeroImageEditor from "@/components/dashboard/HeroImageEditor";

export default function NewCollectionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [userPlan, setUserPlan] = useState<string>("free");
    const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
    const [upgradeContext, setUpgradeContext] = useState({
        title: "Feature available on higher plans",
        description: "",
        feature: "",
    });
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        password: "",
        is_public: true,
    });
    const [heroImage, setHeroImage] = useState<File | null>(null);

    useEffect(() => {
        // Fetch user plan
        fetch("/api/user/me")
            .then((res) => (res.ok ? res.json() : Promise.reject(res)))
            .then((data) => {
                if (data.user?.subscription_plan) {
                    setUserPlan(data.user.subscription_plan);
                }
            })
            .catch(() => {
                // leave default "free" if it couldn't be fetched
            });
    }, []);

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();
    };

    const checkSlugAvailability = async (slug: string): Promise<string> => {
        try {
            const res = await fetch(
                `/api/collections/check-slug?slug=${encodeURIComponent(slug)}`
            );
            const data = await res.json();

            if (data.available) {
                return slug;
            }

            // Slug zajęty, generuj unikalny
            let counter = 1;
            let uniqueSlug = `${slug}-${counter}`;

            while (true) {
                const checkRes = await fetch(
                    `/api/collections/check-slug?slug=${encodeURIComponent(
                        uniqueSlug
                    )}`
                );
                const checkData = await checkRes.json();

                if (checkData.available) {
                    return uniqueSlug;
                }

                counter++;
                uniqueSlug = `${slug}-${counter}`;

                // Zabezpieczenie przed nieskończoną pętlą
                if (counter > 100) {
                    return `${slug}-${Date.now()}`;
                }
            }
        } catch (error) {
            console.error("Error checking slug:", error);
            // W przypadku błędu, dodaj timestamp
            return `${slug}-${Date.now()}`;
        }
    };

    const handleNameChange = (name: string) => {
        const baseSlug = generateSlug(name);
        setFormData({
            ...formData,
            name,
            slug: baseSlug,
        });
    };

    const handleImageReady = (file: File) => {
        setHeroImage(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Verify slug availability one more time before submission
            const finalSlug = await checkSlugAvailability(formData.slug);
            if (finalSlug !== formData.slug) {
                setFormData((prev) => ({ ...prev, slug: finalSlug }));
                toast.info(
                    `Slug changed to "${finalSlug}" to ensure uniqueness`
                );
            }

            // STEP 1: Create collection (without hero image)
            const res = await fetch("/api/collections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    slug: finalSlug,
                    hero_image: "", // Empty for now
                }),
            });

            const data = await res.json();

            console.log("Collection creation response:", {
                status: res.status,
                data,
            });

            if (!res.ok || !data.ok) {
                // Check if it's an upgrade-required error
                if (res.status === 403 && data.upgradeRequired) {
                    setUpgradeContext({
                        title: data.error || "Feature unavailable",
                        description:
                            data.message ||
                            "This feature requires a higher plan.",
                        feature:
                            data.error === "Osiągnięto limit galerii"
                                ? "More galleries"
                                : "Password protection",
                    });
                    setUpgradeDialogOpen(true);
                } else {
                    toast.error(
                        data.error || data.message || "Error creating gallery"
                    );
                }
                setLoading(false);
                return;
            }

            const collectionId = data.collection.id;

            // STEP 2: Upload hero image if present (with collectionId)
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

                if (!uploadRes.ok) {
                    if (
                        uploadRes.status === 413 &&
                        uploadData.upgradeRequired
                    ) {
                        toast.error("Out of space", {
                            description:
                                uploadData.message ||
                                "Storage limit exceeded. Redirecting to upgrade...",
                        });
                        router.push("/dashboard/billing");
                        return;
                    }
                    toast.error(uploadData.error || "Hero image upload failed");
                    return;
                }

                if (uploadData.ok) {
                    // STEP 3: Update collection with hero image URLs (desktop + mobile)
                    await fetch(`/api/collections/${collectionId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            hero_image: uploadData.url,
                            hero_image_mobile: uploadData.urlMobile,
                        }),
                    });

                    // STEP 4: Update storage_used
                    const storageRes = await fetch("/api/user/update-storage", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            size: uploadData.size,
                        }),
                    });

                    const storageData = await storageRes.json();

                    if (
                        !storageRes.ok &&
                        storageRes.status === 413 &&
                        storageData.upgradeRequired
                    ) {
                        toast.error("Out of space", {
                            description:
                                storageData.message ||
                                "Storage limit exceeded. Redirecting to upgrade...",
                        });
                        router.push("/dashboard/billing");
                        return;
                    }
                }
            }

            // Redirect to collection page (to add photos)
            router.push(`/dashboard/collections/${collectionId}`);
        } catch (error) {
            console.error("Error:", error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Header */}
                <Link
                    href="/dashboard/collections"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to galleries
                </Link>

                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                    New photo gallery
                </h1>
                <p className="text-gray-600 text-lg mb-10">
                    Create a beautiful gallery and share it with your clients
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Hero Image Editor */}
                    <HeroImageEditor onImageReady={handleImageReady} />

                    {/* Basic Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Gallery name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) =>
                                    handleNameChange(e.target.value)
                                }
                                placeholder="e.g. Anna & Tom - Wedding"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                URL (slug)
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                    https://seovileo.pl/g/
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
                                    placeholder="anna-tom-wedding"
                                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                This link will be shared with clients. If slug
                                exists, a unique number will be added
                                automatically.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Description (optional)
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Short description of the gallery..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Privacy settings
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
                                    <div className="font-semibold">Public</div>
                                    <div className="text-xs text-gray-500">
                                        Anyone with the link can view
                                    </div>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (userPlan === "free") {
                                        setUpgradeContext({
                                            title: "Password-protected gallery",
                                            description:
                                                "Password protection is available starting from the Basic plan. Please upgrade to use it.",
                                            feature: "Password protection",
                                        });
                                        setUpgradeDialogOpen(true);
                                        return;
                                    }
                                    setFormData({
                                        ...formData,
                                        is_public: false,
                                    });
                                }}
                                disabled={userPlan === "free"}
                                className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                                    !formData.is_public
                                        ? "border-blue-500 bg-blue-50"
                                        : userPlan === "free"
                                        ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <Lock className="w-5 h-5" />
                                <div className="text-left">
                                    <div className="flex items-center gap-2">
                                        <div className="font-semibold">
                                            Password-protected
                                        </div>
                                        {userPlan === "free" && (
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded">
                                                Basic+
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {userPlan === "free"
                                            ? "Available starting from Basic"
                                            : "Requires an access password"}
                                    </div>
                                </div>
                            </button>
                        </div>

                        {!formData.is_public && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Access password
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
                                    placeholder="e.g. AnnaAndTom2024"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    The password your clients will use
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex items-center gap-4">
                        <MainButton
                            type="submit"
                            disabled={loading}
                            loading={loading}
                            loadingText="Creating..."
                            label="Create gallery"
                            className="w-full"
                        />
                        <MainButton
                            href="/dashboard/collections"
                            label="Cancel"
                            variant="secondary"
                            className="w-full"
                        />
                    </div>
                </form>

                <UpgradeDialog
                    open={upgradeDialogOpen}
                    onClose={() => setUpgradeDialogOpen(false)}
                    title={upgradeContext.title}
                    description={upgradeContext.description}
                    feature={upgradeContext.feature}
                />
            </div>
        </div>
    );
}
