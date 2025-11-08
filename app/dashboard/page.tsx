"use client";

import { motion } from "framer-motion";
import {
    Images,
    Palette,
    Share2,
    Coffee,
    Upload,
    Shield,
    Sparkles,
    Globe,
    ArrowRight,
    Check,
    Star,
} from "lucide-react";
import Hero from "@/components/Hero";
import MainButton from "@/components/buttons/MainButton";
import Loading from "@/components/ui/Loading";
import FooterDashboard from "@/components/ui/FooterDashboard";
import { useAuthUser } from "@/hooks";

const features = [
    {
        icon: Images,
        title: "Create galleries",
        description:
            "Manage your photos in elegant galleries. Add, edit and organize your collections in seconds.",
        color: "blue",
        href: "/dashboard/collections",
    },
    {
        icon: Palette,
        title: "Customize look",
        description:
            "Adjust your profile and galleries to your preferences. Choose templates, colors and layouts.",
        color: "blue",
        href: "/dashboard/settings",
    },
    {
        icon: Share2,
        title: "Share content",
        description:
            "Share your galleries with the world. Generate links, control privacy and track statistics.",
        color: "blue",
        href: "/dashboard/share",
    },
    {
        icon: Sparkles,
        title: "AI Generator",
        description:
            "Use artificial intelligence to automatically generate descriptions and tags for your photos.",
        color: "blue",
        href: "/dashboard/ai",
    },
];

const steps = [
    {
        number: "1",
        title: "Upload photos",
        description:
            "Start by uploading your best photos. We support all popular formats.",
        icon: Upload,
    },
    {
        number: "2",
        title: "Organize in collections",
        description:
            "Create themed galleries and organize your photos according to your own criteria.",
        icon: Images,
    },
    {
        number: "3",
        title: "Personalize",
        description:
            "Customize the look of your profile and gallery to your own style and brand.",
        icon: Palette,
    },
    {
        number: "4",
        title: "Share with world",
        description:
            "Publish your galleries and share them with audiences around the world.",
        icon: Share2,
    },
];

const benefits = [
    "Unlimited galleries",
    "High quality images",
    "Own domain",
    "Advanced statistics",
    "24/7 technical support",
    "Regular updates",
];

export default function DashboardPage() {
    const { user, loading } = useAuthUser();

    const quickActions = [
        {
            icon: Images,
            label: "Create collection",
            description: "Create a new gallery from your photos",
            href: "/dashboard/collections",
            variant: "primary" as const,
        },
        {
            icon: Upload,
            label: "Edit profile",
            description: "Settings and customize your public profile",
            href: "/dashboard/profile",
            variant: "success" as const,
        },
        {
            icon: Globe,
            label: "Your public brand",
            description: "View your public profile domain",
            // jeśli username jest dostępny => zbuduj bezpieczny URL do subdomeny,
            // w przeciwnym razie kieruj do profilu w dashboardzie (fallback)
            href: user?.username
                ? `https://${encodeURIComponent(user.username)}.seovileo.pl/`
                : "/dashboard/profile",
            // zaznacz, że to zewnętrzny link (użyte przy renderowaniu)
            external: Boolean(user?.username),
            variant: "purple" as const,
        },
    ];

    if (loading) {
        return <Loading />;
    }

    if (!user) {
        return <></>;
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-20">
                {/* Hero Section */}
                <Hero
                    badge="Welcome back!"
                    badgeIcon={<Sparkles className="w-4 h-4" />}
                    title="Your platform for"
                    highlight="beautiful galleries"
                    subtitle={
                        "Create, organize and share your photos professionally. Everything you need in one place."
                    }
                    cta={[
                        {
                            label: "Create gallery",
                            href: "/dashboard/collections/new",
                            variant: "purple",
                            icon: <Images className="w-5 h-5" />,
                            className: "text-lg px-8 py-2",
                        },
                    ]}
                />

                {/* Quick Actions */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="space-y-8"
                >
                    <div className="text-center space-y-3">
                        <h2 className="text-3xl sm:text-4xl font-bold">
                            Quick actions
                        </h2>
                        <p className="text-lg text-gray-600">
                            Get started in seconds
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {quickActions.map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: 0.2 + index * 0.1,
                                    }}
                                    className="group"
                                >
                                    <div className="h-full bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-4">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            {action.label}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed mb-4">
                                            {action.description}
                                        </p>
                                        <MainButton
                                            href={action.href}
                                            target={
                                                action.external
                                                    ? "_blank"
                                                    : "_self"
                                            }
                                            variant={action.variant}
                                            icon={
                                                <ArrowRight className="w-4 h-4" />
                                            }
                                            label="Go"
                                            className="text-sm"
                                        />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.section>

                {/* Main Features */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="py-20 px-4 sm:px-6 bg-white border border-gray-200 rounded-2xl -mx-4 xl:-mx-80"
                >
                    <div className="max-w-6xl mx-auto space-y-12">
                        <div className="text-center space-y-3">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
                                Everything you need
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Professional photo delivery made simple
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.4,
                                            delay: 0.3 + index * 0.1,
                                        }}
                                        className="text-center"
                                    >
                                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 mb-4">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </motion.section>

                {/* How it works */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="space-y-12 py-6"
                >
                    <div className="text-center space-y-3">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
                            How it works
                        </h2>
                        <p className="text-lg text-gray-600">
                            Four simple steps to success
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: 0.4 + index * 0.1,
                                    }}
                                    className="text-center"
                                >
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-xl mb-4">
                                        {step.number}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {step.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.section>

                {/* Benefits Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="py-20 px-4 sm:px-6 bg-blue-50 -mx-4 md:-mx-80"
                >
                    <div className="max-w-3xl mx-auto text-center space-y-8">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
                                Start free, upgrade when ready
                            </h2>
                            <p className="text-lg text-gray-600 mt-4 px-12">
                                Free plan includes 3 galleries. Upgrade for
                                unlimited galleries, password protection, and no
                                watermarks.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: 0.5 + index * 0.05,
                                    }}
                                    className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                                >
                                    <div className="shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Check className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span className="font-medium text-gray-800">
                                        {benefit}
                                    </span>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                            <MainButton
                                href="/dashboard/collections/new"
                                variant="primary"
                                icon={<Star className="w-5 h-5" />}
                                label="Start now"
                                className="text-lg px-8 py-3"
                            />
                            <a
                                href="/dashboard/billing#plans"
                                className="text-blue-700 font-medium hover:text-blue-800 transition-colors"
                            >
                                View pricing →
                            </a>
                        </div>
                    </div>
                </motion.section>

                {/* Support Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="text-center space-y-6 py-16 px-4 sm:px-6 -mx-4 sm:-mx-6"
                >
                    <Shield className="w-12 h-12 mx-auto text-yellow-500 fill-yellow-400" />
                    <h2 className="text-3xl sm:text-4xl font-bold">
                        Need help?
                    </h2>
                    <p className="text-lg max-w-2xl mx-auto">
                        Our support team is always ready to help you. Contact us
                        anytime.
                    </p>
                    <MainButton
                        href="/support"
                        variant="orange"
                        icon={<Coffee className="w-5 h-5" />}
                        label="Help Center"
                        className="text-lg px-8 py-3"
                    />
                </motion.section>
            </div>

            <FooterDashboard />
        </div>
    );
}
