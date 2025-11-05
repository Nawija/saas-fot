import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";

// Start server before all tests
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Login Integration Tests", () => {
    it("should successfully login with valid credentials", async () => {
        const response = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "test@example.com",
                password: "password123",
            }),
        });

        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toBe("Login successful");
        expect(data.user).toEqual({
            id: "1",
            email: "test@example.com",
            username: "testuser",
        });
    });

    it("should fail login with invalid credentials", async () => {
        const response = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "test@example.com",
                password: "wrongpassword",
            }),
        });

        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.success).toBe(false);
        expect(data.message).toBe("Invalid credentials");
    });

    it("should handle network errors gracefully", async () => {
        server.use(
            http.post("http://localhost:3000/api/auth/login", () => {
                return HttpResponse.error();
            })
        );

        try {
            await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: "test@example.com",
                    password: "password123",
                }),
            });
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
});

describe("Register Integration Tests", () => {
    it("should successfully register a new user", async () => {
        const response = await fetch(
            "http://localhost:3000/api/auth/register",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: "newuser@example.com",
                    password: "password123",
                    username: "newuser",
                }),
            }
        );

        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.message).toBe("Registration successful");
        expect(data.user.email).toBe("newuser@example.com");
        expect(data.user.username).toBe("newuser");
    });

    it("should fail to register with existing email", async () => {
        const response = await fetch(
            "http://localhost:3000/api/auth/register",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: "existing@example.com",
                    password: "password123",
                    username: "existinguser",
                }),
            }
        );

        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.message).toBe("Email already exists");
    });
});

describe("Collections Integration Tests", () => {
    it("should fetch collections successfully", async () => {
        const response = await fetch("http://localhost:3000/api/collections");
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.collections).toHaveLength(2);
        expect(data.collections[0]).toHaveProperty("id");
        expect(data.collections[0]).toHaveProperty("name");
        expect(data.collections[0]).toHaveProperty("slug");
    });

    it("should create a new collection", async () => {
        const response = await fetch("http://localhost:3000/api/collections", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "New Collection",
                description: "A new test collection",
            }),
        });

        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.collection.name).toBe("New Collection");
        expect(data.collection.slug).toBe("new-collection");
        expect(data.collection.description).toBe("A new test collection");
    });

    it("should handle unauthorized access", async () => {
        server.use(
            http.get("http://localhost:3000/api/collections", () => {
                return HttpResponse.json(
                    { success: false, message: "Unauthorized" },
                    { status: 401 }
                );
            })
        );

        const response = await fetch("http://localhost:3000/api/collections");
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.success).toBe(false);
        expect(data.message).toBe("Unauthorized");
    });
});

describe("User Profile Integration Tests", () => {
    it("should fetch user profile successfully", async () => {
        const response = await fetch("http://localhost:3000/api/user/profile");
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.user).toHaveProperty("id");
        expect(data.user).toHaveProperty("email");
        expect(data.user).toHaveProperty("username");
        expect(data.user.email).toBe("test@example.com");
    });
});

describe("Gallery Integration Tests", () => {
    it("should fetch gallery images successfully", async () => {
        const response = await fetch("http://localhost:3000/api/gallery");
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.images).toHaveLength(2);
        expect(data.images[0]).toHaveProperty("id");
        expect(data.images[0]).toHaveProperty("url");
        expect(data.images[0]).toHaveProperty("thumbnail_url");
    });

    it("should handle empty gallery", async () => {
        server.use(
            http.get("http://localhost:3000/api/gallery", () => {
                return HttpResponse.json({
                    success: true,
                    images: [],
                });
            })
        );

        const response = await fetch("http://localhost:3000/api/gallery");
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.images).toHaveLength(0);
    });
});
