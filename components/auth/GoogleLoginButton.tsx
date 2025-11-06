interface GoogleLoginButtonProps {
    onClick: () => void;
}

export default function GoogleLoginButton({ onClick }: GoogleLoginButtonProps) {
    return (
        <div className="flex flex-col items-center">
            

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
                <span className="font-medium">Sign in with Google</span>
            </button>
        </div>
    );
}
