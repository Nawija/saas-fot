import { getUser } from "@/lib/auth/getUser";
import UnauthenticatedView from "@/components/dashboard/UnauthenticatedView";
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
    CheckCircle2,
    ArrowRight,
    Upload,
    Link2,
    Shield,
    Sparkles,
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

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section - Clean and welcoming */}
            <div className="relative overflow-hidden bg-linear-to-br from-blue-50 via-white to-indigo-50 border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 mb-6">
                            <Images className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
                            Welcome to Your Dashboard
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Create stunning photo galleries in minutes and share
                            them with your clients professionally
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <MainButton
                                href="/dashboard/collections"
                                label="Create Your First Gallery"
                                variant="primary"
                                className="text-lg px-8 py-3"
                            />
                            <MainButton
                                href="/dashboard/billing"
                                label="Explore Premium"
                                variant="secondary"
                                className="text-lg px-8 py-3"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
                {/* How to Use Section */}
                <div className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            How to use Seovileo
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            From upload to share — simple steps to deliver your
                            photos professionally
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        <HowToCard
                            number="1"
                            icon={<Upload className="w-6 h-6" />}
                            title="Create & Upload"
                            description="Go to Collections, create a new gallery, and upload your photos. We handle optimization automatically."
                        />
                        <HowToCard
                            number="2"
                            icon={<Palette className="w-6 h-6" />}
                            title="Customize Style"
                            description="Choose a hero template, adjust colors, and set privacy options like password protection."
                        />
                        <HowToCard
                            number="3"
                            icon={<Link2 className="w-6 h-6" />}
                            title="Share Link"
                            description="Copy the gallery link and send it to your clients. They can view and download photos instantly."
                        />
                    </div>
                    <div className="bg-blue-50 rounded-2xl p-6 sm:p-8 border border-blue-100">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="shrink-0">
                                <Sparkles className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Pro Tip: Use Collections to organize
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Create separate collections for different
                                    clients or events. Each collection can have
                                    its own style and privacy settings.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Grid - Simplified */}
                <div className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            What you can do
                        </h2>
                        <p className="text-lg text-gray-600">
                            Powerful features to manage and share your photos
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-gray-50 rounded-xl p-6 hover:bg-white hover:shadow-md border border-gray-100 hover:border-blue-200 transition-all"
                                >
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                                        <Icon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Premium Benefits Section */}
                <div className="mb-20">
                    <div className="bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-8 sm:p-12 border border-indigo-100">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-100 text-indigo-600 mb-4">
                                <Crown className="w-7 h-7" />
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                                Unlock Premium Benefits
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Get more storage, advanced features, and
                                priority support
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <PremiumBenefit
                                icon={<Shield className="w-5 h-5" />}
                                title="Password Protection"
                                description="Secure your galleries with passwords for private clients"
                            />
                            <PremiumBenefit
                                icon={<Images className="w-5 h-5" />}
                                title="Unlimited Galleries"
                                description="Create as many collections as you need without limits"
                            />
                            <PremiumBenefit
                                icon={<Zap className="w-5 h-5" />}
                                title="No Watermarks"
                                description="Professional galleries without Seovileo branding"
                            />
                            <PremiumBenefit
                                icon={<Download className="w-5 h-5" />}
                                title="Full Resolution"
                                description="Clients download photos in original quality"
                            />
                            <PremiumBenefit
                                icon={<Palette className="w-5 h-5" />}
                                title="All Hero Templates"
                                description="Access to all 7 premium hero styles"
                            />
                            <PremiumBenefit
                                icon={<Heart className="w-5 h-5" />}
                                title="Priority Support"
                                description="Get help faster with dedicated support"
                            />
                        </div>
                        <div className="text-center">
                            <MainButton
                                href="/dashboard/billing"
                                label="View Premium Plans"
                                variant="primary"
                                className="text-lg px-8 py-3"
                            />
                            <p className="text-sm text-gray-600 mt-4">
                                Start with a free 7-day trial • Cancel anytime
                            </p>
                        </div>
                    </div>
                </div>

                {/* Support Section - Redesigned */}
                <div className="bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl p-8 sm:p-12 border border-orange-200 shadow-sm">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-6">
                            <Coffee className="w-8 h-8 text-orange-600" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Love Seovileo? Support Us! ❤️
                        </h2>
                        <p className="text-lg text-gray-700 mb-8 leading-relaxed max-w-2xl mx-auto">
                            Seovileo is built by a small team passionate about
                            helping photographers. Your support helps us add new
                            features like custom domains, white-label options,
                            and integrations. Every subscription matters!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                            <MainButton
                                href="/dashboard/billing"
                                label="Upgrade to Premium"
                                variant="primary"
                                className="text-lg px-8 py-3"
                            />
                            <MainButton
                                href="https://www.buymeacoffee.com/seovileo"
                                target="_blank"
                                label="Buy us a coffee"
                                variant="secondary"
                                className="text-lg px-8 py-3"
                            />
                        </div>
                        <p className="text-sm text-gray-600">
                            Can't upgrade? Share Seovileo with other
                            photographers — that helps too! 🙏
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Helper Components
function HowToCard({
    number,
    icon,
    title,
    description,
}: {
    number: string;
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
                    {number}
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    {icon}
                </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
                {description}
            </p>
        </div>
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
        <div className="bg-white rounded-xl p-5 border border-indigo-100 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    {icon}
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                        {title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}
