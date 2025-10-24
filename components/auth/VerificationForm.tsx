import CountdownTimer from "@/components/CountdownTimer";
import FormInput from "./FormInput";
import SubmitButton from "./SubmitButton";

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
                Wysłaliśmy 6-cyfrowy kod na adres <b>{email}</b>.
            </p>

            <div className="text-center text-sm text-gray-500 mb-2">
                Kod wygaśnie za:{" "}
                <CountdownTimer minutes={5} onExpire={onExpire} />
            </div>

            <FormInput
                label="Kod weryfikacyjny"
                type="text"
                value={code}
                onChange={onCodeChange}
                required
                maxLength={6}
                className="text-center tracking-widest font-mono"
            />

            <SubmitButton
                loading={loading}
                loadingText="Rejestrowanie..."
                text="Potwierdź kod"
                variant="success"
            />

            <button
                type="button"
                onClick={onBack}
                className="w-full text-sm text-gray-500 hover:underline mt-2"
            >
                Wróć
            </button>
        </form>
    );
}
