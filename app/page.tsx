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
    title: "SaaS Fot - Galerie zdjęć online dla fotografów | Udostępniaj, chroń hasłem, zarabiaj",
    description:
        "Szybkie i piękne galerie zdjęć dla fotografów. Udostępniaj klientom, chroń hasłem, kompresuj do WebP, pobieraj ZIP-y i zarządzaj subskrypcją. Darmowy plan + watermark.",
    alternates: { canonical: "/" },
    openGraph: {
        title: "SaaS Fot - Galerie zdjęć online dla fotografów",
        description:
            "Twórz i wysyłaj profesjonalne galerie: ochrona hasłem, WebP, download ZIP, szablony hero i więcej.",
        siteName: "SaaS Fot",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "SaaS Fot - Galerie zdjęć online dla fotografów",
        description:
            "Udostępniaj prywatne galerie klientom, chroń hasłem, optymalizuj obrazy i pobieraj ZIP-y.",
    },
    keywords: [
        "galerie zdjęć",
        "galeria dla fotografa",
        "udostępnianie zdjęć klientom",
        "galeria na hasło",
        "webp",
        "zip download",
        "portfolio foto",
        "SaaS dla fotografów",
    ],
};

export default function Home() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "SaaS Fot",
        applicationCategory: "Photography",
        operatingSystem: "Web",
        offers: {
            "@type": "Offer",
            price: 0,
            priceCurrency: "PLN",
            description: "Plan darmowy z watermarkiem i limitem galerii",
        },
        featureList: [
            "Galerie z ochroną hasłem",
            "Konwersja do WebP",
            "Pobieranie ZIP",
            "Szablony hero",
            "Linki publiczne i prywatne",
        ],
    };

    return (
        <main>
            {/* HERO */}
            <section className="relative overflow-hidden border-b border-gray-200 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center max-w-3xl mx-auto">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            <Crown className="w-3.5 h-3.5" /> Dla fotografów
                        </span>
                        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mt-4">
                            Piękne, szybkie i prywatne galerie zdjęć dla Twoich
                            klientów
                        </h1>
                        <p className="text-lg text-gray-600 mt-4">
                            Twórz galerie w minutę, udostępniaj je linkiem lub
                            chroń hasłem, a zdjęcia automatycznie
                            zoptymalizujemy do WebP.
                        </p>
                        <div className="mt-8 flex items-center justify-center gap-3">
                            <MainButton
                                label="Załóż konto"
                                href="/register"
                                variant="primary"
                            />
                            <MainButton
                                label="Zobacz plany"
                                href="/dashboard/billing#plans"
                                variant="secondary"
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-3">
                            Bez karty na starcie. Zawsze możesz przejść na plan
                            wyższy.
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
                            Wszystko, czego potrzebujesz do oddania zdjęć
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Od pierwszego uploadu po finalny ZIP — UX
                            przygotowany dla Ciebie i Twoich klientów
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<Camera className="w-5 h-5 text-blue-600" />}
                            title="Galerie w minutę"
                            desc="Szybkie tworzenie kolekcji, szablony hero, schludny grid i eleganckie typografie."
                        />
                        <FeatureCard
                            icon={<Lock className="w-5 h-5 text-amber-600" />}
                            title="Ochrona hasłem"
                            desc="Udostępniaj prywatne linki z hasłem. Publiczne - kiedy chcesz, prywatne - kiedy trzeba."
                        />
                        <FeatureCard
                            icon={
                                <ImageIcon className="w-5 h-5 text-emerald-600" />
                            }
                            title="WebP automatycznie"
                            desc="Zdjęcia kompresujemy do WebP, a hero generujemy w wysokiej jakości - szybko i pięknie."
                        />
                        <FeatureCard
                            icon={
                                <Download className="w-5 h-5 text-indigo-600" />
                            }
                            title="Pobieranie ZIP"
                            desc="Klient pobiera całą galerię jednym kliknięciem. Ty kontrolujesz jakość i dostęp."
                        />
                        <FeatureCard
                            icon={<Cloud className="w-5 h-5 text-sky-600" />}
                            title="Stabilna chmura"
                            desc="Pliki trzymamy w chmurze klasy S3/R2. Szybki CDN i przewidywalna dostępność."
                        />
                        <FeatureCard
                            icon={<Shield className="w-5 h-5 text-rose-600" />}
                            title="Watermark na Free"
                            desc="Na darmowym planie nakładamy subtelny znak wodny. W planach płatnych - znikają."
                        />
                    </div>

                    <div className="text-center mt-10">
                        <MainButton
                            label="Wypróbuj za darmo"
                            href="/register"
                        />
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
                            Od uploadu do linku w 3 krokach
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        <StepCard
                            number="01"
                            title="Stwórz galerię"
                            desc="Nadaj nazwę i opcjonalny opis, wybierz publiczną lub na hasło."
                        />
                        <StepCard
                            number="02"
                            title="Dodaj zdjęcia"
                            desc="My zajmiemy się WebP i rozmiarami. Ty skup się na zdjęciach."
                        />
                        <StepCard
                            number="03"
                            title="Udostępnij link"
                            desc="Wyślij klientom link lub zabezpiecz dostęp hasłem."
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
                            Prosty start. W każdej chwili możesz urosnąć
                        </h2>
                        <p className="text-gray-600">
                            Zacznij od darmowego planu. Gdy będziesz gotowy,
                            przejdź na Basic lub wyżej i odblokuj ochronę hasłem
                            oraz brak watermarków.
                        </p>
                        <div className="mt-8 flex items-center justify-center gap-3">
                            <MainButton
                                label="Zobacz plany"
                                href="/dashboard/billing#plans"
                            />
                            <MainButton
                                label="Rejestracja"
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
                        Najczęstsze pytania
                    </h2>
                    <div className="space-y-4">
                        <FaqItem
                            q="Czy mogę chronić galerie hasłem?"
                            a="Tak, od planu Basic możesz ustawić ochronę hasłem dla każdej galerii."
                        />
                        <FaqItem
                            q="Czy zdjęcia są optymalizowane?"
                            a="Tak. Konwertujemy do WebP i trzymamy rozsądne rozmiary, a obrazy ładują się szybko."
                        />
                        <FaqItem
                            q="Czy klienci mogą pobrać wszystkie zdjęcia?"
                            a="Tak. Wystarczy użyć przycisku ZIP - pobieranie całej kolekcji jednym kliknięciem."
                        />
                        <FaqItem
                            q="Czy darmowy plan ma ograniczenia?"
                            a="Tak. Maks. 3 galerie i watermark na zdjęciach. Zawsze możesz przejść na wyższy plan."
                        />
                    </div>

                    <div className="text-center mt-10">
                        <MainButton label="Załóż konto" href="/register" />
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="bg-linear-to-br from-emerald-50 to-teal-50 py-14 border-t border-emerald-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl bg-white border border-emerald-100 p-8 text-center shadow-sm">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Oddawaj zdjęcia szybciej i piękniej
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Zarejestruj się i stwórz pierwszą galerię w mniej
                            niż minutę.
                        </p>
                        <div className="mt-6 flex items-center justify-center gap-3">
                            <MainButton label="Rejestracja" href="/register" />
                            <MainButton
                                label="Zobacz plany"
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
