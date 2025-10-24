interface GoogleLoginButtonProps {
    onClick: () => void;
}

export default function GoogleLoginButton({ onClick }: GoogleLoginButtonProps) {
    return (
        <div className="my-6 flex flex-col items-center">
            <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                        lub kontynuuj z
                    </span>
                </div>
            </div>

            <button
                type="button"
                onClick={onClick}
                className="mt-4 w-full border border-gray-300 py-2 rounded-lg flex justify-center items-center gap-2 hover:bg-gray-50 transition"
            >
                <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="w-5 h-5"
                />
                <span className="font-medium">Zaloguj się przez Google</span>
            </button>
        </div>
    );
}
