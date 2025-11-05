import { http, HttpResponse } from "msw";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const handlers = [
    // Login endpoint
    http.post(`${BASE_URL}/api/auth/login`, async ({ request }) => {
        const body = (await request.json()) as {
            email: string;
            password: string;
        };

        if (
            body.email === "test@example.com" &&
            body.password === "password123"
        ) {
            return HttpResponse.json(
                {
                    success: true,
                    message: "Login successful",
                    user: {
                        id: "1",
                        email: "test@example.com",
                        username: "testuser",
                    },
                },
                { status: 200 }
            );
        }

        return HttpResponse.json(
            { success: false, message: "Invalid credentials" },
            { status: 401 }
        );
    }),

    // Register endpoint
    http.post(`${BASE_URL}/api/auth/register`, async ({ request }) => {
        const body = (await request.json()) as {
            email: string;
            password: string;
            username: string;
        };

        if (body.email === "existing@example.com") {
            return HttpResponse.json(
                { success: false, message: "Email already exists" },
                { status: 400 }
            );
        }

        return HttpResponse.json(
            {
                success: true,
                message: "Registration successful",
                user: {
                    id: "2",
                    email: body.email,
                    username: body.username,
                },
            },
            { status: 201 }
        );
    }),

    // Collections endpoint
    http.get(`${BASE_URL}/api/collections`, () => {
        return HttpResponse.json({
            success: true,
            collections: [
                {
                    id: "1",
                    name: "Test Collection 1",
                    slug: "test-collection-1",
                    description: "Test description",
                    created_at: new Date().toISOString(),
                },
                {
                    id: "2",
                    name: "Test Collection 2",
                    slug: "test-collection-2",
                    description: "Another test description",
                    created_at: new Date().toISOString(),
                },
            ],
        });
    }),

    // Create collection endpoint
    http.post(`${BASE_URL}/api/collections`, async ({ request }) => {
        const body = (await request.json()) as {
            name: string;
            description?: string;
        };

        return HttpResponse.json(
            {
                success: true,
                collection: {
                    id: "3",
                    name: body.name,
                    slug: body.name.toLowerCase().replace(/\s+/g, "-"),
                    description: body.description || "",
                    created_at: new Date().toISOString(),
                },
            },
            { status: 201 }
        );
    }),

    // User profile endpoint
    http.get(`${BASE_URL}/api/user/profile`, () => {
        return HttpResponse.json({
            success: true,
            user: {
                id: "1",
                email: "test@example.com",
                username: "testuser",
                bio: "Test bio",
                avatar_url: null,
            },
        });
    }),

    // Gallery images endpoint
    http.get(`${BASE_URL}/api/gallery`, () => {
        return HttpResponse.json({
            success: true,
            images: [
                {
                    id: "1",
                    url: "https://example.com/image1.jpg",
                    thumbnail_url: "https://example.com/thumb1.jpg",
                    title: "Test Image 1",
                    collection_id: "1",
                },
                {
                    id: "2",
                    url: "https://example.com/image2.jpg",
                    thumbnail_url: "https://example.com/thumb2.jpg",
                    title: "Test Image 2",
                    collection_id: "1",
                },
            ],
        });
    }),
];
