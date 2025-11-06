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
                label="Password"
                type="password"
                value={password}
                onChange={onPasswordChange}
                required
            />

            <div className="text-right z-40">
                <Link
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:underline"
                >
                    Forgot password?
                </Link>
            </div>

            <MainButton
                loading={loading}
                loadingText="Logging in..."
                type="submit"
                label="Log in"
                className="w-full"
            />

            <p className="mt-6 text-center text-sm">
                Don't have an account?{" "}
                <Link
                    href="/register"
                    className="text-blue-600 hover:underline"
                >
                    Sign up
                </Link>
            </p>
        </form>
    );
}
