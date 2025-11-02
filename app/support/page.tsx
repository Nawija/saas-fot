"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Bug, Send, Loader2 } from "lucide-react";
import MainButton from "@/components/buttons/MainButton";

type FormType = "contact" | "bug";

export default function SupportPage() {
    const router = useRouter();
    const [formType, setFormType] = useState<FormType>("contact");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    // Bug report specific fields
    const [bugTitle, setBugTitle] = useState("");
    const [bugSteps, setBugSteps] = useState("");
    const [bugExpected, setBugExpected] = useState("");
    const [bugActual, setBugActual] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const endpoint =
                formType === "contact"
                    ? "/api/support/contact"
                    : "/api/support/bug";

            const body =
                formType === "contact"
                    ? { email, subject, message }
                    : {
                          email,
                          title: bugTitle,
                          steps: bugSteps,
                          expected: bugExpected,
                          actual: bugActual,
                      };

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Coś poszło nie tak");
            }

            setSuccess(true);
            // Reset form
            setEmail("");
            setSubject("");
            setMessage("");
            setBugTitle("");
            setBugSteps("");
            setBugExpected("");
            setBugActual("");

            // Hide success message after 5 seconds
            setTimeout(() => setSuccess(false), 5000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Powrót</span>
                    </button>

                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Support
                    </h1>
                    <p className="text-gray-600">
                        Potrzebujesz pomocy? Skontaktuj się z nami lub zgłoś
                        błąd.
                    </p>
                </div>

                {/* Form Type Selector */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setFormType("contact")}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl border-2 transition-all ${
                            formType === "contact"
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                    >
                        <Mail className="w-5 h-5" />
                        <div className="text-left">
                            <div className="font-semibold">Kontakt</div>
                            <div className="text-sm opacity-75">
                                Wyślij wiadomość
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setFormType("bug")}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl border-2 transition-all ${
                            formType === "bug"
                                ? "border-red-500 bg-red-50 text-red-700"
                                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                    >
                        <Bug className="w-5 h-5" />
                        <div className="text-left">
                            <div className="font-semibold">Zgłoś błąd</div>
                            <div className="text-sm opacity-75">
                                Raportuj problem
                            </div>
                        </div>
                    </button>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                        <div className="font-semibold mb-1">
                            ✓ Wysłano pomyślnie!
                        </div>
                        <div className="text-sm">
                            Odpowiemy najszybciej jak to możliwe.
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                        <div className="font-semibold mb-1">Błąd</div>
                        <div className="text-sm">{error}</div>
                    </div>
                )}

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="twoj@email.com"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        {formType === "contact" ? (
                            <>
                                {/* Subject */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Temat
                                    </label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) =>
                                            setSubject(e.target.value)
                                        }
                                        placeholder="Czym możemy pomóc?"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Wiadomość
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) =>
                                            setMessage(e.target.value)
                                        }
                                        placeholder="Opisz swój problem lub pytanie..."
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Bug Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tytuł błędu
                                    </label>
                                    <input
                                        type="text"
                                        value={bugTitle}
                                        onChange={(e) =>
                                            setBugTitle(e.target.value)
                                        }
                                        placeholder="Krótki opis problemu"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                {/* Steps to Reproduce */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kroki do odtworzenia
                                    </label>
                                    <textarea
                                        value={bugSteps}
                                        onChange={(e) =>
                                            setBugSteps(e.target.value)
                                        }
                                        placeholder="1. Kliknij na...&#10;2. Przewiń do...&#10;3. Zobacz błąd..."
                                        required
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none"
                                    />
                                </div>

                                {/* Expected Behavior */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Oczekiwane zachowanie
                                    </label>
                                    <textarea
                                        value={bugExpected}
                                        onChange={(e) =>
                                            setBugExpected(e.target.value)
                                        }
                                        placeholder="Co powinno się wydarzyć?"
                                        required
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none"
                                    />
                                </div>

                                {/* Actual Behavior */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Aktualne zachowanie
                                    </label>
                                    <textarea
                                        value={bugActual}
                                        onChange={(e) =>
                                            setBugActual(e.target.value)
                                        }
                                        placeholder="Co się faktycznie dzieje?"
                                        required
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none"
                                    />
                                </div>
                            </>
                        )}

                        {/* Submit Button */}
                        <MainButton
                            type="submit"
                            disabled={loading}
                            icon={<Send className="w-5 h-5" />}
                            className="w-full"
                            loading={loading}
                            loadingText="Wysyłanie"
                            label="Wyślij"
                        />
                            
                    </form>
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>Odpowiadamy zwykle w ciągu 24 godzin</p>
                    <p className="mt-1">
                        Email bezpośredni:{" "}
                        <a
                            href="mailto:support@seovileo.pl"
                            className="text-blue-600 hover:underline"
                        >
                            support@seovileo.pl
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
