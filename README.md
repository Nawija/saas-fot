# 📸 SaaS dla Fotografów

Nowoczesna aplikacja SaaS do zarządzania galeriami zdjęć dla fotografów i ich klientów.

## ✨ Funkcjonalności

### 🔐 Autoryzacja

-   Rejestracja z weryfikacją email (kod 6-cyfrowy)
-   Logowanie przez email i hasło
-   Google OAuth
-   Zmiana hasła (tylko dla użytkowników email)
-   JWT tokens + HttpOnly cookies

### 👤 Zarządzanie profilem

-   **Awatary użytkownika**:
    -   Upload własnego avatara
    -   Automatyczne przetwarzanie (200x200px WebP)
    -   Przechowywanie w Cloudflare R2
    -   Możliwość usunięcia
-   Profil użytkownika z danymi
-   Różne uprawnienia dla email vs Google users

### 📁 Przechowywanie plików

-   Cloudflare R2 (S3-compatible)
-   Automatyczna optymalizacja obrazów (Sharp)
-   Publiczny dostęp do plików
-   Zarządzanie przestrzenią

## 🚀 Quick Start

### 1. Instalacja

```bash
npm install
```

### 2. Konfiguracja `.env`

```env
# Database
DATABASE_URL=your_postgresql_url

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Email (opcjonalne)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cloudflare R2
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_BUCKET=foto
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_REGION=auto
NEXT_PUBLIC_R2_PUBLIC_DOMAIN=https://pub-xxx.r2.dev

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Uruchomienie

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
