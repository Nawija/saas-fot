import LogoutButton from "@/components/buttons/LogoutButton";

interface User {
    id: number;
    email: string;
    name?: string;
    avatar?: string;
    provider?: string;
}

interface DashboardHeaderProps {
    user: User;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Panel użytkownika
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Witaj, {user.name || user.email}
                        </p>
                    </div>
                    <LogoutButton />
                </div>
            </div>
        </header>
    );
}
