import Link from "next/link";
import MainButton from "../buttons/MainButton";
import FormInput from "./FormInput";

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

            <div className="text-right">
                <Link
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:underline"
                >
                    Zapomniałeś hasła?
                </Link>
            </div>

            <MainButton
                loading={loading}
                loadingText="Logowanie..."
                type="submit"
                label="Zaloguj się"
                className="w-full"
            />

            <p className="mt-6 text-center text-sm">
                Nie masz konta?{" "}
                <Link
                    href="/register"
                    className="text-blue-600 hover:underline"
                >
                    Zarejestruj się
                </Link>
            </p>
        </form>
    );
}
