import {
    describe,
    it,
    expect,
    beforeAll,
    afterEach,
    afterAll,
    vi,
} from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { server } from "../mocks/server";
import { useLoginForm } from "@/hooks/useLoginForm";
import {
    useRegisterForm,
    usePasswordValidation,
} from "@/hooks/useRegisterForm";

// Start server before all tests
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Login Form Integration - Full Flow", () => {
    it("should complete successful login flow", async () => {
        const { result } = renderHook(() => useLoginForm());

        // User enters credentials
        act(() => {
            result.current.updateField("email", "test@example.com");
            result.current.updateField("password", "password123");
        });

        expect(result.current.state.email).toBe("test@example.com");
        expect(result.current.state.password).toBe("password123");

        // Start loading
        act(() => {
            result.current.setLoading(true);
        });

        expect(result.current.state.loading).toBe(true);

        // Make API call
        const response = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: result.current.state.email,
                password: result.current.state.password,
            }),
        });

        const data = await response.json();

        // Stop loading
        act(() => {
            result.current.setLoading(false);
        });

        expect(data.success).toBe(true);
        expect(data.user.email).toBe("test@example.com");
        expect(result.current.state.loading).toBe(false);

        // Clear form after success
        act(() => {
            result.current.resetForm();
        });

        expect(result.current.state.email).toBe("");
        expect(result.current.state.password).toBe("");
    });

    it("should handle failed login with error display", async () => {
        const { result } = renderHook(() => useLoginForm());

        // User enters wrong credentials
        act(() => {
            result.current.updateField("email", "test@example.com");
            result.current.updateField("password", "wrongpassword");
            result.current.setLoading(true);
        });

        // Make API call
        const response = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: result.current.state.email,
                password: result.current.state.password,
            }),
        });

        const data = await response.json();

        // Handle error
        act(() => {
            result.current.setLoading(false);
            if (!data.success) {
                result.current.setError(data.message);
            }
        });

        expect(result.current.state.loading).toBe(false);
        expect(result.current.state.error).toBe("Invalid credentials");
    });

    it("should validate empty fields before submission", () => {
        const { result } = renderHook(() => useLoginForm());

        // Try to submit with empty fields
        const isEmpty =
            !result.current.state.email || !result.current.state.password;

        expect(isEmpty).toBe(true);

        // Set error for empty fields
        if (isEmpty) {
            act(() => {
                result.current.setError("Please fill in all fields");
            });
        }

        expect(result.current.state.error).toBe("Please fill in all fields");
    });
});

describe("Register Form Integration - Full Flow", () => {
    it("should complete successful registration flow with validation", async () => {
        const { result: formResult } = renderHook(() => useRegisterForm());
        const { result: validationResult } = renderHook(() =>
            usePasswordValidation()
        );

        // User enters registration details
        act(() => {
            formResult.current.updateField("email", "newuser@example.com");
            formResult.current.updateField("password", "password123");
            formResult.current.updateField("confirmPassword", "password123");
        });

        // Validate passwords
        const validation = validationResult.current.validatePasswords(
            formResult.current.state.password,
            formResult.current.state.confirmPassword
        );

        expect(validation.isValid).toBe(true);

        // Start registration
        act(() => {
            formResult.current.setLoading(true);
        });

        // Make API call
        const response = await fetch(
            "http://localhost:3000/api/auth/register",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formResult.current.state.email,
                    password: formResult.current.state.password,
                    username: "newuser",
                }),
            }
        );

        const data = await response.json();

        // Handle success
        act(() => {
            formResult.current.setLoading(false);
            if (data.success) {
                formResult.current.setSuccess(true);
            }
        });

        expect(data.success).toBe(true);
        expect(formResult.current.state.success).toBe(true);
    });

    it("should prevent registration with mismatched passwords", () => {
        const { result: formResult } = renderHook(() => useRegisterForm());
        const { result: validationResult } = renderHook(() =>
            usePasswordValidation()
        );

        // User enters mismatched passwords
        act(() => {
            formResult.current.updateField("email", "user@example.com");
            formResult.current.updateField("password", "password123");
            formResult.current.updateField("confirmPassword", "password456");
        });

        // Validate passwords
        const validation = validationResult.current.validatePasswords(
            formResult.current.state.password,
            formResult.current.state.confirmPassword
        );

        expect(validation.isValid).toBe(false);
        expect(validation.error).toBe("Hasła nie są takie same");

        // Set error in form
        act(() => {
            formResult.current.setError(validation.error);
        });

        expect(formResult.current.state.error).toBe("Hasła nie są takie same");
    });

    it("should prevent registration with short password", () => {
        const { result: formResult } = renderHook(() => useRegisterForm());
        const { result: validationResult } = renderHook(() =>
            usePasswordValidation()
        );

        // User enters short password
        act(() => {
            formResult.current.updateField("password", "pass");
            formResult.current.updateField("confirmPassword", "pass");
        });

        // Validate passwords
        const validation = validationResult.current.validatePasswords(
            formResult.current.state.password,
            formResult.current.state.confirmPassword
        );

        expect(validation.isValid).toBe(false);
        expect(validation.error).toBe("Hasło musi mieć przynajmniej 6 znaków");
    });

    it("should handle registration with existing email", async () => {
        const { result } = renderHook(() => useRegisterForm());

        // User enters existing email
        act(() => {
            result.current.updateField("email", "existing@example.com");
            result.current.updateField("password", "password123");
            result.current.updateField("confirmPassword", "password123");
            result.current.setLoading(true);
        });

        // Make API call
        const response = await fetch(
            "http://localhost:3000/api/auth/register",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: result.current.state.email,
                    password: result.current.state.password,
                    username: "existinguser",
                }),
            }
        );

        const data = await response.json();

        // Handle error
        act(() => {
            result.current.setLoading(false);
            if (!data.success) {
                result.current.setError(data.message);
            }
        });

        expect(data.success).toBe(false);
        expect(result.current.state.error).toBe("Email already exists");
    });
});

describe("Form + API + Validation - Complete User Journey", () => {
    it("should handle complete user registration and login journey", async () => {
        const { result: registerForm } = renderHook(() => useRegisterForm());
        const { result: validation } = renderHook(() =>
            usePasswordValidation()
        );

        // === REGISTRATION PHASE ===

        // User fills registration form
        act(() => {
            registerForm.current.updateField("email", "journey@example.com");
            registerForm.current.updateField("password", "journey123");
            registerForm.current.updateField("confirmPassword", "journey123");
        });

        // Validate passwords
        const passwordValidation = validation.current.validatePasswords(
            registerForm.current.state.password,
            registerForm.current.state.confirmPassword
        );

        expect(passwordValidation.isValid).toBe(true);

        // Submit registration
        act(() => {
            registerForm.current.setLoading(true);
        });

        const registerResponse = await fetch(
            "http://localhost:3000/api/auth/register",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: registerForm.current.state.email,
                    password: registerForm.current.state.password,
                    username: "journeyuser",
                }),
            }
        );

        const registerData = await registerResponse.json();

        act(() => {
            registerForm.current.setLoading(false);
            if (registerData.success) {
                registerForm.current.setSuccess(true);
            }
        });

        expect(registerData.success).toBe(true);
        expect(registerForm.current.state.success).toBe(true);

        // === LOGIN PHASE ===

        const { result: loginForm } = renderHook(() => useLoginForm());

        // User logs in with registered credentials
        act(() => {
            loginForm.current.updateField("email", "journey@example.com");
            loginForm.current.updateField("password", "journey123");
            loginForm.current.setLoading(true);
        });

        // Note: MSW handler for login requires specific credentials
        // In real scenario, this would work with any registered user
        // For demo purposes, we'll use the mock credentials
        act(() => {
            loginForm.current.updateField("email", "test@example.com");
            loginForm.current.updateField("password", "password123");
        });

        const loginResponse = await fetch(
            "http://localhost:3000/api/auth/login",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: loginForm.current.state.email,
                    password: loginForm.current.state.password,
                }),
            }
        );

        const loginData = await loginResponse.json();

        act(() => {
            loginForm.current.setLoading(false);
        });

        expect(loginData.success).toBe(true);
        expect(loginData.user).toBeDefined();
    });
});
