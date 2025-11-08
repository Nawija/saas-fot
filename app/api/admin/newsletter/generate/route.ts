import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const {
            topic,
            style,
            length,
            generateTitle = true,
        } = await request.json();

        if (!topic) {
            return NextResponse.json(
                { error: "Topic is required" },
                { status: 400 }
            );
        }

        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json(
                { error: "GROQ_API_KEY not configured" },
                { status: 500 }
            );
        }

        // Przygotuj prompt dla AI z kontekstem Seovileo
        const lengthLimits = {
            short: { words: 200, max: 300, description: "200-300 words" },
            medium: { words: 500, max: 600, description: "400-600 words" },
            long: { words: 800, max: 1000, description: "700-1000 words" },
        };

        const selectedLength =
            lengthLimits[length as keyof typeof lengthLimits] ||
            lengthLimits.medium;

        const systemPrompt = `You are a professional newsletter writer for Seovileo - a photography SaaS platform that helps create, share, and manage beautiful online photo galleries.

**About Seovileo:**
- Website: https://seovileo.pl
- Main Platform: https://seovileo.pl/dashboard
- Registration: https://seovileo.pl/login
- Login: https://seovileo.pl/login
- Pricing: https://seovileo.pl/dashboard (check subscription plans)
- Newsletter: https://seovileo.pl/newsletter
- Features: password protection, ZIP downloads, custom hero templates, custom private subdomains
- Subscription plans (Free, Premium, Pro) via Lemon Squeezy
- Target audience: professional photographers, photography studios, event managers, designers, architects

**Important Links to Include in Content:**
When writing about Seovileo features, ALWAYS include relevant clickable links using Markdown format [text](url):
- "Zarejestruj się" or "Załóż konto" → [Zarejestruj się na Seovileo](https://seovileo.pl/register)
- "Zaloguj się" or "Dashboard" → [Panel administracyjny](https://seovileo.pl/dashboard)
- "Strona główna" or "Seovileo" → [Seovileo.pl](https://seovileo.pl)
- "Newsletter" → [Zapisz się do newslettera](https://seovileo.pl/newsletter)
- "Wypróbuj" or "Sprawdź" → [Wypróbuj Seovileo za darmo](https://seovileo.pl/login)

**Your task:**
Create engaging newsletter content in Polish language that:
- Always relates back to Seovileo's features or photography workflows
- Provides value to using online gallery platforms
- Naturally integrates Seovileo's capabilities into the content
- **ALWAYS includes at least 2-3 clickable links** to Seovileo pages using Markdown [text](url) format
- Uses Markdown formatting for better readability

**Formatting Guidelines:**
- Use ## for main headers, ### for subheaders
- Use **bold** for important points and Seovileo features
- Use bullet points (- ) for lists
- **MUST use [link text](URL)** format for all Seovileo links - minimum 2-3 links per newsletter
- Include relevant emojis 📸 ✨ 💡 🎨 for visual appeal
- Keep paragraphs short and scannable
- Include actionable tips and insights
- End with a strong call-to-action with a link (e.g., [Wypróbuj Seovileo już dziś](https://seovileo.pl/register))
- Style: ${
            style || "professional"
        } (professional, casual, educational, promotional)

**LENGTH REQUIREMENT - CRITICAL:**
- Target length: ${selectedLength.description}
- MAXIMUM ${selectedLength.max} words - DO NOT EXCEED THIS LIMIT
- Aim for approximately ${selectedLength.words} words
- Be concise and focused - quality over quantity
- If you reach the word limit, stop writing and conclude with a CTA

**CRITICAL:** Every newsletter MUST contain at least 2-3 clickable Markdown links to Seovileo pages. Example:
"Dzięki [Seovileo](https://seovileo.pl) możesz łatwo zarządzać swoimi galeriami. [Wypróbuj za darmo](https://seovileo.pl/register) już dziś!"

**Important:** Always mention Seovileo naturally in the content with working links, showing how it helps solve real problems.`;

        const userPrompt = `Create a newsletter about: ${topic}

Make it valuable for photographers who use Seovileo to manage their online galleries. Show how Seovileo's features relate to this topic.

STRICT REQUIREMENTS:
1. LENGTH: Write MAXIMUM ${selectedLength.max} words (target: ${
            selectedLength.words
        } words)
2. Count your words as you write and STOP when you reach the limit
3. Include at least 2-3 clickable Markdown links [text](url) to Seovileo pages
4. Use natural Polish language for link text
5. Be concise - make every word count

${
    generateTitle
        ? "Start with a catchy title on the first line (as ## Title format)."
        : ""
}

REMEMBER: Quality over quantity. Stop at ${selectedLength.max} words maximum!`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: userPrompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens:
                length === "short" ? 600 : length === "medium" ? 1200 : 2048,
        });

        const generatedContent = completion.choices[0]?.message?.content;

        if (!generatedContent) {
            return NextResponse.json(
                { error: "Failed to generate content" },
                { status: 500 }
            );
        }

        let title = "";
        let content = generatedContent;

        if (generateTitle) {
            // Wyodrębnij tytuł z pierwszej linii (jeśli jest to nagłówek)
            const lines = generatedContent.trim().split("\n");

            // Sprawdź czy pierwsza linia to tytuł (zaczyna się od # lub ##)
            if (lines[0].startsWith("#")) {
                title = lines[0].replace(/^#+\s*/, "").trim();
                content = lines.slice(1).join("\n").trim();
            } else {
                // Jeśli nie ma nagłówka, użyj tematu jako tytułu
                title = topic;
            }
        }

        return NextResponse.json({
            title: generateTitle ? title : "",
            content,
            metadata: {
                model: completion.model,
                tokens: completion.usage?.total_tokens || 0,
            },
        });
    } catch (error) {
        console.error("Newsletter generation error:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to generate newsletter",
            },
            { status: 500 }
        );
    }
}
