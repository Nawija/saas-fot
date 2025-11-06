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
import Loading from "@/components/ui/Loading";

export default function LoginPage() {
    const router = useRouter();
    const { state, updateField, setError, setLoading } = useLoginForm();
    const { checking } = useRedirectIfAuthenticated();

    if (checking) {
        return <Loading />;
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
            <div className="w-full bg-white overflow-hidden flex flex-col lg:flex-row">
                {/* LEWA STRONA */}
                <AuthSidePanel subtitle="We make it easy for you to manage your account" />

                {/* PRAWA STRONA */}
                <div className="w-full lg:w-1/3 mx-auto p-10 flex flex-col justify-center">
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

                    <GoogleLoginButton onClick={handleGoogleLogin} />

                    <div className="relative w-full my-12">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                                or continue with
                            </span>
                        </div>
                    </div>

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
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
