# EmailInput Component

Uniwersalny komponent do wprowadzania adresów email z walidacją i stylowaniem.

## Wykorzystanie

```tsx
import { EmailInput } from "@/components/ui/email-input";

function MyForm() {
    const [email, setEmail] = useState("");

    return (
        <EmailInput
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            label="Email Address"
            required
        />
    );
}
```

## Props

| Prop         | Type                  | Default | Description                                        |
| ------------ | --------------------- | ------- | -------------------------------------------------- |
| `label`      | `string`              | -       | Opcjonalna etykieta nad inputem                    |
| `error`      | `string`              | -       | Komunikat błędu do wyświetlenia                    |
| `helperText` | `string`              | -       | Tekst pomocniczy pod inputem                       |
| `className`  | `string`              | -       | Dodatkowe klasy CSS                                |
| ...props     | `HTMLInputAttributes` | -       | Wszystkie standardowe atrybuty input[type="email"] |

## Przykłady

### Podstawowe użycie

```tsx
<EmailInput
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Enter your email"
/>
```

### Z etykietą

```tsx
<EmailInput
    label="Email Address"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="your.email@example.com"
    required
/>
```

### Z błędem walidacji

```tsx
<EmailInput
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    error="Please enter a valid email address"
/>
```

### Z tekstem pomocniczym

```tsx
<EmailInput
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    helperText="We'll never share your email with anyone"
/>
```

### Dostosowany styl

```tsx
<EmailInput
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="h-14 text-lg bg-gray-50"
/>
```

## Gdzie używany

-   `/app/newsletter/page.tsx` - Formularz newsletter subscribe/unsubscribe
-   `/components/NewsletterSection.tsx` - Sekcja newsletter na stronie głównej

## Stylowanie

Komponent używa Tailwind CSS i jest zgodny z design system aplikacji:

-   Focus ring w kolorze purple-500
-   Czerwony border i komunikat przy błędzie
-   Disabled state z opacity-50
-   Zaokrąglone rogi (rounded-xl)
-   Responsywne wysokości

## Dostępność

-   Automatyczny typ `email` z natywną walidacją przeglądarki
-   Label powiązany z inputem przez `htmlFor`
-   Komunikaty błędów z ikoną dla lepszej widoczności
-   Disabled state z odpowiednim cursorem
