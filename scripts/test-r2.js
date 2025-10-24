/**
 * Test script dla połączenia z Cloudflare R2
 * Uruchom: node scripts/test-r2.js
 */

require("dotenv").config({ path: ".env" });
const {
    S3Client,
    ListObjectsV2Command,
    PutObjectCommand,
} = require("@aws-sdk/client-s3");

const r2Client = new S3Client({
    region: process.env.R2_REGION || "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.R2_BUCKET;

async function testR2Connection() {
    console.log("🔍 Testowanie połączenia z R2...\n");
    console.log("Konfiguracja:");
    console.log("  Endpoint:", process.env.R2_ENDPOINT);
    console.log("  Bucket:", BUCKET_NAME);
    console.log("  Region:", process.env.R2_REGION);
    console.log("  Public Domain:", process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN);
    console.log("");

    try {
        // Test 1: Lista plików w bucket
        console.log("📋 Test 1: Listowanie plików...");
        const listCommand = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            MaxKeys: 10,
        });

        const listResult = await r2Client.send(listCommand);
        console.log(`✅ Znaleziono ${listResult.Contents?.length || 0} plików`);

        if (listResult.Contents && listResult.Contents.length > 0) {
            console.log("   Przykładowe pliki:");
            listResult.Contents.slice(0, 3).forEach((file) => {
                console.log(`   - ${file.Key} (${file.Size} bytes)`);
            });
        }
        console.log("");

        // Test 2: Upload testowego pliku
        console.log("📤 Test 2: Upload testowego pliku...");
        const testContent = Buffer.from("Test file from avatar system");
        const testKey = `test/test-${Date.now()}.txt`;

        const uploadCommand = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: testKey,
            Body: testContent,
            ContentType: "text/plain",
        });

        await r2Client.send(uploadCommand);
        console.log(`✅ Plik przesłany: ${testKey}`);
        console.log(
            `   URL: ${process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN}/${testKey}`
        );
        console.log("");

        console.log("🎉 Wszystkie testy zakończone sukcesem!");
        console.log("");
        console.log("💡 Możesz teraz używać systemu awatarów");
    } catch (error) {
        console.error("❌ Błąd podczas testowania R2:");
        console.error(error.message);
        console.log("");
        console.log("Sprawdź:");
        console.log("  1. Czy zmienne w .env są poprawne");
        console.log("  2. Czy masz dostęp do bucket");
        console.log("  3. Czy endpoint jest prawidłowy");
    }
}

testR2Connection();
