"use client";

import { useRouter } from "next/navigation";
import { useLoginForm } from "@/hooks/useLoginForm";
import { loginService } from "@/lib/services/loginService";
import ErrorMessage from "@/components/auth/ErrorMessage";
import LoginForm from "@/components/auth/LoginForm";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";

export default function LoginPage() {
    const router = useRouter();
    const { state, updateField, setError, setLoading } = useLoginForm();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await loginService.login({
                email: state.email,
                password: state.password,
            });

            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Błąd sieci lub serwera");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        loginService.redirectToGoogleLogin();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md bg-white shadow-md rounded-2xl p-8">
                <h1 className="text-2xl font-semibold text-center mb-6">
                    Logowanie
                </h1>

                <ErrorMessage message={state.error} />

                <GoogleLoginButton onClick={handleGoogleLogin} />

                <LoginForm
                    email={state.email}
                    password={state.password}
                    loading={state.loading}
                    onEmailChange={(value) => updateField("email", value)}
                    onPasswordChange={(value) => updateField("password", value)}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    );
}
