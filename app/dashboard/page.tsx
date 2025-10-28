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
            title: "Nieograniczone galerie",
            description:
                "Twórz piękne galerie zdjęć dla swoich klientów, rodziny lub wydarzeń.",
        },
        {
            icon: Palette,
            title: "7 stylów hero",
            description:
                "Wybierz spośród gotowych szablonów - od minimalistycznych po kinematograficzne.",
        },
        {
            icon: Share2,
            title: "Łatwe udostępnianie",
            description:
                "Jeden link do galerii - wysyłaj klientom bez komplikacji.",
        },
        {
            icon: Lock,
            title: "Ochrona hasłem",
            description:
                "Zabezpiecz prywatne galerie hasłem dostępnym tylko dla wybranych.",
        },
        {
            icon: Heart,
            title: "System polubień",
            description:
                "Goście mogą oznaczać ulubione zdjęcia bez rejestracji.",
        },
        {
            icon: Download,
            title: "Pobieranie ZIP",
            description:
                "Klienci pobierają wybrane zdjęcia lub całą galerię jednym kliknięciem.",
        },
        {
            icon: Smartphone,
            title: "Responsive design",
            description:
                "Galerie wyglądają świetnie na telefonach, tabletach i desktopach.",
        },
        {
            icon: Zap,
            title: "Szybkie ładowanie",
            description:
                "Optymalizacja obrazów i CDN zapewniają błyskawiczne wyświetlanie.",
        },
    ];

    const plans = [
        {
            name: "Basic",
            price: "19 zł",
            features: [
                "10 GB storage",
                "Wszystkie szablony hero",
                "Ochrona hasłem",
                "Nieograniczone galerie",
            ],
        },
        {
            name: "Pro",
            price: "39 zł",
            features: [
                "50 GB storage",
                "Priorytetowy support",
                "Własna domena (wkrótce)",
                "Zaawansowane statystyki",
            ],
            popular: true,
        },
        {
            name: "Unlimited",
            price: "99 zł",
            features: [
                "200 GB storage",
                "White-label (bez loga)",
                "API access",
                "Dedykowany account manager",
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
                            Witaj 👋 <br />
                            <span>{user.name ? `${user.name}` : ""}!</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Profesjonalna platforma do tworzenia i udostępniania
                            galerii zdjęć. Idealne dla fotografów, event
                            managerów i twórców treści.
                        </p>
                        <div className="flex flex-col w-3/4 mx-auto sm:flex-row gap-4 justify-center">
                            <MainButton
                                href="/dashboard/collections"
                                icon={<Images className="w-5 h-5 mr-2" />}
                                label="Utwórz galerię"
                            />

                            <MainButton
                                href="/dashboard/billing"
                                variant="secondary"
                                icon={<Crown className="w-5 h-5 mr-2" />}
                                label="Plan Premium"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Features Grid */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                        Wszystko, czego potrzebujesz
                    </h2>
                    <p className="text-gray-600 text-center mb-10">
                        Funkcje, które sprawiają, że udostępnianie zdjęć jest
                        proste i profesjonalne
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
                        Szybki start w 3 krokach
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                1
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Utwórz galerię
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Kliknij "Galerie" i dodaj nową kolekcję zdjęć
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                2
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Wybierz styl
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Dostosuj wygląd hero i wybierz czcionkę
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                3
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Udostępnij
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Skopiuj link i wyślij swoim klientom
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pricing Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                        Plany dopasowane do Twoich potrzeb
                    </h2>
                    <p className="text-gray-600 text-center mb-10">
                        Zacznij za darmo lub wybierz plan Premium dla większych
                        możliwości
                    </p>
                    <div className="py-12">
                        <PricingCards />
                    </div>
                    <p className="text-center text-sm text-gray-600">
                        Plan Free: 2 GB storage • Wszystkie podstawowe funkcje •
                        Bez karty kredytowej
                    </p>
                </div>

                {/* Support Section */}
                <div className="bg-linear-to-tr from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-300">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="w-16 h-16 bg-orange-100 border border-orange-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Coffee className="w-8 h-8 text-orange-800" />
                        </div>
                        <h2 className="text-2xl font-bold text-orange-800 mb-3">
                            Wesprzyj rozwój projektu ❤️
                        </h2>
                        <p className="text-gray-700 mb-6 leading-relaxed">
                            Seovileo to niezależny projekt tworzony z pasją.
                            Jeśli podoba Ci się nasza platforma i chcesz pomóc w
                            rozwoju nowych funkcji (niestandardowe domeny, białe
                            etykiety, integracje), rozważ subskrypcję Premium.
                            Każde wsparcie ma ogromne znaczenie i pozwala nam
                            tworzyć jeszcze lepsze narzędzia dla Ciebie.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <MainButton
                                href="/dashboard/billing"
                                icon={<Crown className="w-5 h-5" />}
                                label="Subskrybuj"
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
