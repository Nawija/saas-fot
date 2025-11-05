import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility function", () => {
    it("should merge class names correctly", () => {
        const result = cn("text-red-500", "bg-blue-500");
        expect(result).toBe("text-red-500 bg-blue-500");
    });

    it("should handle conditional classes", () => {
        const isActive = true;
        const result = cn("base-class", isActive && "active-class");
        expect(result).toBe("base-class active-class");
    });

    it("should handle falsy values", () => {
        const result = cn(
            "text-red-500",
            false,
            null,
            undefined,
            "bg-blue-500"
        );
        expect(result).toBe("text-red-500 bg-blue-500");
    });

    it("should merge tailwind classes correctly", () => {
        // twMerge should handle conflicting tailwind classes
        const result = cn("px-2", "px-4");
        expect(result).toBe("px-4");
    });

    it("should handle array of classes", () => {
        const result = cn(["text-red-500", "bg-blue-500"]);
        expect(result).toBe("text-red-500 bg-blue-500");
    });

    it("should handle object with boolean values", () => {
        const result = cn({
            "text-red-500": true,
            "bg-blue-500": false,
            "p-4": true,
        });
        expect(result).toBe("text-red-500 p-4");
    });

    it("should handle complex combinations", () => {
        const isActive = true;
        const hasError = false;
        const result = cn(
            "base-class",
            isActive && "active",
            hasError && "error",
            {
                "text-bold": true,
                "text-italic": false,
            },
            ["flex", "items-center"]
        );
        expect(result).toBe("base-class active text-bold flex items-center");
    });

    it("should handle empty input", () => {
        const result = cn();
        expect(result).toBe("");
    });

    it("should override conflicting Tailwind classes", () => {
        const result = cn("text-sm text-lg");
        expect(result).toBe("text-lg");
    });
});
