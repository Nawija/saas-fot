import FormInput from "./FormInput";
import SubmitButton from "./SubmitButton";

interface EmailPasswordFormProps {
    email: string;
    password: string;
    confirmPassword: string;
    loading: boolean;
    onEmailChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onConfirmPasswordChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export default function EmailPasswordForm({
    email,
    password,
    confirmPassword,
    loading,
    onEmailChange,
    onPasswordChange,
    onConfirmPasswordChange,
    onSubmit,
}: EmailPasswordFormProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <FormInput
                label="Email"
                type="email"
                value={email}
                onChange={onEmailChange}
                required
            />

            <FormInput
                label="Hasło"
                type="password"
                value={password}
                onChange={onPasswordChange}
                required
            />

            <FormInput
                label="Powtórz hasło"
                type="password"
                value={confirmPassword}
                onChange={onConfirmPasswordChange}
                required
            />

            <SubmitButton
                loading={loading}
                loadingText="Wysyłanie..."
                text="Zarejestruj się"
                variant="primary"
            />

            <p className="mt-6 text-center text-sm">
                Masz już konto?{" "}
                <a href="/login" className="text-blue-600 hover:underline">
                    Zaloguj się
                </a>
            </p>
        </form>
    );
}
