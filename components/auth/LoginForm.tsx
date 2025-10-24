import FormInput from "./FormInput";
import SubmitButton from "./SubmitButton";

interface LoginFormProps {
    email: string;
    password: string;
    loading: boolean;
    onEmailChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export default function LoginForm({
    email,
    password,
    loading,
    onEmailChange,
    onPasswordChange,
    onSubmit,
}: LoginFormProps) {
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

            <SubmitButton
                loading={loading}
                loadingText="Logowanie..."
                text="Zaloguj się"
                variant="primary"
            />

            <p className="mt-6 text-center text-sm">
                Nie masz konta?{" "}
                <a href="/register" className="text-blue-600 hover:underline">
                    Zarejestruj się
                </a>
            </p>
        </form>
    );
}
