import MainButton from "@/components/buttons/MainButton";


export default function Home() {
    return (
        <div className="flex items-center justify-center flex-col space-y-4 h-screen">
            <h1>Welcome to the Home Page</h1>
            <MainButton href="/dashboard" label="Go to Dashboard" />
        </div>
    );
}


