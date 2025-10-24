import { useState } from "react";

interface PasswordValidation {
    isValid: boolean;
    error: string;
}

export function usePasswordValidation() {
    const validatePasswords = (
        password: string,
        confirmPassword: string
    ): PasswordValidation => {
        if (password !== confirmPassword) {
            return {
                isValid: false,
                error: "Hasła nie są takie same",
            };
        }

        if (password.length < 6) {
            return {
                isValid: false,
                error: "Hasło musi mieć przynajmniej 6 znaków",
            };
        }

        return {
            isValid: true,
            error: "",
        };
    };

    return { validatePasswords };
}

interface RegisterFormState {
    email: string;
    password: string;
    confirmPassword: string;
    code: string;
    error: string;
    loading: boolean;
    showCodeStep: boolean;
    success: boolean;
}

export function useRegisterForm() {
    const [state, setState] = useState<RegisterFormState>({
        email: "",
        password: "",
        confirmPassword: "",
        code: "",
        error: "",
        loading: false,
        showCodeStep: false,
        success: false,
    });

    const updateField = (field: keyof RegisterFormState, value: any) => {
        setState((prev) => ({ ...prev, [field]: value }));
    };

    const setError = (error: string) => {
        setState((prev) => ({ ...prev, error }));
    };

    const setLoading = (loading: boolean) => {
        setState((prev) => ({ ...prev, loading }));
    };

    const setShowCodeStep = (show: boolean) => {
        setState((prev) => ({ ...prev, showCodeStep: show }));
    };

    const setSuccess = (success: boolean) => {
        setState((prev) => ({ ...prev, success }));
    };

    return {
        state,
        updateField,
        setError,
        setLoading,
        setShowCodeStep,
        setSuccess,
    };
}
