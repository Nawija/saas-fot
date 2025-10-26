"use client";

import { useRouter } from "next/navigation";
import { useLoginForm } from "@/hooks/useLoginForm";
import { loginService } from "@/lib/services/loginService";
import ErrorMessage from "@/components/auth/ErrorMessage";
import LoginForm from "@/components/auth/LoginForm";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import Image from "next/image";

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
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-2">
            <div className="w-full bg-white shadow-lg rounded-3xl overflow-hidden flex flex-col md:flex-row">
                {/* LEWA STRONA */}
                <div className="hidden md:flex h-screen flex-col justify-center items-center w-1/2 bg-linear-to-tl from-blue-400 to-blue-700 text-white p-10">
                    <div className="text-center">
                        <div className="bg-white p-3 rounded-full w-max mx-auto mb-4">
                            <Image
                                src="/logo.svg"
                                alt="Logo"
                                width={60}
                                height={60}
                            />
                        </div>
                        <h2 className="text-2xl font-semibold">SEOVILEO</h2>
                        <p className="mt-4 text-blue-100">
                            We make it easy for you to manage your account
                        </p>
                    </div>
                </div>

                {/* PRAWA STRONA */}
                <div className="w-full md:w-1/3 mx-auto p-10 flex flex-col justify-center">
                    <h1 className="text-3xl font-semibold text-center text-blue-700 mb-2">
                        Welcome
                    </h1>
                    <p className="text-center text-gray-500 mb-6">
                        Log in to your account to continue
                    </p>

                    <ErrorMessage message={state.error} />

                    <LoginForm
                        email={state.email}
                        password={state.password}
                        loading={state.loading}
                        onEmailChange={(v) => updateField("email", v)}
                        onPasswordChange={(v) => updateField("password", v)}
                        onSubmit={handleSubmit}
                    />

                    <div className="my-4 text-center text-gray-400">lub</div>

                    <GoogleLoginButton onClick={handleGoogleLogin} />
                </div>
            </div>
        </div>
    );
}
