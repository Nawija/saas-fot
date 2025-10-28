import MainButton from "@/components/buttons/MainButton";
import {
    Camera,
    Lock,
    Cloud,
    Crown,
    Image as ImageIcon,
    Shield,
    Download,
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
        <main>
            {/* HERO */}
            <section className="relative overflow-hidden border-b border-gray-200 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center max-w-3xl mx-auto">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            <Crown className="w-3.5 h-3.5" /> For photographers
                        </span>
                        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mt-4">
                            Beautiful, fast and private photo galleries for your
                            clients
                        </h1>
                        <p className="text-lg text-gray-600 mt-4">
                            Create galleries in minutes, share via link or
                            protect with a password — we automatically optimize
                            photos to WebP.
                        </p>
                        <div className="mt-8 flex items-center justify-center gap-3">
                            <MainButton
                                label="Sign up"
                                href="/register"
                                variant="primary"
                            />
                            <MainButton
                                label="See plans"
                                href="/dashboard/billing#plans"
                                variant="secondary"
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-3">
                            No card required to start. You can upgrade any time.
                        </p>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section
                id="funkcje"
                className="bg-linear-to-br from-gray-50 via-white to-blue-50 py-14"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Everything you need to deliver photos
                        </h2>
                        <p className="text-gray-600 mt-2">
                            From the first upload to the final ZIP — a UX
                            designed for you and your clients
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<Camera className="w-5 h-5 text-blue-600" />}
                            title="Galleries in minutes"
                            desc="Fast collection creation, hero templates, clean grid and elegant typography."
                        />
                        <FeatureCard
                            icon={<Lock className="w-5 h-5 text-amber-600" />}
                            title="Password protection"
                            desc="Share private password-protected links. Public when you want, private when you need."
                        />
                        <FeatureCard
                            icon={
                                <ImageIcon className="w-5 h-5 text-emerald-600" />
                            }
                            title="Automatic WebP"
                            desc="We compress photos to WebP and generate high-quality hero images — fast and beautiful."
                        />
                        <FeatureCard
                            icon={
                                <Download className="w-5 h-5 text-indigo-600" />
                            }
                            title="ZIP download"
                            desc="Clients download the entire gallery in one click. You control quality and access."
                        />
                        <FeatureCard
                            icon={<Cloud className="w-5 h-5 text-sky-600" />}
                            title="Reliable cloud"
                            desc="Files live in S3/R2-class storage with CDN — fast and dependable."
                        />
                        <FeatureCard
                            icon={<Shield className="w-5 h-5 text-rose-600" />}
                            title="Watermark on Free"
                            desc="On the free plan we apply a subtle watermark. Paid plans remove it."
                        />
                    </div>

                    <div className="text-center mt-10">
                        <MainButton label="Try for free" href="/register" />
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section
                id="jak-to-dziala"
                className="bg-white py-14 border-t border-gray-200"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            From upload to share link in 3 steps
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        <StepCard
                            number="01"
                            title="Create a gallery"
                            desc="Name it, add an optional description and choose public or password-protected."
                        />
                        <StepCard
                            number="02"
                            title="Add photos"
                            desc="We handle WebP and sizes. You focus on the images."
                        />
                        <StepCard
                            number="03"
                            title="Share the link"
                            desc="Send clients a link or require a password for access."
                        />
                    </div>
                </div>
            </section>

            {/* PRICING TEASER */}
            <section
                id="plany"
                className="bg-linear-to-br from-blue-50 to-violet-50 py-14 border-t border-blue-100"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                            Simple start. Upgrade anytime
                        </h2>
                        <p className="text-gray-600">
                            Start on the free plan. When you’re ready, upgrade
                            to Basic or higher to unlock password protection and
                            remove watermarks.
                        </p>
                        <div className="mt-8 flex items-center justify-center gap-3">
                            <MainButton
                                label="See plans"
                                href="/dashboard/billing#plans"
                            />
                            <MainButton
                                label="Sign up"
                                href="/register"
                                variant="secondary"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section
                id="faq"
                className="bg-white py-14 border-t border-gray-200"
            >
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
                        Frequently asked questions
                    </h2>
                    <div className="space-y-4">
                        <FaqItem
                            q="Can I protect galleries with a password?"
                            a="Yes, starting from the Basic plan you can protect any gallery with a password."
                        />
                        <FaqItem
                            q="Are photos optimized?"
                            a="Yes. We convert to WebP and keep sensible sizes so images load fast."
                        />
                        <FaqItem
                            q="Can clients download all photos?"
                            a="Yes. Use the ZIP button to download the entire collection with one click."
                        />
                        <FaqItem
                            q="Does the free plan have limits?"
                            a="Yes. Up to 3 galleries and a watermark on photos. You can upgrade anytime."
                        />
                    </div>

                    <div className="text-center mt-10">
                        <MainButton label="Sign up" href="/register" />
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="bg-linear-to-br from-emerald-50 to-teal-50 py-14 border-t border-emerald-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl bg-white border border-emerald-100 p-8 text-center shadow-sm">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Deliver photos faster and beautifully
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Sign up and create your first gallery in under a
                            minute.
                        </p>
                        <div className="mt-6 flex items-center justify-center gap-3">
                            <MainButton label="Sign up" href="/register" />
                            <MainButton
                                label="See plans"
                                href="/dashboard/billing#plans"
                                variant="secondary"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* JSON-LD */}
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
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
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center mb-3">
                {icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{desc}</p>
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
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100 mb-3">
                {number}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{desc}</p>
        </div>
    );
}

function FaqItem({ q, a }: { q: string; a: string }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-1">{q}</h3>
            <p className="text-sm text-gray-600">{a}</p>
        </div>
    );
}
