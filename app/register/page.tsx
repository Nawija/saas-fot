"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
    useRegisterForm,
    usePasswordValidation,
} from "@/hooks/useRegisterForm";
import { authService } from "@/lib/services/authService";
import SuccessAnimation from "@/components/auth/SuccessAnimation";
import ErrorMessage from "@/components/auth/ErrorMessage";
import EmailPasswordForm from "@/components/auth/EmailPasswordForm";
import VerificationForm from "@/components/auth/VerificationForm";
import AuthSidePanel from "@/components/auth/AuthSidePanel";

export default function RegisterPage() {
    const router = useRouter();
    const {
        state,
        updateField,
        setError,
        setLoading,
        setShowCodeStep,
        setSuccess,
    } = useRegisterForm();
    const { validatePasswords } = usePasswordValidation();

    // 🔹 Etap 1 — wysłanie kodu
    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Walidacja haseł
        const validation = validatePasswords(
            state.password,
            state.confirmPassword
        );
        if (!validation.isValid) {
            setError(validation.error);
            return;
        }

        setLoading(true);

        try {
            await authService.sendVerificationCode({ email: state.email });
            setShowCodeStep(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Etap 2 — potwierdzenie kodu i rejestracja
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await authService.register({
                email: state.email,
                password: state.password,
                code: state.code,
            });

            // ✅ Sukces — pokaż animację
            setSuccess(true);

            // Po 2 sekundach przekierowanie do logowania
            setTimeout(() => router.push("/login"), 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full bg-white overflow-hidden flex flex-col md:flex-row">
                {/* LEWA STRONA */}
                <AuthSidePanel subtitle="We make it easy for you to manage your account" />

                {/* PRAWA STRONA */}
                <div className="w-full md:w-1/3 mx-auto p-10 flex flex-col justify-center relative overflow-hidden">
                    {/* ✨ Animacja sukcesu */}
                    <AnimatePresence>
                        {state.success && <SuccessAnimation />}
                    </AnimatePresence>

                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-3xl font-semibold text-center mb-2">
                            Create Account
                        </h1>
                        <p className="text-center text-gray-500 mb-6">
                            Sign up to get started
                        </p>
                    </motion.div>

                    <ErrorMessage message={state.error} />

                    <AnimatePresence mode="wait">
                        {!state.showCodeStep ? (
                            <motion.div
                                key="email-form"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                transition={{
                                    duration: 0.4,
                                    ease: "easeInOut",
                                }}
                            >
                                <EmailPasswordForm
                                    email={state.email}
                                    password={state.password}
                                    confirmPassword={state.confirmPassword}
                                    loading={state.loading}
                                    onEmailChange={(value) =>
                                        updateField("email", value)
                                    }
                                    onPasswordChange={(value) =>
                                        updateField("password", value)
                                    }
                                    onConfirmPasswordChange={(value) =>
                                        updateField("confirmPassword", value)
                                    }
                                    onSubmit={handleSendCode}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="verification-form"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{
                                    duration: 0.4,
                                    ease: "easeInOut",
                                }}
                            >
                                <VerificationForm
                                    email={state.email}
                                    code={state.code}
                                    loading={state.loading}
                                    onCodeChange={(value) =>
                                        updateField("code", value)
                                    }
                                    onSubmit={handleRegister}
                                    onBack={() => setShowCodeStep(false)}
                                    onExpire={() => setError("Kod wygasł")}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
