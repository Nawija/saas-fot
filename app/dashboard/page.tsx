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
    Crown,
} from "lucide-react";
import MainButton from "@/components/buttons/MainButton";
import Loading from "@/components/ui/Loading";
import FooterDashboard from "@/components/ui/FooterDashboard";
import { useAuthUser } from "@/hooks";
import Hero from "@/components/Hero";

const features = [
    {
        icon: Images,
        title: "Collections",
        description: "Fast gallery management with drag & drop and previews.",
        href: "/dashboard/collections",
    },
    {
        icon: Palette,
        title: "Appearance",
        description:
            "Themes, templates and brand settings for your public pages.",
        href: "/dashboard/settings",
    },
    {
        icon: Share2,
        title: "Distribution",
        description: "Share public links, embed galleries and control privacy.",
        href: "/dashboard/share",
    },
    {
        icon: Sparkles,
        title: "AI Tools",
        description:
            "Auto-tag, suggest titles and write descriptions in one click.",
        href: "/dashboard/ai",
    },
];

const steps = [
    {
        number: "1",
        title: "Upload",
        description: "Add photos quickly.",
        icon: Upload,
    },
    {
        number: "2",
        title: "Organize",
        description: "Group by collections.",
        icon: Images,
    },
    {
        number: "3",
        title: "Style",
        description: "Choose a theme.",
        icon: Palette,
    },
    {
        number: "4",
        title: "Publish",
        description: "Share with the world.",
        icon: Share2,
    },
];

const benefits = [
    "Unlimited galleries",
    "Fast CDN delivery",
    "Custom domain",
    "Privacy controls",
    "Analytics",
    "Priority support",
];

export default function DashboardPage() {
    const { user, loading } = useAuthUser();

    const quickActions = [
        {
            icon: Images,
            label: "New gallery",
            description: "Create a gallery",
            href: "/dashboard/collections/new",
            variant: "primary" as const,
        },
        {
            icon: Upload,
            label: "Upload photos",
            description: "Add new images",
            href: "/dashboard/collections",
            variant: "success" as const,
        },
        {
            icon: Globe,
            label: "View site",
            description: "Open your public profile",
            href: user?.username
                ? `https://${encodeURIComponent(user.username)}.seovileo.pl/`
                : "/dashboard/profile",
            external: Boolean(user?.username),
            variant: "purple" as const,
        },
    ];

    if (loading) return <Loading />;
    if (!user) return <></>;

    return (
        <div className="min-h-screen bg-white text-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
                {/* Top split hero */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <Hero
                            badge="Subscription & Billing"
                            badgeIcon={<Crown className="w-4 h-4" />}
                            title="Build"
                            highlight="beautiful galleries"
                            className="mb-6"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-200"
                        >
                            <p className="mt-2 text-slate-600 max-w-2xl">
                                A modern dashboard to organize, style and share
                                your photography. New look, focused on clarity
                                and speed.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-3">
                                <MainButton
                                    href="/dashboard/collections/new"
                                    icon={<Images className="w-4 h-4" />}
                                    label="Create gallery"
                                />
                                <MainButton
                                    href="/dashboard/profile"
                                    icon={<Star className="w-4 h-4" />}
                                    label="Edit profile"
                                />
                            </div>

                            {/* Feature highlights */}
                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {features.map((f, i) => {
                                    const Icon = f.icon;
                                    return (
                                        <div
                                            key={i}
                                            className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-200 shadow-sm"
                                        >
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-slate-900">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">
                                                    {f.title}
                                                </h3>
                                                <p className="text-sm text-slate-600">
                                                    {f.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200"
                        >
                            <h3 className="text-lg font-semibold">
                                How it works
                            </h3>
                            <p className="text-sm text-gray-600">
                                Simple steps from upload to share.
                            </p>
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {steps.map((s, i) => (
                                    <div
                                        key={i}
                                        className="p-3 rounded-lg bg-gray-50 text-center"
                                    >
                                        <div className="w-8 h-8 mx-auto rounded-full bg-gray-400 text-white font-bold flex items-center justify-center">
                                            {s.number}
                                        </div>
                                        <div className="mt-2 text-sm font-medium">
                                            {s.title}
                                        </div>
                                        <div className="text-xs text-slate-600">
                                            {s.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right side quick actions */}
                    <motion.aside
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="space-y-8"
                    >
                        <div className="rounded-2xl p-4 bg-white border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-700">
                                Quick actions
                            </h4>
                            <p className="text-xs text-slate-600">
                                Most common tasks at a glance
                            </p>
                            <div className="mt-4 flex flex-col gap-3">
                                {quickActions.map((a, idx) => {
                                    const Icon = a.icon;
                                    return (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                                                    <Icon className="w-4 h-4 text-gray-700" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium">
                                                        {a.label}
                                                    </div>
                                                    <div className="text-xs text-slate-600">
                                                        {a.description}
                                                    </div>
                                                </div>
                                            </div>
                                            <MainButton
                                                href={a.href}
                                                target={
                                                    a.external
                                                        ? "_blank"
                                                        : "_self"
                                                }
                                                icon={
                                                    <ArrowRight className="w-4 h-4" />
                                                }
                                                label="Open"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-2xl p-4 bg-white border border-gray-200">
                            <h4 className="text-sm font-semibold">Support</h4>
                            <p className="text-xs text-gray-600">
                                Need help? Our team responds quickly.
                            </p>
                            <div className="mt-3">
                                <MainButton
                                    href="/support"
                                    icon={<Coffee className="w-4 h-4" />}
                                    label="Contact support"
                                />
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.05 }}
                            className="bg-white rounded-2xl p-6 border border-gray-200"
                        >
                            <h3 className="text-lg font-semibold">
                                Why choose us
                            </h3>
                            <ul className="mt-4 space-y-2 text-sm text-gray-600">
                                {benefits.map((b, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-2"
                                    >
                                        <div className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center">
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <span className="text-green-800">{b}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-6">
                                <MainButton
                                    href="/dashboard/billing#plans"
                                    icon={<Star className="w-4 h-4" />}
                                    label="View plans"
                                />
                            </div>
                        </motion.div>
                    </motion.aside>
                </div>
            </div>

            <FooterDashboard />
        </div>
    );
}
