import Link from "next/link";
import MainButton from "../buttons/MainButton";

export default function UnauthenticatedView() {
    return (
        <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center p-8 rounded-2xl">
                <h2 className="text-2xl font-semibold mb-4">
                    Nie jesteś zalogowany
                </h2>
                <p className="text-gray-600 mb-6">
                    Zaloguj się, aby uzyskać dostęp do panelu użytkownika
                </p>
                <MainButton
                    href="/login"
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    label="Przejdź do logowania"
                />
            </div>
        </div>
    );
}
