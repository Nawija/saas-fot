export function getThumbnailUrl(filePath: string): string {
    // Sprawdź czy jest .webp
    if (filePath.endsWith(".webp")) {
        return filePath.replace(".webp", "t.webp");
    }
    // Dla innych rozszerzeń - dodaj -thumb przed ostatnią kropką
    const lastDotIndex = filePath.lastIndexOf(".");
    if (lastDotIndex > -1) {
        return (
            filePath.slice(0, lastDotIndex) + "t" + filePath.slice(lastDotIndex)
        );
    }
    // Fallback - po prostu dodj na końcu
    return filePath + "t";
}
