"use client";

import { useEffect, useState } from "react";
import { User } from "@/types/avatar";
import {
    Images,
    Palette,
    Share2,
    Lock,
    Heart,
    Download,
    Smartphone,
    Zap,
    Crown,
    Coffee,
    Upload,
    Link2,
    Shield,
    Sparkles,
    Gem,
} from "lucide-react";
import MainButton from "@/components/buttons/MainButton";
import Loading from "@/components/ui/Loading";

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await fetch("/api/user/me");
            const data = await res.json();
            if (data.ok) {
                setUser(data.user);
            }
        } catch (error) {
            console.error("Error fetching user:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center bg-white rounded-2xl p-12 shadow-lg border border-gray-200">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Login required
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Please sign in to view your dashboard
                    </p>
                </div>
            </div>
        );
    }

    const features = [
        {
            icon: Images,
            title: "Unlimited galleries",
            description:
                "Create beautiful photo galleries for clients, family, or events.",
        },
        {
            icon: Palette,
            title: "7 hero styles",
            description:
                "Choose from ready-made templates — from minimal to cinematic.",
        },
        {
            icon: Share2,
            title: "Easy sharing",
            description:
                "One link to the gallery — share with clients without hassle.",
        },
        {
            icon: Lock,
            title: "Password protection",
            description:
                "Protect private galleries with a password only for selected viewers.",
        },
        {
            icon: Heart,
            title: "Likes system",
            description:
                "Guests can mark favorite photos without registration.",
        },
        {
            icon: Download,
            title: "ZIP download",
            description:
                "Clients can download selected photos or the entire gallery in one click.",
        },
        {
            icon: Smartphone,
            title: "Responsive design",
            description:
                "Galleries look great on phones, tablets, and desktops.",
        },
        {
            icon: Zap,
            title: "Fast loading",
            description:
                "Image optimization and CDN ensure blazing-fast delivery.",
        },
    ];

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30">
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-linear-to-br from-orange-100 via-yellow-50 to-red-50 border-b border-gray-200">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-size-[20px_20px]"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                            <Gem className="w-4 h-4 text-gray-800" />
                            <span className="text-xs font-semibold text-gray-800">
                                Dashboard
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                            Welcome to Your Dashboard
                        </h1>
                        <p className="text-sm sm:text-base text-gray-800/90 max-w-2xl mx-auto">
                            Create stunning photo galleries and share them
                            professionally
                        </p>
                    </div>
                </div>
            </div>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Quick Actions Card */}
                <div className="mb-6 sm:mb-8 max-w-5xl mx-auto">
                    <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
                        <div className="bg-linear-to-br from-orange-50/50 via-yellow-50/50 to-red-50/50 p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                                        <Sparkles className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-orange-600 mb-1">
                                            Quick Start
                                        </p>
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                                            Get Started with Seovileo
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            Create your first gallery in minutes
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6">
                            <div className="grid sm:grid-cols-3 gap-4">
                                <QuickActionCard
                                    number="1"
                                    icon={<Upload className="w-5 h-5" />}
                                    title="Create & Upload"
                                    description="Start a new gallery and upload photos"
                                    href="/dashboard/collections"
                                />
                                <QuickActionCard
                                    number="2"
                                    icon={<Palette className="w-5 h-5" />}
                                    title="Customize Style"
                                    description="Choose templates and adjust colors"
                                    href="/dashboard/collections"
                                />
                                <QuickActionCard
                                    number="3"
                                    icon={<Link2 className="w-5 h-5" />}
                                    title="Share Link"
                                    description="Copy and send to your clients"
                                    href="/dashboard/collections"
                                />
                            </div>
                        </div>

                        <div className="p-4 sm:p-5 border-t border-orange-100 bg-linear-to-br from-teal-50/30 to-emerald-50/30">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                                    <Sparkles className="w-5 h-5 text-teal-500" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-800 mb-1">
                                        Pro Tip: Use Collections to organize
                                    </h4>
                                    <p className="text-xs text-gray-600">
                                        Create separate collections for
                                        different clients or events. Each can
                                        have its own style and privacy settings.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mb-6 sm:mb-8">
                    <div className="text-center mb-6 sm:mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 px-3">
                            What you can do
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                            Powerful features to manage and share your photos
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 hover:border-yellow-200 hover:shadow-md transition-all"
                                >
                                    <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center mb-3 shadow-sm">
                                        <Icon className="w-5 h-5 text-yellow-500" />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-800 mb-1.5">
                                        {feature.title}
                                    </h3>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Premium Benefits Section */}
                <div className="mb-6 sm:mb-8">
                    <div className="bg-linear-to-br from-emerald-50/50 via-green-50/50 to-teal-50/50 rounded-xl p-5 sm:p-6 border border-emerald-100 overflow-hidden">
                        <div className="text-center mb-5 sm:mb-6">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-3 shadow-sm">
                                <Crown className="w-6 h-6 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                                Unlock Premium Benefits
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                                Get more storage, advanced features, and
                                priority support
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
                            <PremiumBenefit
                                icon={<Shield className="w-4 h-4" />}
                                title="Password Protection"
                                description="Secure galleries with passwords"
                            />
                            <PremiumBenefit
                                icon={<Images className="w-4 h-4" />}
                                title="Unlimited Galleries"
                                description="Create as many as you need"
                            />
                            <PremiumBenefit
                                icon={<Zap className="w-4 h-4" />}
                                title="No Watermarks"
                                description="Professional galleries"
                            />
                            <PremiumBenefit
                                icon={<Download className="w-4 h-4" />}
                                title="Full Resolution"
                                description="Original quality downloads"
                            />
                            <PremiumBenefit
                                icon={<Palette className="w-4 h-4" />}
                                title="All Hero Templates"
                                description="Access to all 7 styles"
                            />
                            <PremiumBenefit
                                icon={<Heart className="w-4 h-4" />}
                                title="Priority Support"
                                description="Get help faster"
                            />
                        </div>

                        <div className="text-center">
                            <MainButton
                                href="/dashboard/billing"
                                label="View Premium Plans"
                                variant="primary"
                            />
                            <p className="text-xs text-gray-600 mt-3">
                                Start with a free 7-day trial • Cancel anytime
                            </p>
                        </div>
                    </div>
                </div>

                {/* Support Section */}
                <div className="bg-linear-to-br from-orange-50/80 via-amber-50/80 to-yellow-50/80 rounded-xl p-5 sm:p-6 border border-orange-200">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-3 shadow-sm">
                            <Coffee className="w-6 h-6 text-orange-600" />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                            Love Seovileo? Support Us! ❤️
                        </h3>
                        <p className="text-sm sm:text-base text-gray-700 mb-5 leading-relaxed">
                            Seovileo is built by a small team passionate about
                            helping photographers. Your support helps us add new
                            features like custom domains, white-label options,
                            and integrations.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
                            <MainButton
                                href="/dashboard/billing"
                                label="Upgrade to Premium"
                                variant="primary"
                            />
                            <MainButton
                                href="https://www.buymeacoffee.com/seovileo"
                                target="_blank"
                                label="Buy us a coffee"
                                variant="secondary"
                            />
                        </div>
                        <p className="text-xs text-gray-600">
                            Can't upgrade? Share Seovileo with other
                            photographers — that helps too! 🙏
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

// Helper Components
function QuickActionCard({
    number,
    icon,
    title,
    description,
    href,
}: {
    number: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    href: string;
}) {
    return (
        <a
            href={href}
            className="block bg-linear-to-br from-gray-50 to-orange-50/30 rounded-lg p-4 border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all group"
        >
            <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-orange-400 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {number}
                </div>
                <div className="w-8 h-8 rounded-lg bg-white text-orange-500 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    {icon}
                </div>
            </div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">{title}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
                {description}
            </p>
        </a>
    );
}

function PremiumBenefit({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-emerald-100 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-800 mb-0.5">
                        {title}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}
