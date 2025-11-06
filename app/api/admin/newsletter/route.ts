import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Pobierz ostatni newsletter
export async function GET() {
    try {
        const result = await query(
            "SELECT id, title, content, created_at, updated_at FROM newsletter_messages ORDER BY created_at DESC LIMIT 1"
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ newsletter: null });
        }

        return NextResponse.json({ newsletter: result.rows[0] });
    } catch (error) {
        console.error("Get newsletter error:", error);
        return NextResponse.json(
            { error: "Failed to fetch newsletter" },
            { status: 500 }
        );
    }
}

// POST - Utwórz nowy newsletter
export async function POST(request: NextRequest) {
    try {
        const { title, content } = await request.json();

        if (!title || !content) {
            return NextResponse.json(
                { error: "Title and content are required" },
                { status: 400 }
            );
        }

        const result = await query(
            "INSERT INTO newsletter_messages (title, content) VALUES ($1, $2) RETURNING *",
            [title, content]
        );

        return NextResponse.json({
            message: "Newsletter created successfully",
            newsletter: result.rows[0],
        });
    } catch (error) {
        console.error("Create newsletter error:", error);
        return NextResponse.json(
            { error: "Failed to create newsletter" },
            { status: 500 }
        );
    }
}

// PUT - Aktualizuj ostatni newsletter
export async function PUT(request: NextRequest) {
    try {
        const { title, content } = await request.json();

        if (!title || !content) {
            return NextResponse.json(
                { error: "Title and content are required" },
                { status: 400 }
            );
        }

        // Pobierz ID ostatniego newslettera
        const lastNewsletter = await query(
            "SELECT id FROM newsletter_messages ORDER BY created_at DESC LIMIT 1"
        );

        if (lastNewsletter.rows.length === 0) {
            // Jeśli nie ma żadnego, utwórz nowy
            const result = await query(
                "INSERT INTO newsletter_messages (title, content) VALUES ($1, $2) RETURNING *",
                [title, content]
            );

            return NextResponse.json({
                message: "Newsletter created successfully",
                newsletter: result.rows[0],
            });
        }

        // Zaktualizuj istniejący
        const result = await query(
            "UPDATE newsletter_messages SET title = $1, content = $2, updated_at = now() WHERE id = $3 RETURNING *",
            [title, content, lastNewsletter.rows[0].id]
        );

        return NextResponse.json({
            message: "Newsletter updated successfully",
            newsletter: result.rows[0],
        });
    } catch (error) {
        console.error("Update newsletter error:", error);
        return NextResponse.json(
            { error: "Failed to update newsletter" },
            { status: 500 }
        );
    }
}
