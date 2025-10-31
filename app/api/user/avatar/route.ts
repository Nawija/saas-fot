import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { createErrorResponse } from "@/lib/utils/apiHelpers";
import { uploadToR2, deleteFromR2, extractKeyFromUrl } from "@/lib/r2";
import {
    processAvatarImage,
    isValidImageType,
    generateAvatarKey,
} from "@/lib/imageProcessor";
import { query } from "@/lib/db";
import { canUploadFile } from "@/lib/storage";

export async function POST(req: NextRequest) {
    try {
        // Sprawdź czy użytkownik jest zalogowany
        const user = await getUser();
        if (!user) {
            return createErrorResponse("Nie zalogowano", 401);
        }

        // Pobierz plik z formularza
        const formData = await req.formData();
        const file = formData.get("avatar") as File;

        if (!file) {
            return createErrorResponse("Brak pliku", 400);
        }

        // Walidacja typu pliku
        if (!isValidImageType(file.type)) {
            return createErrorResponse(
                "Nieprawidłowy typ pliku. Dozwolone: JPG, PNG, WEBP, GIF",
                400
            );
        }

        // Konwertuj plik do bufora
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Przetwórz obraz (resize, optymalizacja)
        const { buffer: processedBuffer, contentType } =
            await processAvatarImage(buffer);

        // Avatar nie jest liczony do storage_used (tak jak hero_image)
        // Tylko zdjęcia w galeriach zajmują miejsce w limicie

        // Usuń stary avatar jeśli istnieje
        if (user.avatar) {
            const oldKey = extractKeyFromUrl(user.avatar);
            if (oldKey) {
                await deleteFromR2(oldKey);
            }
        }

        // Wygeneruj nową nazwę pliku
        const key = generateAvatarKey(user.id);

        // Prześlij do R2
        const avatarUrl = await uploadToR2(processedBuffer, key, contentType);

        // Zaktualizuj URL avatara w bazie danych
        await query("UPDATE users SET avatar = $1 WHERE id = $2", [
            avatarUrl,
            user.id,
        ]);

        return NextResponse.json({
            ok: true,
            avatarUrl,
            message: "Avatar został zaktualizowany",
        });
    } catch (error: any) {
        console.error("Upload avatar error:", error);
        return createErrorResponse(
            error.message || "Błąd podczas przesyłania avatara",
            500
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        // Sprawdź czy użytkownik jest zalogowany
        const user = await getUser();
        if (!user) {
            return createErrorResponse("Nie zalogowano", 401);
        }

        if (!user.avatar) {
            return createErrorResponse("Brak avatara do usunięcia", 400);
        }

        // Usuń z R2
        const key = extractKeyFromUrl(user.avatar);
        if (key) {
            await deleteFromR2(key);
        }

        // Usuń URL z bazy danych
        await query("UPDATE users SET avatar = NULL WHERE id = $1", [user.id]);

        return NextResponse.json({
            ok: true,
            message: "Avatar został usunięty",
        });
    } catch (error: any) {
        console.error("Delete avatar error:", error);
        return createErrorResponse(
            error.message || "Błąd podczas usuwania avatara",
            500
        );
    }
}
