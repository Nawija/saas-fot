import CountdownTimer from "@/components/CountdownTimer";
import FormInput from "./FormInput";
import SubmitButton from "./SubmitButton";
import MainButton from "../buttons/MainButton";

interface VerificationFormProps {
    email: string;
    code: string;
    loading: boolean;
    onCodeChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onBack: () => void;
    onExpire: () => void;
}

export default function VerificationForm({
    email,
    code,
    loading,
    onCodeChange,
    onSubmit,
    onBack,
    onExpire,
}: VerificationFormProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <p className="text-center text-gray-600">
                We sent a 6-digit code to <b>{email}</b>.
            </p>

            <div className="text-center text-sm text-gray-500 mb-2">
                The code expires in:{" "}
                <CountdownTimer minutes={5} onExpire={onExpire} />
            </div>

            <FormInput
                label="Verification code"
                type="text"
                value={code}
                onChange={onCodeChange}
                required
                maxLength={6}
                className="text-center tracking-widest font-mono"
            />

            <MainButton
                loading={loading}
                loadingText="Registering..."
                type="submit"
                label="Confirm code"
                className="w-full"
                variant="success"
            />
            <button
                type="button"
                onClick={onBack}
                className="w-full text-sm text-gray-500 hover:underline mt-2"
            >
                Back
            </button>
        </form>
    );
}
