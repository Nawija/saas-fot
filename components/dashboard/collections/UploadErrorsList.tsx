// components/dashboard/collections/UploadErrorsList.tsx
import type { UploadError } from "./types";

interface UploadErrorsListProps {
    errors: UploadError[];
    onClose: () => void;
}

export default function UploadErrorsList({
    errors,
    onClose,
}: UploadErrorsListProps) {
    if (errors.length === 0) return null;

    return (
        <div className="bg-white border mb-6 border-red-100 rounded-lg overflow-hidden">
            <div className="bg-red-50/50 border-red-100 px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="shrink-0 w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                        <svg
                            className="w-5 h-5 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-bold text-red-900">
                            {errors.length}{" "}
                            {errors.length === 1 ? "zdjęcie" : "zdjęć"} nie
                            zostało dodanych
                        </h3>
                        <p className="text-sm text-red-600 mt-0.5">
                            Sprawdź szczegóły poniżej
                        </p>
                    </div>
                </div>
            </div>
            <div className="p-5 space-y-3 max-h-[400px] overflow-y-auto">
                {errors.map((error, idx) => (
                    <div key={idx} className="p-2">
                        <div className="flex items-start gap-4">
                            {/* Image Icon - Szara ikona zdjęcia */}
                            <div className="relative shrink-0 w-12 h-12 bg-linear-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                <svg
                                    className="w-6 h-6 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                {/* Mały badge z X w rogu */}
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                    <svg
                                        className="w-3 h-3 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                {/* Filename */}
                                <h4
                                    className="text-sm font-semibold text-gray-900 truncate mb-1.5 group-hover:text-gray-700 transition-colors"
                                    title={error.fileName}
                                >
                                    {error.fileName}
                                </h4>

                                {/* Error reason with icon */}
                                <div className="flex items-start gap-2 mb-3">
                                    <svg
                                        className="w-4 h-4 text-red-500 mt-0.5 shrink-0"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <p className="text-sm text-red-600 font-medium leading-relaxed">
                                        {error.reason}
                                    </p>
                                </div>

                                {/* File sizes */}
                                <div className="flex flex-wrap items-center gap-3 text-xs">
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                        <svg
                                            className="w-3.5 h-3.5 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                            />
                                        </svg>
                                        <span className="font-medium text-gray-700">
                                            {error.originalSize}
                                        </span>
                                    </div>
                                    {error.compressedSize && (
                                        <>
                                            <svg
                                                className="w-3 h-3 text-gray-300"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                <svg
                                                    className="w-3.5 h-3.5 text-blue-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                                    />
                                                </svg>
                                                <span className="font-medium text-gray-700">
                                                    {error.compressedSize}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-2 flex-1">
                    <div className="shrink-0 w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center mt-0.5">
                        <svg
                            className="w-3.5 h-3.5 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">
                        <strong className="font-semibold text-gray-900">
                            Wskazówka:
                        </strong>{" "}
                        Spróbuj skompresować zdjęcia przed dodaniem lub sprawdź
                        format pliku
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="shrink-0 px-4 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow"
                >
                    Zamknij
                </button>
            </div>
        </div>
    );
}
