import { getUser } from "@/lib/auth/getUser";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChangeAvatar from "@/components/buttons/ChangeAvatar";

export default async function ProfilePage() {
    const user = await getUser();

    if (!user) {
        redirect("/login");
    }

    const displayName = user.name || user.email?.split("@")[0] || "Użytkownik";
    const fallback = displayName.charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Ustawienia profilu</h1>

                <div className="bg-white rounded-lg shadow p-6 space-y-8">
                    {/* Avatar Section */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Avatar</h2>
                        <div className="flex items-start gap-6">
                            <Avatar className="w-24 h-24">
                                <AvatarImage
                                    src={user.avatar || "/avatar.jpg"}
                                    alt={displayName}
                                />
                                <AvatarFallback className="text-2xl">
                                    {fallback}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <ChangeAvatar currentAvatar={user.avatar} />
                            </div>
                        </div>
                    </div>

                    <hr />

                    {/* Profile Info */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">
                            Informacje o profilu
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nazwa
                                </label>
                                <p className="text-gray-900">
                                    {user.name || "Nie ustawiono"}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <p className="text-gray-900">{user.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Metoda logowania
                                </label>
                                <p className="text-gray-900">
                                    {user.provider === "email"
                                        ? "Email i hasło"
                                        : "Google OAuth"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
