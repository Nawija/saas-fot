# Dokumentacja Testów

## 📋 Struktura Testów

```
tests/
├── setup.ts                           # Konfiguracja testów
├── mocks/
│   ├── handlers.ts                    # MSW request handlers
│   └── server.ts                      # MSW server setup
├── hooks/
│   ├── useLoginForm.test.ts          # Testy hooka logowania
│   ├── useRegisterForm.test.ts       # Testy hooka rejestracji
│   └── useCollections.test.ts        # Testy hooka kolekcji
├── utils/
│   └── cn.test.ts                    # Testy utility funkcji
└── integration/
    ├── api.test.ts                   # Testy integracyjne API
    └── form-flow.test.ts             # Testy przepływu formularzy
```

## 🚀 Uruchamianie Testów

### Podstawowe komendy:

```bash
# Uruchom wszystkie testy
npm test

# Uruchom testy w trybie watch
npm test -- --watch

# Uruchom testy z interfejsem UI
npm run test:ui

# Wygeneruj raport pokrycia kodu
npm run test:coverage
```

### Uruchamianie konkretnych testów:

```bash
# Uruchom testy dla konkretnego pliku
npm test useLoginForm.test.ts

# Uruchom testy z konkretnym wzorcem
npm test hooks

# Uruchom tylko testy integracyjne
npm test integration
```

## 📝 Typy Testów

### 1. Testy Jednostkowe (Unit Tests)

Testowanie pojedynczych funkcji, hooków i komponentów w izolacji.

**Przykłady:**

-   `tests/hooks/useLoginForm.test.ts` - testuje logikę hooka logowania
-   `tests/hooks/useRegisterForm.test.ts` - testuje walidację haseł i stan formularza
-   `tests/utils/cn.test.ts` - testuje funkcję łączenia klas CSS

**Co testujemy:**

-   ✅ Inicjalizacja z poprawnymi wartościami domyślnymi
-   ✅ Aktualizacja stanu
-   ✅ Walidacja danych
-   ✅ Obsługa błędów
-   ✅ Resetowanie formularzy

### 2. Testy Integracyjne (Integration Tests)

Testowanie współpracy między komponentami, hookami i API.

**Przykłady:**

-   `tests/integration/api.test.ts` - testuje endpointy API z MSW
-   `tests/integration/form-flow.test.ts` - testuje pełny przepływ użytkownika

**Co testujemy:**

-   ✅ Komunikacja formularz ↔ API
-   ✅ Walidacja ↔ wysyłka danych
-   ✅ Obsługa odpowiedzi API (sukces/błąd)
-   ✅ Kompletne ścieżki użytkownika
-   ✅ Synchronizacja stanu między komponentami

## 🔧 Technologie

### Vitest

Framework testowy kompatybilny z Jest, zoptymalizowany dla Vite.

**Główne funkcje:**

-   `describe()` - grupowanie testów
-   `it()` / `test()` - definiowanie pojedynczego testu
-   `expect()` - asercje
-   `beforeEach()`, `afterEach()` - setup/cleanup

### Testing Library

Biblioteka do testowania React z naciskiem na zachowanie użytkownika.

**Główne funkcje:**

-   `renderHook()` - renderowanie hooków
-   `act()` - grupowanie aktualizacji stanu
-   `waitFor()` - czekanie na asynchroniczne operacje
-   `cleanup()` - czyszczenie po testach

### MSW (Mock Service Worker)

Narzędzie do mockowania API requests na poziomie sieci.

**Główne funkcje:**

-   `http.get()`, `http.post()` - definiowanie handlerów
-   `HttpResponse.json()` - mockowanie odpowiedzi
-   `server.listen()`, `server.close()` - zarządzanie serwerem

## 📊 Przykłady Testów

### Test Jednostkowy - Hook

```typescript
describe("useLoginForm", () => {
    it("should update email field", () => {
        const { result } = renderHook(() => useLoginForm());

        act(() => {
            result.current.updateField("email", "test@example.com");
        });

        expect(result.current.state.email).toBe("test@example.com");
    });
});
```

### Test Integracyjny - API + Form

```typescript
describe("Login Integration", () => {
    it("should complete successful login flow", async () => {
        const { result } = renderHook(() => useLoginForm());

        act(() => {
            result.current.updateField("email", "test@example.com");
            result.current.updateField("password", "password123");
            result.current.setLoading(true);
        });

        const response = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: result.current.state.email,
                password: result.current.state.password,
            }),
        });

        const data = await response.json();

        act(() => {
            result.current.setLoading(false);
        });

        expect(data.success).toBe(true);
    });
});
```

## 🎯 Co Jest Testowane

### ✅ Hooki

**useLoginForm:**

-   Inicjalizacja stanu
-   Aktualizacja pól email/password
-   Ustawianie błędów
-   Zarządzanie stanem loading
-   Resetowanie formularza

**useRegisterForm:**

-   Inicjalizacja stanu rejestracji
-   Walidacja haseł (dopasowanie, długość)
-   Obsługa kroku weryfikacji kodem
-   Stan sukcesu rejestracji

**useCollections:**

-   Pobieranie kolekcji
-   Usuwanie kolekcji
-   Obsługa stanów loading/error
-   Integracja z API

### ✅ API Endpoints

**Authentication:**

-   POST /api/auth/login - logowanie
-   POST /api/auth/register - rejestracja

**Collections:**

-   GET /api/collections - lista kolekcji
-   POST /api/collections - tworzenie kolekcji
-   DELETE /api/collections/:id - usuwanie kolekcji

**User:**

-   GET /api/user/profile - profil użytkownika

**Gallery:**

-   GET /api/gallery - obrazy galerii

### ✅ Przepływy Użytkownika

1. **Rejestracja → Logowanie**

    - Walidacja hasła
    - Tworzenie konta
    - Logowanie z nowymi danymi

2. **Logowanie → Dashboard**

    - Wprowadzenie danych
    - Wysyłka do API
    - Obsługa odpowiedzi

3. **Zarządzanie Kolekcjami**
    - Pobieranie listy
    - Tworzenie nowej
    - Usuwanie istniejącej

## 🔍 Dobre Praktyki

### 1. Arrange-Act-Assert (AAA)

```typescript
it("should do something", () => {
    // Arrange - przygotuj dane testowe
    const { result } = renderHook(() => useMyHook());

    // Act - wykonaj akcję
    act(() => {
        result.current.doSomething();
    });

    // Assert - sprawdź rezultat
    expect(result.current.state).toBe(expected);
});
```

### 2. Opisowe Nazwy Testów

```typescript
// ❌ Źle
it('works', () => { ... });

// ✅ Dobrze
it('should validate password length when user submits form', () => { ... });
```

### 3. Testowanie Zachowań, Nie Implementacji

```typescript
// ❌ Źle - testuje implementację
expect(component.state.internalCounter).toBe(1);

// ✅ Dobrze - testuje zachowanie
expect(screen.getByText("Count: 1")).toBeInTheDocument();
```

### 4. Izolacja Testów

```typescript
beforeEach(() => {
    // Reset mocków przed każdym testem
    vi.clearAllMocks();
});

afterEach(() => {
    // Cleanup po każdym teście
    cleanup();
});
```

## 📈 Pokrycie Kodu (Coverage)

Uruchom `npm run test:coverage` aby wygenerować raport pokrycia:

```bash
npm run test:coverage
```

Raport zostanie wygenerowany w folderze `coverage/`:

-   `coverage/index.html` - interaktywny raport HTML
-   `coverage/coverage-final.json` - dane w formacie JSON

**Cel pokrycia:**

-   Statements: > 80%
-   Branches: > 75%
-   Functions: > 80%
-   Lines: > 80%

## 🐛 Debugowanie Testów

### 1. Użyj `console.log()`

```typescript
it("debug test", () => {
    const { result } = renderHook(() => useMyHook());
    console.log("Current state:", result.current.state);
    // ...
});
```

### 2. Użyj `debug()` z Testing Library

```typescript
import { render, screen } from "@testing-library/react";

it("debug component", () => {
    render(<MyComponent />);
    screen.debug(); // Wyświetla aktualny DOM
});
```

### 3. Uruchom pojedynczy test z `.only`

```typescript
it.only("this test only", () => {
    // Tylko ten test zostanie uruchomiony
});
```

### 4. Pomiń test z `.skip`

```typescript
it.skip("skip this test", () => {
    // Ten test zostanie pominięty
});
```

## 🔄 CI/CD Integration

Dodaj do GitHub Actions / CI pipeline:

```yaml
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## 📚 Dodatkowe Zasoby

-   [Vitest Documentation](https://vitest.dev/)
-   [Testing Library Documentation](https://testing-library.com/)
-   [MSW Documentation](https://mswjs.io/)
-   [Kent C. Dodds - Testing Blog](https://kentcdodds.com/blog/)

## 🎓 Następne Kroki

1. **Dodaj więcej testów dla:**

    - Komponentów UI
    - Serwisów API
    - Utility funkcji

2. **Zwiększ pokrycie kodu:**

    - Dodaj testy edge cases
    - Testuj scenariusze błędów
    - Testuj edge conditions

3. **Optymalizuj testy:**

    - Zredukuj duplikację
    - Użyj test fixtures
    - Stwórz custom test utilities

4. **Automatyzacja:**
    - Dodaj pre-commit hooks
    - Skonfiguruj CI/CD
    - Automatyczne raporty pokrycia
