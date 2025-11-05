import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
    useRegisterForm,
    usePasswordValidation,
} from "@/hooks/useRegisterForm";

describe("usePasswordValidation", () => {
    it("should validate matching passwords", () => {
        const { result } = renderHook(() => usePasswordValidation());

        const validation = result.current.validatePasswords(
            "password123",
            "password123"
        );

        expect(validation.isValid).toBe(true);
        expect(validation.error).toBe("");
    });

    it("should reject non-matching passwords", () => {
        const { result } = renderHook(() => usePasswordValidation());

        const validation = result.current.validatePasswords(
            "password123",
            "password456"
        );

        expect(validation.isValid).toBe(false);
        expect(validation.error).toBe("Hasła nie są takie same");
    });

    it("should reject short passwords", () => {
        const { result } = renderHook(() => usePasswordValidation());

        const validation = result.current.validatePasswords("pass", "pass");

        expect(validation.isValid).toBe(false);
        expect(validation.error).toBe("Hasło musi mieć przynajmniej 6 znaków");
    });

    it("should accept passwords with exactly 6 characters", () => {
        const { result } = renderHook(() => usePasswordValidation());

        const validation = result.current.validatePasswords("pass12", "pass12");

        expect(validation.isValid).toBe(true);
        expect(validation.error).toBe("");
    });
});

describe("useRegisterForm", () => {
    it("should initialize with default values", () => {
        const { result } = renderHook(() => useRegisterForm());

        expect(result.current.state.email).toBe("");
        expect(result.current.state.password).toBe("");
        expect(result.current.state.confirmPassword).toBe("");
        expect(result.current.state.code).toBe("");
        expect(result.current.state.error).toBe("");
        expect(result.current.state.loading).toBe(false);
        expect(result.current.state.showCodeStep).toBe(false);
        expect(result.current.state.success).toBe(false);
    });

    it("should update email field", () => {
        const { result } = renderHook(() => useRegisterForm());

        act(() => {
            result.current.updateField("email", "newuser@example.com");
        });

        expect(result.current.state.email).toBe("newuser@example.com");
    });

    it("should update password fields", () => {
        const { result } = renderHook(() => useRegisterForm());

        act(() => {
            result.current.updateField("password", "password123");
            result.current.updateField("confirmPassword", "password123");
        });

        expect(result.current.state.password).toBe("password123");
        expect(result.current.state.confirmPassword).toBe("password123");
    });

    it("should set error message", () => {
        const { result } = renderHook(() => useRegisterForm());

        act(() => {
            result.current.setError("Email already exists");
        });

        expect(result.current.state.error).toBe("Email already exists");
    });

    it("should set loading state", () => {
        const { result } = renderHook(() => useRegisterForm());

        act(() => {
            result.current.setLoading(true);
        });

        expect(result.current.state.loading).toBe(true);
    });

    it("should toggle code step", () => {
        const { result } = renderHook(() => useRegisterForm());

        act(() => {
            result.current.setShowCodeStep(true);
        });

        expect(result.current.state.showCodeStep).toBe(true);

        act(() => {
            result.current.setShowCodeStep(false);
        });

        expect(result.current.state.showCodeStep).toBe(false);
    });

    it("should set success state", () => {
        const { result } = renderHook(() => useRegisterForm());

        act(() => {
            result.current.setSuccess(true);
        });

        expect(result.current.state.success).toBe(true);
    });

    it("should handle complete registration flow", () => {
        const { result } = renderHook(() => useRegisterForm());

        // Step 1: Enter email and password
        act(() => {
            result.current.updateField("email", "user@example.com");
            result.current.updateField("password", "password123");
            result.current.updateField("confirmPassword", "password123");
        });

        expect(result.current.state.email).toBe("user@example.com");
        expect(result.current.state.password).toBe("password123");
        expect(result.current.state.confirmPassword).toBe("password123");

        // Step 2: Show code verification step
        act(() => {
            result.current.setLoading(true);
        });

        expect(result.current.state.loading).toBe(true);

        act(() => {
            result.current.setLoading(false);
            result.current.setShowCodeStep(true);
        });

        expect(result.current.state.showCodeStep).toBe(true);

        // Step 3: Enter verification code
        act(() => {
            result.current.updateField("code", "123456");
        });

        expect(result.current.state.code).toBe("123456");

        // Step 4: Success
        act(() => {
            result.current.setSuccess(true);
        });

        expect(result.current.state.success).toBe(true);
    });
});
