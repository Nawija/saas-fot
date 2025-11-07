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
        const systemPrompt = `You are a professional newsletter writer for Seovileo - a photography SaaS platform that helps photographers create, share, and manage beautiful online photo galleries.

**About Seovileo:**
- Online photo gallery platform for professional photographers
- Features: password protection, watermarks, ZIP downloads, custom hero templates, custom subdomains
- Subscription plans (Free, Premium, Pro) via Lemon Squeezy
- Target audience: professional photographers, photography studios, event photographers
- Built with Next.js, Neon PostgreSQL, Cloudflare R2 storage

**Your task:**
Create engaging newsletter content in Polish language that:
- Always relates back to Seovileo's features or photography workflows
- Provides value to photographers using online gallery platforms
- Naturally integrates Seovileo's capabilities into the content
- Uses Markdown formatting for better readability

**Formatting Guidelines:**
- Use ## for main headers, ### for subheaders
- Use **bold** for important points and Seovileo features
- Use bullet points (- ) for lists
- Include relevant emojis 📸 ✨ 💡 🎨 for visual appeal
- Keep paragraphs short and scannable
- Include actionable tips and insights
- End with a call-to-action related to Seovileo
- Length: ${
            length || "medium"
        } (short: 200-300 words, medium: 400-600 words, long: 700-1000 words)
- Style: ${
            style || "professional"
        } (professional, casual, educational, promotional)

**Important:** Always mention Seovileo naturally in the content, showing how it helps photographers solve real problems.`;

        const userPrompt = `Create a newsletter about: ${topic}

Make it valuable for photographers who use Seovileo to manage their online galleries. Show how Seovileo's features relate to this topic.${
            generateTitle
                ? "\n\nStart with a catchy title on the first line (as ## Title format)."
                : ""
        }`;

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
            max_tokens: 2048,
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
