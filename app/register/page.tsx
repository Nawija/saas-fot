"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import {
    useRegisterForm,
    usePasswordValidation,
} from "@/hooks/useRegisterForm";
import { authService } from "@/lib/services/authService";
import SuccessAnimation from "@/components/auth/SuccessAnimation";
import ErrorMessage from "@/components/auth/ErrorMessage";
import EmailPasswordForm from "@/components/auth/EmailPasswordForm";
import VerificationForm from "@/components/auth/VerificationForm";

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md bg-white shadow-md rounded-2xl p-8 relative overflow-hidden">
                {/* ✨ Animacja sukcesu */}
                <AnimatePresence>
                    {state.success && <SuccessAnimation />}
                </AnimatePresence>

                <h1 className="text-2xl font-semibold text-center mb-6">
                    Rejestracja
                </h1>

                <ErrorMessage message={state.error} />

                {!state.showCodeStep ? (
                    <EmailPasswordForm
                        email={state.email}
                        password={state.password}
                        confirmPassword={state.confirmPassword}
                        loading={state.loading}
                        onEmailChange={(value) => updateField("email", value)}
                        onPasswordChange={(value) =>
                            updateField("password", value)
                        }
                        onConfirmPasswordChange={(value) =>
                            updateField("confirmPassword", value)
                        }
                        onSubmit={handleSendCode}
                    />
                ) : (
                    <VerificationForm
                        email={state.email}
                        code={state.code}
                        loading={state.loading}
                        onCodeChange={(value) => updateField("code", value)}
                        onSubmit={handleRegister}
                        onBack={() => setShowCodeStep(false)}
                        onExpire={() => setError("Kod wygasł")}
                    />
                )}
            </div>
        </div>
    );
}
