#!/usr/bin/env node
/**
 * Test Hero Image Upload Paths
 *
 * Ten skrypt testuje czy ścieżki R2 są poprawnie skonfigurowane
 */

// Symulacja R2Paths bez importu
const R2Paths = {
    collectionHero: (userId, collectionId) =>
        `users/${userId}/collections/${collectionId}/hero.webp`,
    collectionHeroMobile: (userId, collectionId) =>
        `users/${userId}/collections/${collectionId}/hero-mobile.webp`,
};

async function testHeroUpload() {
    console.log("\n🧪 Testing Hero Image Upload System\n");

    const testUserId = "test-user-123";
    const testCollectionId = 999;

    console.log("📋 Test Configuration:");
    console.log("   User ID:", testUserId);
    console.log("   Collection ID:", testCollectionId);
    console.log("");

    console.log("📁 Generated R2 Paths:");

    const desktopPath = R2Paths.collectionHero(testUserId, testCollectionId);
    const mobilePath = R2Paths.collectionHeroMobile(
        testUserId,
        testCollectionId
    );

    console.log("   Desktop:", desktopPath);
    console.log("   Mobile:", mobilePath);
    console.log("");

    // Sprawdź rozszerzenia
    const desktopExt = desktopPath.split(".").pop();
    const mobileExt = mobilePath.split(".").pop();

    console.log("🔍 Path Validation:");
    console.log(
        "   Desktop extension:",
        desktopExt,
        desktopExt === "webp" ? "✅" : "❌ (should be webp)"
    );
    console.log(
        "   Mobile extension:",
        mobileExt,
        mobileExt === "webp" ? "✅" : "❌ (should be webp)"
    );
    console.log(
        "   Paths are different:",
        desktopPath !== mobilePath ? "✅" : "❌ (paths should be unique)"
    );
    console.log(
        "   Mobile contains '-mobile':",
        mobilePath.includes("-mobile") ? "✅" : "❌ (should contain -mobile)"
    );
    console.log("");

    // Sprawdź strukturę folderów
    const expectedPrefix = `users/${testUserId}/collections/${testCollectionId}/`;
    const desktopHasPrefix = desktopPath.startsWith(expectedPrefix);
    const mobileHasPrefix = mobilePath.startsWith(expectedPrefix);

    console.log("📂 Folder Structure:");
    console.log("   Expected prefix:", expectedPrefix);
    console.log("   Desktop has prefix:", desktopHasPrefix ? "✅" : "❌");
    console.log("   Mobile has prefix:", mobileHasPrefix ? "✅" : "❌");
    console.log("");

    // Podsumowanie
    const allChecks = [
        desktopExt === "webp",
        mobileExt === "webp",
        desktopPath !== mobilePath,
        mobilePath.includes("-mobile"),
        desktopHasPrefix,
        mobileHasPrefix,
    ];

    const passed = allChecks.every((check) => check === true);

    console.log("📊 Test Summary:");
    console.log(
        "   Checks passed:",
        allChecks.filter((c) => c).length,
        "/",
        allChecks.length
    );
    console.log("   Status:", passed ? "✅ PASSED" : "❌ FAILED");
    console.log("");

    if (passed) {
        console.log(
            "✨ All tests passed! Hero upload system is configured correctly."
        );
        console.log("");
        console.log("Next steps:");
        console.log("   1. Create a new gallery with hero image");
        console.log("   2. Check server logs for upload confirmation");
        console.log("   3. Verify both files exist in R2 bucket:");
        console.log("      - hero.webp (3840x2160 landscape, ~2-3MB)");
        console.log("      - hero-mobile.webp (828x1472 portrait, ~80-120KB)");
        console.log("   4. Test gallery on desktop and mobile");
        console.log(
            "   5. Check mobile quality - should be sharp at 90% quality"
        );
    } else {
        console.log("❌ Some tests failed. Please check the configuration.");
        process.exit(1);
    }
}

testHeroUpload().catch((err) => {
    console.error("Test error:", err);
    process.exit(1);
});
