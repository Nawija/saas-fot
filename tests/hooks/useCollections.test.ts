import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useCollections } from "@/hooks/useCollections";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock toast
vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe("useCollections", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should initialize with default values", () => {
        mockFetch.mockResolvedValue({
            json: async () => ({ ok: true, collections: [] }),
        });

        const { result } = renderHook(() => useCollections());

        expect(result.current.collections).toEqual([]);
        expect(result.current.loading).toBe(true);
        expect(result.current.username).toBe("");
    });

    it("should fetch collections on mount", async () => {
        const mockCollections = [
            {
                id: 1,
                name: "Test Collection 1",
                slug: "test-collection-1",
                description: "Test description",
                created_at: new Date().toISOString(),
            },
            {
                id: 2,
                name: "Test Collection 2",
                slug: "test-collection-2",
                description: "Another test",
                created_at: new Date().toISOString(),
            },
        ];

        mockFetch.mockImplementation((url: string) => {
            if (url === "/api/collections") {
                return Promise.resolve({
                    json: async () => ({
                        ok: true,
                        collections: mockCollections,
                    }),
                });
            }
            if (url === "/api/user/me") {
                return Promise.resolve({
                    json: async () => ({
                        ok: true,
                        user: { username: "testuser" },
                    }),
                });
            }
        });

        const { result } = renderHook(() => useCollections());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.collections).toEqual(mockCollections);
        expect(result.current.username).toBe("testuser");
    });

    it("should handle fetch collections error", async () => {
        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        mockFetch.mockImplementation((url: string) => {
            if (url === "/api/collections") {
                return Promise.reject(new Error("Network error"));
            }
            if (url === "/api/user/me") {
                return Promise.resolve({
                    json: async () => ({
                        ok: true,
                        user: { username: "testuser" },
                    }),
                });
            }
        });

        const { result } = renderHook(() => useCollections());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(consoleError).toHaveBeenCalled();
        expect(result.current.collections).toEqual([]);

        consoleError.mockRestore();
    });

    it("should delete collection successfully", async () => {
        const mockCollections = [
            {
                id: 1,
                name: "Collection 1",
                slug: "collection-1",
                description: "",
                created_at: "",
            },
            {
                id: 2,
                name: "Collection 2",
                slug: "collection-2",
                description: "",
                created_at: "",
            },
        ];

        mockFetch.mockImplementation((url: string, options?: any) => {
            if (url === "/api/collections" && !options) {
                return Promise.resolve({
                    json: async () => ({
                        ok: true,
                        collections: mockCollections,
                    }),
                });
            }
            if (url === "/api/user/me") {
                return Promise.resolve({
                    json: async () => ({
                        ok: true,
                        user: { username: "testuser" },
                    }),
                });
            }
            if (url === "/api/collections/1" && options?.method === "DELETE") {
                return Promise.resolve({
                    json: async () => ({
                        ok: true,
                        freedSpace: 10485760, // 10 MB in bytes
                        deletedFiles: 5,
                    }),
                });
            }
            return Promise.resolve({
                json: async () => ({ ok: false }),
            });
        });

        const { result } = renderHook(() => useCollections());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.collections).toHaveLength(2);

        await result.current.deleteCollection(1);

        await waitFor(() => {
            expect(result.current.collections).toHaveLength(1);
        });

        expect(result.current.collections[0].id).toBe(2);
    });

    it("should handle delete collection error", async () => {
        mockFetch.mockImplementation((url: string, options?: any) => {
            if (url === "/api/collections" && !options) {
                return Promise.resolve({
                    json: async () => ({ ok: true, collections: [] }),
                });
            }
            if (url === "/api/user/me") {
                return Promise.resolve({
                    json: async () => ({
                        ok: true,
                        user: { username: "testuser" },
                    }),
                });
            }
            if (
                url.includes("/api/collections/") &&
                options?.method === "DELETE"
            ) {
                return Promise.resolve({
                    json: async () => ({
                        ok: false,
                        error: "Collection not found",
                    }),
                });
            }
        });

        const { result } = renderHook(() => useCollections());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await waitFor(async () => {
            await result.current.deleteCollection(999);
        });

        // Collection count should remain the same since delete failed
        expect(result.current.collections).toHaveLength(0);
    });
});
