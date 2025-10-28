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
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                            Witaj{user.name ? `, ${user.name}` : ""}! 👋
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Profesjonalna platforma do tworzenia i udostępniania
                            galerii zdjęć. Idealne dla fotografów, event
                            managerów i twórców treści.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/dashboard/collections"
                                className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                            >
                                <Images className="w-5 h-5 mr-2" />
                                Utwórz swoją pierwszą galerię
                            </Link>
                            <Link
                                href="/dashboard/billing"
                                className="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-200"
                            >
                                <Crown className="w-5 h-5 mr-2" />
                                Zobacz plany Premium
                            </Link>
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
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
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
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
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
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                className={`relative bg-white rounded-xl p-8 border-2 transition-all duration-200 ${
                                    plan.popular
                                        ? "border-blue-500 shadow-lg scale-105"
                                        : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                                }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="bg-blue-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                                            Najpopularniejszy
                                        </span>
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {plan.name}
                                </h3>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-gray-900">
                                        {plan.price}
                                    </span>
                                    <span className="text-gray-600">/mies</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start"
                                        >
                                            <svg
                                                className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-0.5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            <span className="text-gray-700 text-sm">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/dashboard/billing"
                                    className={`block text-center px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                                        plan.popular
                                            ? "bg-blue-600 text-white hover:bg-blue-700"
                                            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                                    }`}
                                >
                                    Wybierz plan
                                </Link>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-sm text-gray-600">
                        Plan Free: 2 GB storage • Wszystkie podstawowe funkcje •
                        Bez karty kredytowej
                    </p>
                </div>

                {/* Support Section */}
                <div className="bg-linear-to-tr from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-300">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
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
                            <Link
                                href="/dashboard/billing"
                                className="inline-flex items-center justify-center px-6 py-3 bg-orange-700 text-white font-semibold rounded-lg hover:bg-orange-800 transition-colors duration-200"
                            >
                                <Crown className="w-5 h-5 mr-2" />
                                Subskrybuj
                            </Link>
                            <a
                                href="https://www.buymeacoffee.com/seovileo"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:border-orange-700 hover:text-orange-800 transition-all duration-200"
                            >
                                <Coffee className="w-5 h-5 mr-2" />
                                Buy me a coffee
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
