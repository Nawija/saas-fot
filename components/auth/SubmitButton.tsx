interface SubmitButtonProps {
    loading: boolean;
    loadingText: string;
    text: string;
    variant?: "primary" | "success";
}

export default function SubmitButton({
    loading,
    loadingText,
    text,
    variant = "primary",
}: SubmitButtonProps) {
    const variantClasses = {
        primary: "bg-blue-600 hover:bg-blue-700",
        success: "bg-green-600 hover:bg-green-700",
    };

    return (
        <button
            type="submit"
            disabled={loading}
            className={`w-full ${variantClasses[variant]} text-white py-2 rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed`}
        >
            {loading ? loadingText : text}
        </button>
    );
}
