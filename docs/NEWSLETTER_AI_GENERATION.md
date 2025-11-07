# Newsletter AI Generation - Groq Setup Guide

## 🚀 Szybki Start

Funkcja generowania newslettera za pomocą AI używa **Groq API** z modelem **Llama 3.3 70B**.

### 1. Zdobądź klucz API Groq

1. Odwiedź [console.groq.com](https://console.groq.com)
2. Zarejestruj się lub zaloguj (darmowe konto!)
3. Przejdź do sekcji **API Keys**
4. Kliknij **Create API Key**
5. Skopiuj wygenerowany klucz

### 2. Dodaj klucz do zmiennych środowiskowych

Dodaj do pliku `.env`:

```env
GROQ_API_KEY=gsk_your_api_key_here
```

### 3. Gotowe! 🎉

Teraz możesz generować newslettery w panelu admina: `/admin/newsletter`

## 📝 Jak używać

1. Otwórz panel admina newslettera
2. Kliknij przycisk **"Generate with AI"** (z ikoną różdżki ✨)
3. Wypełnij formularz:
    - **Topic**: O czym ma być newsletter (np. "Photography tips for beginners")
    - **Style**: Professional / Casual / Educational / Promotional
    - **Length**: Short / Medium / Long
4. Kliknij **"Generate Newsletter"**
5. AI wygeneruje tytuł i treść newslettera
6. Możesz edytować wygenerowaną treść przed zapisaniem

## 🎨 Co AI generuje?

AI tworzy newsletter w formacie Markdown z:

-   ✅ Angażującym tytułem
-   ✅ Strukturą z nagłówkami (##, ###)
-   ✅ Pogrubieniem (**tekst**) dla ważnych punktów
-   ✅ Listami punktowanymi (-)
-   ✅ Emoji dla lepszej wizualizacji 📸 ✨ 💡
-   ✅ Call-to-action na końcu
-   ✅ Treścią w języku polskim

## 🔧 Konfiguracja

### Dostępne modele Groq:

Obecnie używamy: `llama-3.3-70b-versatile`

Inne dostępne modele (możesz zmienić w `app/api/admin/newsletter/generate/route.ts`):

-   `llama-3.3-70b-versatile` (obecnie używany) - najnowszy, najlepszy model
-   `llama-3.1-8b-instant` - szybszy, mniej zaawansowany
-   `mixtral-8x7b-32768` - dobry do długich tekstów
-   `gemma2-9b-it` - alternatywa Google

### Parametry generowania:

```typescript
{
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,        // Kreatywność (0.0-2.0)
    max_tokens: 2048,        // Maksymalna długość
}
```

## 💰 Koszty

Groq oferuje **DARMOWY** tier z:

-   30 requestów/minutę
-   14,400 requestów/dzień
-   Szybkie odpowiedzi (zazwyczaj 1-3 sekundy)

To wystarczy dla większości przypadków użycia!

## 🐛 Troubleshooting

### Error: "GROQ_API_KEY not configured"

-   Sprawdź czy dodałeś klucz do `.env`
-   Upewnij się że restart serwera Next.js po dodaniu zmiennej
-   Sprawdź czy nazwa zmiennej to dokładnie `GROQ_API_KEY`

### Error: "Invalid API key"

-   Wygeneruj nowy klucz w console.groq.com
-   Upewnij się że klucz zaczyna się od `gsk_`

### AI generuje treść po angielsku

-   W prompt systemowym jest wymóg języka polskiego
-   Możesz dodać "w języku polskim" do Topic

### Generowanie trwa zbyt długo

-   Groq jest bardzo szybki (1-3 sekundy)
-   Jeśli trwa dłużej, sprawdź połączenie internetowe
-   Rozważ zmianę modelu na `llama-3.1-8b-instant`

## 📊 Monitoring

API zwraca informacje o użyciu:

```json
{
    "title": "Generated Title",
    "content": "Generated content...",
    "metadata": {
        "model": "llama-3.1-70b-versatile",
        "tokens": 1234
    }
}
```

## 🔗 Przydatne linki

-   [Groq Console](https://console.groq.com)
-   [Groq Documentation](https://console.groq.com/docs)
-   [Groq Models](https://console.groq.com/docs/models)

## 📌 Przykłady promptów

### Dobre prompty:

-   ✅ "Photography composition rules with practical examples"
-   ✅ "How to use watermarks effectively in online galleries"
-   ✅ "5 tips for organizing photo sessions with clients"

### Słabe prompty:

-   ❌ "Photos" (zbyt ogólne)
-   ❌ "Newsletter" (brak tematu)
-   ❌ "Write something" (brak kierunku)

## 🎯 Best Practices

1. **Bądź konkretny** w Topic
2. **Wybierz odpowiedni styl** dla grupy docelowej
3. **Zawsze przejrzyj** wygenerowaną treść przed wysłaniem
4. **Personalizuj** - dodaj własne przykłady lub wzmianki
5. **Testuj różne długości** dla różnych tematów

---

**Potrzebujesz pomocy?** Sprawdź [Groq Discord](https://discord.gg/groq) lub dokumentację API.
