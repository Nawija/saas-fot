import { getUser } from "@/lib/auth/getUser";
import UnauthenticatedView from "@/components/dashboard/UnauthenticatedView";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default async function DashboardPage() {
    const user = await getUser();

    if (!user) {
        return <UnauthenticatedView />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader user={user} />

            <main className="max-w-7xl mx-auto py-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Twój panel</h2>
                    <p className="text-gray-600">
                        Witaj w swoim panelu zarządzania!
                    </p>
                </div>
            </main>
        </div>
    );
}
