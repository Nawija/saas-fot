import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
    useRouter() {
        return {
            push: vi.fn(),
            replace: vi.fn(),
            prefetch: vi.fn(),
            back: vi.fn(),
            pathname: "/",
            query: {},
            asPath: "/",
        };
    },
    usePathname() {
        return "/";
    },
    useSearchParams() {
        return new URLSearchParams();
    },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
