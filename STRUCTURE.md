# 📁 Struktura Projektu - Refaktoryzacja

## ✅ Zreorganizowane komponenty i struktura

### 📂 `/components/auth/` - Komponenty autoryzacji

-   **`EmailPasswordForm.tsx`** - Formularz rejestracji z emailem i hasłem
-   **`LoginForm.tsx`** - Formularz logowania
-   **`VerificationForm.tsx`** - Formularz weryfikacji kodu
-   **`FormInput.tsx`** - Reużywalny komponent input
-   **`SubmitButton.tsx`** - Przycisk submit z różnymi wariantami
-   **`ErrorMessage.tsx`** - Wyświetlanie komunikatów błędów
-   **`SuccessAnimation.tsx`** - Animacja sukcesu
-   **`GoogleLoginButton.tsx`** - Przycisk logowania przez Google

### 📂 `/components/dashboard/` - Komponenty dashboardu

-   **`DashboardHeader.tsx`** - Nagłówek panelu użytkownika
-   **`UnauthenticatedView.tsx`** - Widok dla niezalogowanych użytkowników

### 📂 `/components/buttons/` - Przyciski

-   **`LogoutButton.tsx`** - Przycisk wylogowania
-   **`ChangePassword.tsx`** - Przycisk zmiany hasła (tylko dla email users)
-   **`ChangeAvatar.tsx`** - Pełny interfejs zmiany avatara
-   **`ChangeAvatarMenuItem.tsx`** - Prosty komponent do menu dropdown

### 📂 `/hooks/` - Custom React Hooks

-   **`useRegisterForm.ts`** - Hook do zarządzania stanem formularza rejestracji
-   **`useLoginForm.ts`** - Hook do zarządzania stanem formularza logowania
-   **`usePasswordValidation.ts`** - Hook do walidacji haseł (w useRegisterForm)

### 📂 `/lib/services/` - Serwisy API

-   **`authService.ts`** - Serwis do rejestracji i weryfikacji
-   **`loginService.ts`** - Serwis do logowania

### 📂 `/lib/auth/` - Funkcje autoryzacji

-   **`getUser.ts`** - Pobieranie aktualnie zalogowanego użytkownika

### 📂 `/lib/utils/` - Narzędzia pomocnicze

-   **`apiHelpers.ts`** - Helpery do tworzenia odpowiedzi API

### 📂 `/lib/` - Główne biblioteki

-   **`auth.ts`** - Funkcje hashowania, JWT, zarządzanie użytkownikami
-   **`db.ts`** - Połączenie z bazą danych
-   **`utils.ts`** - Ogólne narzędzia
-   **`r2.ts`** - Klient Cloudflare R2 i operacje na plikach
-   **`imageProcessor.ts`** - Przetwarzanie i optymalizacja obrazów (Sharp)

## 🎯 Zalety nowej struktury

### 1. **Separation of Concerns**

Każdy komponent ma jedną, jasno określoną odpowiedzialność.

### 2. **Reużywalność**

Komponenty jak `FormInput`, `SubmitButton` można używać w całej aplikacji.

### 3. **Testowalność**

Każdy komponent można testować osobno.

### 4. **Maintainability**

Łatwo znaleźć i edytować konkretną funkcjonalność.

### 5. **Type Safety**

Wszystko z TypeScript interfaces i właściwą dokumentacją.

### 6. **Clean Code**

Główne pliki stron są krótkie i czytelne (50-100 linii zamiast 200+).

## 📝 Przykład użycia

### Strona rejestracji (`/app/register/page.tsx`)

```typescript
"use client";

import { useRouter } from "next/navigation";
import {
    useRegisterForm,
    usePasswordValidation,
} from "@/hooks/useRegisterForm";
import { authService } from "@/lib/services/authService";
import ErrorMessage from "@/components/auth/ErrorMessage";
import EmailPasswordForm from "@/components/auth/EmailPasswordForm";
import VerificationForm from "@/components/auth/VerificationForm";

export default function RegisterPage() {
    const router = useRouter();
    const { state, updateField, setError, setLoading } = useRegisterForm();

    // Czysta logika bez mieszania z UI
    const handleSubmit = async (e: React.FormEvent) => {
        // ...
    };

    return (
        <div>
            <ErrorMessage message={state.error} />
            <EmailPasswordForm {...props} />
        </div>
    );
}
```

## 🔐 API Routes - Best Practices

Wszystkie API routes używają:

-   ✅ Właściwej obsługi błędów (try-catch)
-   ✅ Walidacji danych wejściowych
-   ✅ Czytelnych komunikatów błędów
-   ✅ Logowania błędów do konsoli
-   ✅ Odpowiednich kodów HTTP
-   ✅ Helperów z `apiHelpers.ts`

## �️ Nowe funkcjonalności

### Zarządzanie awatarami

-   **Upload**: Automatyczne przetwarzanie do 200x200px WebP
-   **Storage**: Cloudflare R2 z publicznym dostępem
-   **Delete**: Automatyczne usuwanie starych plików
-   **UI**: Dropdown menu + dedykowana strona ustawień

Zobacz szczegóły w [`docs/AVATAR_MANAGEMENT.md`](./docs/AVATAR_MANAGEMENT.md)

### Zarządzanie hasłami

-   **Provider-aware**: Zmiana hasła tylko dla użytkowników email
-   **Verification**: Kod weryfikacyjny wysyłany na email
-   **Security**: Wielopoziomowa walidacja (UI + API + DB)

Zobacz szczegóły w [`docs/PASSWORD_MANAGEMENT.md`](./docs/PASSWORD_MANAGEMENT.md)

## �📚 Dodatkowe zasoby

-   Każda funkcja w `lib/auth.ts` ma JSDoc komentarze
-   Komponenty mają interfejsy TypeScript dla props
-   API routes mają obsługę błędów
-   Pełna dokumentacja w folderze `/docs`
