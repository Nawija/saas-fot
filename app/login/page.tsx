"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLoginForm } from "@/hooks/useLoginForm";
import { loginService } from "@/lib/services/loginService";
import ErrorMessage from "@/components/auth/ErrorMessage";
import LoginForm from "@/components/auth/LoginForm";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import AuthSidePanel from "@/components/auth/AuthSidePanel";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function LoginPage() {
    const router = useRouter();
    const { state, updateField, setError, setLoading } = useLoginForm();
    const { checking } = useRedirectIfAuthenticated();

    if (checking) {
        return <LoadingScreen message="Sprawdzanie sesji..." />;
    }

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
            setError(err.message || "Network or server error");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        loginService.redirectToGoogleLogin();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full bg-white overflow-hidden flex flex-col md:flex-row">
                {/* LEWA STRONA */}
                <AuthSidePanel subtitle="We make it easy for you to manage your account" />

                {/* PRAWA STRONA */}
                <div className="w-full md:w-1/3 mx-auto p-10 flex flex-col justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-3xl font-semibold text-center mb-2">
                            Welcome
                        </h1>
                        <p className="text-center text-gray-500 mb-6">
                            Log in to your account to continue
                        </p>
                    </motion.div>

                    <ErrorMessage message={state.error} />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <LoginForm
                            email={state.email}
                            password={state.password}
                            loading={state.loading}
                            onEmailChange={(v) => updateField("email", v)}
                            onPasswordChange={(v) => updateField("password", v)}
                            onSubmit={handleSubmit}
                        />

                        <div className="my-4 text-center text-gray-400">or</div>

                        <GoogleLoginButton onClick={handleGoogleLogin} />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
