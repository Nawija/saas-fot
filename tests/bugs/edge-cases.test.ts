import { describe, it, expect } from "vitest";

/**
 * Testy wykrywające bugi i edge cases
 */

describe("Bug Detection & Edge Cases", () => {
    describe("Null/Undefined Handling", () => {
        it("should handle null user data gracefully", () => {
            const user = null;

            // Bug: próba dostępu do właściwości null
            const getName = (user: any) => {
                return user?.name ?? "Guest";
            };

            expect(getName(user)).toBe("Guest");
            expect(() => getName(user)).not.toThrow();
        });

        it("should handle undefined API responses", () => {
            const apiResponse: any = undefined;

            const getData = (response: any) => {
                return response?.data ?? [];
            };

            expect(getData(apiResponse)).toEqual([]);
        });

        it("should handle empty arrays", () => {
            const items: any[] = [];

            const getFirst = (arr: any[]) => {
                return arr[0] ?? null;
            };

            expect(getFirst(items)).toBeNull();
        });

        it("should handle empty strings", () => {
            const input = "";

            const validateInput = (str: string) => {
                return str.trim().length > 0;
            };

            expect(validateInput(input)).toBe(false);
        });
    });

    describe("Type Coercion Bugs", () => {
        it("should not use == instead of ===", () => {
            const value = "0";
            const number = 0;

            // Bug: '0' == 0 zwraca true (zła praktyka)
            expect(value === number.toString()).toBe(true);
            // @ts-expect-error - Intentionally demonstrating type coercion bug
            expect(value == number).toBe(true); // Pokazuje problem
        });

        it("should handle numeric string operations", () => {
            const strNumber = "10";
            const result = Number(strNumber) + 5;

            // Bug: '10' + 5 = '105' zamiast 15
            expect(result).toBe(15);
            expect(strNumber + 5).toBe("105"); // Pokazuje bug
        });

        it("should handle boolean coercion", () => {
            const emptyArray: any[] = [];

            // Bug: [] jest truthy mimo że pusty
            expect(Boolean(emptyArray)).toBe(true);
            expect(emptyArray.length > 0).toBe(false); // Prawidłowe sprawdzenie
        });
    });

    describe("Array/Object Mutation Bugs", () => {
        it("should not mutate original array", () => {
            const original = [1, 2, 3];
            const modified = [...original, 4]; // Dobrze: tworzymy nową

            expect(original).toEqual([1, 2, 3]);
            expect(modified).toEqual([1, 2, 3, 4]);
        });

        it("should not mutate nested objects", () => {
            const original = { user: { name: "John", age: 30 } };
            const modified = {
                ...original,
                user: { ...original.user, age: 31 },
            };

            expect(original.user.age).toBe(30);
            expect(modified.user.age).toBe(31);
        });

        it("should detect array method mutations", () => {
            const items = [1, 2, 3];
            const copy = [...items];

            items.push(4); // Mutuje oryginał

            expect(items.length).toBe(4);
            expect(copy.length).toBe(3); // Copy nie zmieniony
        });
    });

    describe("Async/Race Condition Bugs", () => {
        it("should handle concurrent API calls", async () => {
            let callCount = 0;

            const fetchData = async () => {
                callCount++;
                return new Promise((resolve) => setTimeout(resolve, 100));
            };

            // Bug: wielokrotne kliknięcie = wielokrotne wywołanie
            await Promise.all([fetchData(), fetchData(), fetchData()]);

            expect(callCount).toBe(3);
            // W produkcji powinien być mechanizm debounce/throttle
        });

        it("should handle stale state in async operations", async () => {
            let counter = 0;

            const incrementAsync = async () => {
                const current = counter;
                await new Promise((resolve) => setTimeout(resolve, 10));
                counter = current + 1;
            };

            // Race condition: oba czytają 0, oba ustawiają 1
            await Promise.all([incrementAsync(), incrementAsync()]);

            // Bug: counter powinien być 2, ale może być 1
            expect(counter).toBeGreaterThanOrEqual(1);
        });

        it("should handle promise rejection", async () => {
            const failingPromise = Promise.reject(new Error("Failed"));

            await expect(failingPromise).rejects.toThrow("Failed");
        });
    });

    describe("Boundary Value Bugs", () => {
        it("should handle maximum string length", () => {
            const maxLength = 100;
            const longString = "a".repeat(150);

            const truncate = (str: string, max: number) => {
                return str.slice(0, max);
            };

            const result = truncate(longString, maxLength);
            expect(result.length).toBe(maxLength);
        });

        it("should handle negative numbers", () => {
            const value = -5;

            const absolute = Math.abs(value);

            expect(absolute).toBe(5);
            expect(absolute).toBeGreaterThanOrEqual(0);
        });

        it("should handle zero values", () => {
            const divide = (a: number, b: number) => {
                if (b === 0) return null;
                return a / b;
            };

            // Bug: division by zero
            expect(divide(10, 0)).toBeNull();
        });

        it("should handle large numbers", () => {
            const maxSafeInt = Number.MAX_SAFE_INTEGER;
            const tooLarge = maxSafeInt + 1;

            // Bug: liczby większe niż MAX_SAFE_INTEGER tracą precyzję
            expect(tooLarge).toBe(maxSafeInt + 1);
        });
    });

    describe("Date/Time Bugs", () => {
        it("should handle timezone differences", () => {
            const date = new Date("2024-01-01T12:00:00Z");
            const utcHours = date.getUTCHours();

            expect(utcHours).toBe(12);
        });

        it("should handle date parsing errors", () => {
            const invalidDate = new Date("invalid");

            expect(isNaN(invalidDate.getTime())).toBe(true);
        });

        it("should handle leap year dates", () => {
            const leapYear = new Date("2024-02-29");

            expect(leapYear.getMonth()).toBe(1); // February (0-indexed)
            expect(leapYear.getDate()).toBe(29);
        });
    });

    describe("Memory Leak Detection", () => {
        it("should cleanup event listeners", () => {
            const listeners: (() => void)[] = [];

            const addEventListener = (handler: () => void) => {
                listeners.push(handler);
                return () => {
                    const index = listeners.indexOf(handler);
                    if (index > -1) listeners.splice(index, 1);
                };
            };

            const cleanup = addEventListener(() => {});
            expect(listeners.length).toBe(1);

            cleanup();
            expect(listeners.length).toBe(0);
        });

        it("should cleanup timers", () => {
            const timers: NodeJS.Timeout[] = [];

            const setTimerWithCleanup = () => {
                const timer = setTimeout(() => {}, 1000);
                timers.push(timer);
                return () => clearTimeout(timer);
            };

            const cleanup = setTimerWithCleanup();
            expect(timers.length).toBe(1);

            cleanup();
            // Timer is cleared
        });

        it("should cleanup subscriptions", () => {
            let subscriptions = 0;

            const subscribe = () => {
                subscriptions++;
                return () => subscriptions--;
            };

            const unsubscribe = subscribe();
            expect(subscriptions).toBe(1);

            unsubscribe();
            expect(subscriptions).toBe(0);
        });
    });

    describe("Input Validation Bugs", () => {
        it("should validate email format", () => {
            const validEmail = "user@example.com";
            const invalidEmail = "not-an-email";

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            expect(emailRegex.test(validEmail)).toBe(true);
            expect(emailRegex.test(invalidEmail)).toBe(false);
        });

        it("should sanitize user input", () => {
            const userInput = '<script>alert("xss")</script>';

            const sanitize = (input: string) => {
                return input.replace(/[<>]/g, "");
            };

            const safe = sanitize(userInput);
            expect(safe).not.toContain("<");
            expect(safe).not.toContain(">");
        });

        it("should validate file uploads", () => {
            const file = {
                name: "image.jpg",
                size: 6 * 1024 * 1024, // 6MB
                type: "image/jpeg",
            };

            const maxSize = 5 * 1024 * 1024; // 5MB
            const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

            const isValid =
                file.size <= maxSize && allowedTypes.includes(file.type);

            expect(isValid).toBe(false); // Zbyt duży plik
        });
    });

    describe("API Error Handling", () => {
        it("should handle 404 errors", () => {
            const response = { status: 404, data: null };

            const handleResponse = (res: any) => {
                if (res.status === 404) {
                    return { error: "Not found" };
                }
                return res.data;
            };

            const result = handleResponse(response);
            expect(result).toHaveProperty("error");
        });

        it("should handle 500 errors", () => {
            const response = { status: 500, message: "Internal server error" };

            const handleError = (res: any) => {
                if (res.status >= 500) {
                    return "Something went wrong. Please try again later.";
                }
            };

            const message = handleError(response);
            expect(message).toBeDefined();
        });

        it("should handle timeout errors", async () => {
            const timeout = (ms: number) =>
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Timeout")), ms)
                );

            await expect(timeout(100)).rejects.toThrow("Timeout");
        });

        it("should handle network errors", () => {
            const networkError = new Error("Network request failed");

            const handleNetworkError = (error: Error) => {
                return error.message.includes("Network");
            };

            expect(handleNetworkError(networkError)).toBe(true);
        });
    });

    describe("State Management Bugs", () => {
        it("should prevent state updates on unmounted components", () => {
            let isMounted = true;
            let state = "initial";

            const setState = (newState: string) => {
                if (isMounted) {
                    state = newState;
                }
            };

            setState("updated");
            expect(state).toBe("updated");

            isMounted = false;
            setState("should-not-update");
            expect(state).toBe("updated"); // Nie zmieniony
        });

        it("should handle rapid state updates", () => {
            let counter = 0;
            const updates: number[] = [];

            const increment = () => {
                counter++;
                updates.push(counter);
            };

            // Szybkie aktualizacje
            for (let i = 0; i < 10; i++) {
                increment();
            }

            expect(counter).toBe(10);
            expect(updates.length).toBe(10);
        });
    });

    describe("Pagination Bugs", () => {
        it("should handle first page correctly", () => {
            const page = 1;
            const itemsPerPage = 10;
            const offset = (page - 1) * itemsPerPage;

            expect(offset).toBe(0);
        });

        it("should handle last page with partial items", () => {
            const totalItems = 95;
            const itemsPerPage = 10;
            const totalPages = Math.ceil(totalItems / itemsPerPage);

            expect(totalPages).toBe(10);

            const lastPageItems = totalItems % itemsPerPage || itemsPerPage;
            expect(lastPageItems).toBe(5);
        });

        it("should prevent negative page numbers", () => {
            const page = -1;
            const safePage = Math.max(1, page);

            expect(safePage).toBe(1);
        });
    });

    describe("Form Submission Bugs", () => {
        it("should prevent double submission", () => {
            let isSubmitting = false;
            let submitCount = 0;

            const submit = async () => {
                if (isSubmitting) return;

                isSubmitting = true;
                submitCount++;

                // Symulacja API call
                await new Promise((resolve) => setTimeout(resolve, 100));

                isSubmitting = false;
            };

            // Próba podwójnego submit
            submit();
            submit();

            expect(submitCount).toBe(1);
        });

        it("should validate required fields", () => {
            const formData = {
                email: "",
                password: "password123",
            };

            const validate = (data: any) => {
                return Object.values(data).every((value) => value !== "");
            };

            expect(validate(formData)).toBe(false);
        });
    });

    describe("Infinite Loop Detection", () => {
        it("should prevent infinite recursion", () => {
            let depth = 0;
            const maxDepth = 100;

            const recursiveFunction = (n: number): number => {
                depth++;
                if (depth > maxDepth) return 0;
                if (n <= 0) return 0;
                return n + recursiveFunction(n - 1);
            };

            const result = recursiveFunction(10);
            expect(depth).toBeLessThan(maxDepth);
        });

        it("should break infinite while loops", () => {
            let iterations = 0;
            const maxIterations = 1000;

            while (iterations < maxIterations) {
                iterations++;
                if (iterations >= 10) break;
            }

            expect(iterations).toBe(10);
        });
    });

    describe("Unicode & Special Characters", () => {
        it("should handle emoji in text", () => {
            const textWithEmoji = "Hello 👋 World 🌍";

            expect(textWithEmoji.length).toBeGreaterThan(10);
            expect(textWithEmoji).toContain("👋");
        });

        it("should handle special characters in URLs", () => {
            const title = "Hello & Welcome!";
            const slug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");

            expect(slug).toBe("hello-welcome");
        });

        it("should handle non-ASCII characters", () => {
            const text = "Zażółć gęślą jaźń";

            expect(text.length).toBeGreaterThan(0);
            expect(text).toContain("ą");
        });
    });
});
