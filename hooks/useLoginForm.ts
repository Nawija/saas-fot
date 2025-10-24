import { useState } from "react";

interface LoginFormState {
    email: string;
    password: string;
    error: string;
    loading: boolean;
}

export function useLoginForm() {
    const [state, setState] = useState<LoginFormState>({
        email: "",
        password: "",
        error: "",
        loading: false,
    });

    const updateField = (field: keyof LoginFormState, value: any) => {
        setState((prev) => ({ ...prev, [field]: value }));
    };

    const setError = (error: string) => {
        setState((prev) => ({ ...prev, error }));
    };

    const setLoading = (loading: boolean) => {
        setState((prev) => ({ ...prev, loading }));
    };

    const resetForm = () => {
        setState({
            email: "",
            password: "",
            error: "",
            loading: false,
        });
    };

    return {
        state,
        updateField,
        setError,
        setLoading,
        resetForm,
    };
}
