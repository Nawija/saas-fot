import MainButton from "@/components/buttons/MainButton";
import Logo from "@/components/navbar/Logo";
import {
    Camera,
    Lock,
    Download,
    Zap,
    CheckCircle2,
    Users,
    Globe,
    Star,
} from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Seovileo - Online photo galleries for photographers | Share, protect with password, deliver fast",
    description:
        "Beautiful, fast photo galleries for photographers. Share with clients, protect with passwords, auto WebP, ZIP downloads and subscription management. Free plan with watermark.",
    alternates: { canonical: "/" },
    openGraph: {
        title: "Seovileo - Online photo galleries for photographers",
        description:
            "Create and deliver professional galleries: password protection, WebP, ZIP download, hero templates and more.",
        siteName: "Seovileo",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Seovileo - Online photo galleries for photographers",
        description:
            "Share private galleries with clients, protect with passwords, optimize images and offer ZIP downloads.",
    },
    keywords: [
        "photo gallery",
        "gallery for photographers",
        "share photos with clients",
        "password protected gallery",
        "webp",
        "zip download",
        "photo portfolio",
        "saas for photographers",
    ],
};

export default function Home() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Seovileo",
        applicationCategory: "Photography",
        operatingSystem: "Web",
        offers: {
            "@type": "Offer",
            price: 0,
            priceCurrency: "PLN",
            description: "Free plan with watermark and gallery limits",
        },
        featureList: [
            "Password-protected galleries",
            "WebP conversion",
            "ZIP download",
            "Hero templates",
            "Public and private links",
        ],
    };

    return (
        <main className="bg-white">
            <nav className="border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Logo href="/" />
                    <MainButton
                        label="Get started"
                        href="/login"
                        variant="primary"
                    />
                </div>
            </nav>

            <section className="pt-20 pb-16 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
                        Share beautiful photo galleries with your clients
                    </h1>
                    <p className="text-xl text-gray-600 mt-6 max-w-2xl mx-auto leading-relaxed">
                        Upload photos, share a link. Password protection,
                        automatic optimization, and one-click downloads all
                        included.
                    </p>
                    <div className="mt-10">
                        <MainButton
                            label="Start for free"
                            href="/login"
                            variant="primary"
                            className="text-lg px-8 py-3"
                        />
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                        Free plan available No credit card required
                    </p>
                </div>
            </section>

            <section className="py-20 px-4 sm:px-6 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Everything you need
                        </h2>
                        <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
                            Professional photo delivery made simple
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<Camera className="w-6 h-6" />}
                            title="Fast galleries"
                            desc="Create and share in minutes"
                        />
                        <FeatureCard
                            icon={<Lock className="w-6 h-6" />}
                            title="Password protected"
                            desc="Keep photos private when needed"
                        />
                        <FeatureCard
                            icon={<Zap className="w-6 h-6" />}
                            title="Auto-optimized"
                            desc="WebP conversion included"
                        />
                        <FeatureCard
                            icon={<Download className="w-6 h-6" />}
                            title="ZIP download"
                            desc="One-click for clients"
                        />
                    </div>
                </div>
            </section>

            <section className="py-20 px-4 sm:px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            How it works
                        </h2>
                        <p className="text-lg text-gray-600 mt-4">
                            Three simple steps to share your photos
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12">
                        <StepCard
                            number="1"
                            title="Create gallery"
                            desc="Name it and set privacy options"
                        />
                        <StepCard
                            number="2"
                            title="Upload photos"
                            desc="Drag and drop your images"
                        />
                        <StepCard
                            number="3"
                            title="Share link"
                            desc="Send to your clients instantly"
                        />
                    </div>
                </div>
            </section>

            <section className="py-20 px-4 sm:px-6 bg-blue-50">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        Start free, upgrade when ready
                    </h2>
                    <p className="text-lg text-gray-600 mt-4">
                        Free plan includes 3 galleries. Upgrade for unlimited
                        galleries, password protection, and no watermarks.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <MainButton
                            label="Start free"
                            href="/login"
                            variant="primary"
                            className="text-lg px-8 py-3"
                        />
                        <a
                            href="/dashboard/billing#plans"
                            className="text-blue-700 font-medium hover:text-blue-800 transition-colors"
                        >
                            View pricing{" "}
                        </a>
                    </div>
                </div>
            </section>

            {/* NEW SECTION 1: Why photographers love us */}
            <section className="py-20 px-4 sm:px-6 bg-linear-to-br from-gray-50 to-blue-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Why photographers love us
                        </h2>
                        <p className="text-lg text-gray-600 mt-4">
                            Built specifically for photography professionals
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <BenefitCard
                            icon={<CheckCircle2 className="w-6 h-6" />}
                            title="No tech skills required"
                            desc="Simple interface anyone can use — focus on your photos, not the software"
                        />
                        <BenefitCard
                            icon={<Zap className="w-6 h-6" />}
                            title="Lightning fast delivery"
                            desc="CDN-powered galleries load instantly worldwide — happy clients guaranteed"
                        />
                        <BenefitCard
                            icon={<Lock className="w-6 h-6" />}
                            title="Client privacy first"
                            desc="Password protection keeps sensitive shoots secure and professional"
                        />
                        <BenefitCard
                            icon={<Globe className="w-6 h-6" />}
                            title="Share anywhere"
                            desc="Works perfectly on any device — desktop, tablet, or mobile"
                        />
                        <BenefitCard
                            icon={<Download className="w-6 h-6" />}
                            title="Easy downloads"
                            desc="Clients get high-quality files in one ZIP — no technical support needed"
                        />
                        <BenefitCard
                            icon={<Star className="w-6 h-6" />}
                            title="Professional look"
                            desc="Beautiful, clean design that makes your work shine"
                        />
                    </div>
                </div>
            </section>

            {/* NEW SECTION 2: Trusted by professionals */}
            <section className="py-20 px-4 sm:px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Trusted by professionals
                        </h2>
                        <p className="text-lg text-gray-600 mt-4">
                            Join photographers who switched to Seovileo
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        <StatCard number="500+" label="Active photographers" />
                        <StatCard number="10k+" label="Galleries created" />
                        <StatCard number="99.9%" label="Uptime guaranteed" />
                    </div>
                    <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 sm:p-12 text-center border border-blue-100">
                        <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                        <p className="text-xl text-gray-800 font-medium mb-3">
                            "Switching to Seovileo saved me hours every week. My
                            clients love how easy it is."
                        </p>
                        <p className="text-gray-600">
                            — Sarah M., Wedding Photographer
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-20 px-4 sm:px-6 bg-gray-50">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
                        FAQ
                    </h2>
                    <div className="space-y-6">
                        <FaqItem
                            q="Can I protect galleries with a password?"
                            a="Yes, password protection is available on Basic plan and higher."
                        />
                        <FaqItem
                            q="Are photos automatically optimized?"
                            a="Yes. We convert all images to WebP format for faster loading."
                        />
                        <FaqItem
                            q="Can clients download all photos at once?"
                            a="Yes. Clients can download the entire gallery as a ZIP file with one click."
                        />
                        <FaqItem
                            q="What's included in the free plan?"
                            a="Up to 3 galleries with a subtle watermark. You can upgrade anytime."
                        />
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 sm:px-6 bg-gray-900 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold">
                        Ready to share your work?
                    </h2>
                    <p className="text-lg text-gray-300 mt-4 mb-8">
                        Join photographers who deliver galleries the modern way
                    </p>
                    <MainButton
                        label="Get started free"
                        href="/login"
                        variant="orange"
                        className="text-lg px-8 py-3"
                    />
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-gray-950 text-gray-400 py-12 px-4 sm:px-6 border-t border-gray-800">
                <div className="max-w-6xl mx-auto">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h3 className="text-white font-semibold mb-4">
                                Product
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <a
                                        href="/dashboard"
                                        className="hover:text-white transition-colors"
                                    >
                                        Dashboard
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/dashboard/billing#plans"
                                        className="hover:text-white transition-colors"
                                    >
                                        Pricing
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#funkcje"
                                        className="hover:text-white transition-colors"
                                    >
                                        Features
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-4">
                                Company
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        About
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Contact
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#faq"
                                        className="hover:text-white transition-colors"
                                    >
                                        FAQ
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-4">
                                Resources
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <a
                                        href="#jak-to-dziala"
                                        className="hover:text-white transition-colors"
                                    >
                                        How it works
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Help Center
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Terms
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-4">
                                Get Started
                            </h3>
                            <p className="text-sm mb-4">
                                Start sharing beautiful galleries today
                            </p>
                            <MainButton
                                label="Sign up free"
                                href="/login"
                                variant="primary"
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm">
                            © 2025 Seovileo. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            <a
                                href="#"
                                className="hover:text-white transition-colors"
                            >
                                Privacy
                            </a>
                            <a
                                href="#"
                                className="hover:text-white transition-colors"
                            >
                                Terms
                            </a>
                            <a
                                href="#"
                                className="hover:text-white transition-colors"
                            >
                                Cookies
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
        </main>
    );
}

function FeatureCard({
    icon,
    title,
    desc,
}: {
    icon: ReactNode;
    title: string;
    desc: string;
}) {
    return (
        <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {title}
            </h3>
            <p className="text-gray-600 leading-relaxed">{desc}</p>
        </div>
    );
}

function StepCard({
    number,
    title,
    desc,
}: {
    number: string;
    title: string;
    desc: string;
}) {
    return (
        <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-xl mb-4">
                {number}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {title}
            </h3>
            <p className="text-gray-600 leading-relaxed">{desc}</p>
        </div>
    );
}

function BenefitCard({
    icon,
    title,
    desc,
}: {
    icon: ReactNode;
    title: string;
    desc: string;
}) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
            </h3>
            <p className="text-gray-600 leading-relaxed">{desc}</p>
        </div>
    );
}

function StatCard({ number, label }: { number: string; label: string }) {
    return (
        <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-2">
                {number}
            </div>
            <div className="text-gray-600 font-medium">{label}</div>
        </div>
    );
}

function FaqItem({ q, a }: { q: string; a: string }) {
    return (
        <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{q}</h3>
            <p className="text-gray-600 leading-relaxed">{a}</p>
        </div>
    );
}
