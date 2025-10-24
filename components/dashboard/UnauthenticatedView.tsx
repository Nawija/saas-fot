import Link from "next/link";

export default function UnauthenticatedView() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center bg-white p-8 rounded-2xl shadow-md">
                <h2 className="text-2xl font-semibold mb-4">
                    Nie jesteś zalogowany
                </h2>
                <p className="text-gray-600 mb-6">
                    Zaloguj się, aby uzyskać dostęp do panelu użytkownika
                </p>
                <Link
                    href="/login"
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    Przejdź do logowania
                </Link>
            </div>
        </div>
    );
}
