import Link from "next/link";
import MainButton from "../buttons/MainButton";
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
                label="Password"
                type="password"
                value={password}
                onChange={onPasswordChange}
                required
            />

            <FormInput
                label="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={onConfirmPasswordChange}
                required
            />

            <MainButton
                loading={loading}
                loadingText="Sending..."
                type="submit"
                label="Sign up"
                className="w-full"
            />

            <p className="mt-6 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:underline">
                    Log in
                </Link>
            </p>
        </form>
    );
}
