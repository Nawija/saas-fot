interface ErrorMessageProps {
    message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
    if (!message) return null;

    return (
        <p className="text-red-500 text-sm text-center mb-3 bg-red-50 py-2 px-4 rounded-lg">
            {message}
        </p>
    );
}
