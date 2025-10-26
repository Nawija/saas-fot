import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
            <div className="text-center">
                {/* Spinner z efektem glow */}
                <div className="relative inline-block">
                    <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                    <div className="absolute inset-0 w-16 h-16 bg-blue-400 rounded-full blur-xl opacity-20 animate-pulse" />
                </div>

                {/* Tekst z animacją */}
                <div className="mt-6 space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 animate-pulse">
                        Ładowanie...
                    </h3>
                    <p className="text-sm text-gray-500">Proszę czekać</p>
                </div>

                {/* Kropki animowane */}
                <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                </div>
            </div>
        </div>
    );
}
