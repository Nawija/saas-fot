# 🚀 Quick Start - Avatar Upload

## 1. Instalacja pakietów

```bash
npm install @aws-sdk/client-s3 sharp
```

## 2. Konfiguracja `.env`

```env
# Cloudflare R2
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_BUCKET=foto
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_REGION=auto
NEXT_PUBLIC_R2_PUBLIC_DOMAIN=https://pub-xxx.r2.dev
```

## 3. Użycie w komponencie

### Prosty upload (w dropdown menu):

```tsx
import ChangeAvatarMenuItem from "@/components/buttons/ChangeAvatarMenuItem";

<DropdownMenuItem>
    <ChangeAvatarMenuItem />
</DropdownMenuItem>;
```

### Pełny interfejs (na stronie ustawień):

```tsx
import ChangeAvatar from "@/components/buttons/ChangeAvatar";

<ChangeAvatar currentAvatar={user.avatar} />;
```

## 4. API Endpoints

### Upload:

```typescript
POST /api/user/avatar
Content-Type: multipart/form-data
Body: { avatar: File }
```

### Delete:

```typescript
DELETE / api / user / avatar;
```

## 5. Dostęp do avatara

```tsx
const user = await getUser();
const avatarUrl = user.avatar || "/avatar.jpg";

<AvatarImage src={avatarUrl} />;
```

## Proces przetwarzania

```
Original Image (2000x3000px, 2MB JPEG)
           ↓
    Sharp Processing
           ↓
Result Image (200x200px, 15KB WebP)
           ↓
    Upload to R2
           ↓
Public URL: https://pub-xxx.r2.dev/avatars/user-123-xxx.webp
```

## Testowanie

1. **Upload**: Zaloguj się → Kliknij avatar → "Zmień avatar" → Wybierz plik
2. **Preview**: Avatar powinien się zmienić po refresh
3. **Delete**: Kliknij "Usuń" → Potwierdź → Avatar wraca do domyślnego

## Troubleshooting

### Błąd: "Cannot find module '@aws-sdk/client-s3'"

```bash
npm install @aws-sdk/client-s3
```

### Błąd: "Cannot find module 'sharp'"

```bash
npm install sharp
```

### Błąd: "Plik jest za duży"

-   Maksymalny rozmiar: 5MB
-   Spróbuj skompresować obraz przed uploadem

### Avatar nie pojawia się

-   Sprawdź `NEXT_PUBLIC_R2_PUBLIC_DOMAIN` w `.env`
-   Sprawdź czy bucket jest publiczny
-   Sprawdź URL w bazie danych
