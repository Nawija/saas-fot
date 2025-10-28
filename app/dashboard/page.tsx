import { getUser } from "@/lib/auth/getUser";
import UnauthenticatedView from "@/components/dashboard/UnauthenticatedView";
import Link from "next/link";
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
} from "lucide-react";
import MainButton from "@/components/buttons/MainButton";
import PricingCards from "@/components/pricing/PricingCards";

export default async function DashboardPage() {
    const user = await getUser();

    if (!user) {
        return <UnauthenticatedView />;
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

    const plans = [
        {
            name: "Basic",
            price: "$19",
            features: [
                "10 GB storage",
                "All hero templates",
                "Password protection",
                "Unlimited galleries",
            ],
        },
        {
            name: "Pro",
            price: "$39",
            features: [
                "50 GB storage",
                "Priority support",
                "Custom domain (soon)",
                "Advanced analytics",
            ],
            popular: true,
        },
        {
            name: "Unlimited",
            price: "$99",
            features: [
                "200 GB storage",
                "White-label (no logo)",
                "API access",
                "Dedicated account manager",
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-linear-to-r from-blue-50 via-pink-50 to-indigo-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl font-semibold mb-4">
                            Welcome 👋 <br />
                            <span>{user.name ? `${user.name}` : ""}!</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            A professional platform for creating and sharing
                            photo galleries. Perfect for photographers, event
                            managers, and content creators.
                        </p>
                        <div className="flex flex-col w-3/4 mx-auto sm:flex-row gap-4 justify-center">
                            <MainButton
                                href="/dashboard/collections"
                                icon={<Images className="w-5 h-5 mr-2" />}
                                label="Create gallery"
                            />

                            <MainButton
                                href="/dashboard/billing"
                                variant="secondary"
                                icon={<Crown className="w-5 h-5 mr-2" />}
                                label="Premium plan"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Features Grid */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                        Everything you need
                    </h2>
                    <p className="text-gray-600 text-center mb-10">
                        Features that make sharing photos simple and
                        professional
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                                        <Icon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Start */}
                <div className="my-16 bg-white rounded-xl p-8 border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        Quick start in 3 steps
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                1
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Create a gallery
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Click "Galleries" and add a new photo collection
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                2
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Pick a style
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Customize the hero and choose a font
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                3
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Share
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Copy the link and send it to your clients
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pricing Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                        Plans to fit your needs
                    </h2>
                    <p className="text-gray-600 text-center mb-10">
                        Start for free or choose Premium for more power
                    </p>
                    <div className="py-12">
                        <PricingCards />
                    </div>
                    <p className="text-center text-sm text-gray-600">
                        Free plan: 2 GB storage • All basic features • No credit
                        card required
                    </p>
                </div>

                {/* Support Section */}
                <div className="bg-linear-to-tr from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-300">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="w-16 h-16 bg-orange-100 border border-orange-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Coffee className="w-8 h-8 text-orange-800" />
                        </div>
                        <h2 className="text-2xl font-bold text-orange-800 mb-3">
                            Support the project ❤️
                        </h2>
                        <p className="text-gray-700 mb-6 leading-relaxed">
                            Seovileo is an independent project built with
                            passion. If you like the platform and want to help
                            us develop new features (custom domains,
                            white-label, integrations), consider subscribing to
                            Premium. Every bit of support helps us build even
                            better tools for you.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <MainButton
                                href="/dashboard/billing"
                                icon={<Crown className="w-5 h-5" />}
                                label="Subscribe"
                                variant="success"
                            />
                            <MainButton
                                href="https://www.buymeacoffee.com/seovileo"
                                target="_blank"
                                icon={<Coffee className="w-5 h-5" />}
                                label="Buy me a coffee"
                                variant="secondary"
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
