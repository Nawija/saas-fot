/**
 * Test skrypt dla funkcji usuwania konta
 *
 * Proces usuwania konta:
 * 1. Anuluj/usuń subskrypcję w Lemon Squeezy
 * 2. Usuń wszystkie pliki z R2 (folder users/{userId}/)
 * 3. Usuń dane z bazy:
 *    - photos (ON DELETE CASCADE)
 *    - collections (ON DELETE CASCADE)
 *    - password_reset_codes (ON DELETE CASCADE)
 *    - photo_likes (ON DELETE CASCADE przez photos)
 *    - users
 * 4. Wyloguj użytkownika (usuń token)
 */

console.log("✅ Delete Account Flow:");
console.log("");
console.log("1. POST /api/user/delete-account");
console.log("   ├─ Cancel Lemon Squeezy subscription (DELETE)");
console.log("   ├─ Delete R2 files: users/{userId}/**");
console.log("   ├─ Delete photos (CASCADE)");
console.log("   ├─ Delete collections (CASCADE)");
console.log("   ├─ Delete user");
console.log("   └─ Clear auth cookie");
console.log("");
console.log("2. Redirect to homepage");
console.log("");
console.log("⚠️  UWAGA: Ta operacja jest NIEODWRACALNA!");
console.log("");
console.log("Testowanie:");
console.log("- Utwórz testowe konto");
console.log("- Dodaj kilka kolekcji i zdjęć");
console.log("- Opcjonalnie: Wykup subskrypcję testową");
console.log("- Przejdź do /dashboard/profile");
console.log('- Kliknij "Usuń konto na zawsze"');
console.log("- Potwierdź w dialogu");
console.log("- Sprawdź czy:");
console.log("  ✓ Brak plików w R2 (users/{userId}/)");
console.log("  ✓ Brak rekordów w bazie danych");
console.log("  ✓ Subskrypcja anulowana w Lemon Squeezy");
console.log("  ✓ Przekierowanie na homepage");
