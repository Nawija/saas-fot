import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLoginForm } from "@/hooks/useLoginForm";

describe("useLoginForm", () => {
    it("should initialize with default values", () => {
        const { result } = renderHook(() => useLoginForm());

        expect(result.current.state.email).toBe("");
        expect(result.current.state.password).toBe("");
        expect(result.current.state.error).toBe("");
        expect(result.current.state.loading).toBe(false);
    });

    it("should update email field", () => {
        const { result } = renderHook(() => useLoginForm());

        act(() => {
            result.current.updateField("email", "test@example.com");
        });

        expect(result.current.state.email).toBe("test@example.com");
    });

    it("should update password field", () => {
        const { result } = renderHook(() => useLoginForm());

        act(() => {
            result.current.updateField("password", "password123");
        });

        expect(result.current.state.password).toBe("password123");
    });

    it("should set error message", () => {
        const { result } = renderHook(() => useLoginForm());

        act(() => {
            result.current.setError("Invalid credentials");
        });

        expect(result.current.state.error).toBe("Invalid credentials");
    });

    it("should set loading state", () => {
        const { result } = renderHook(() => useLoginForm());

        act(() => {
            result.current.setLoading(true);
        });

        expect(result.current.state.loading).toBe(true);

        act(() => {
            result.current.setLoading(false);
        });

        expect(result.current.state.loading).toBe(false);
    });

    it("should reset form to initial state", () => {
        const { result } = renderHook(() => useLoginForm());

        // Set some values
        act(() => {
            result.current.updateField("email", "test@example.com");
            result.current.updateField("password", "password123");
            result.current.setError("Some error");
            result.current.setLoading(true);
        });

        // Verify values are set
        expect(result.current.state.email).toBe("test@example.com");
        expect(result.current.state.password).toBe("password123");
        expect(result.current.state.error).toBe("Some error");
        expect(result.current.state.loading).toBe(true);

        // Reset form
        act(() => {
            result.current.resetForm();
        });

        // Verify everything is reset
        expect(result.current.state.email).toBe("");
        expect(result.current.state.password).toBe("");
        expect(result.current.state.error).toBe("");
        expect(result.current.state.loading).toBe(false);
    });

    it("should update multiple fields independently", () => {
        const { result } = renderHook(() => useLoginForm());

        act(() => {
            result.current.updateField("email", "user@test.com");
        });

        expect(result.current.state.email).toBe("user@test.com");
        expect(result.current.state.password).toBe("");

        act(() => {
            result.current.updateField("password", "mypassword");
        });

        expect(result.current.state.email).toBe("user@test.com");
        expect(result.current.state.password).toBe("mypassword");
    });
});
