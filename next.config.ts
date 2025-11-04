import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "pub-53d7668c089b405c91c4867c026d81b0.r2.dev",
                pathname: "/**",
            },
        ],
        // Configure device and image sizes for responsive loading
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        // Use WebP for better compression
        formats: ["image/webp"],
        // Cache images for 60 seconds
        minimumCacheTTL: 60,
        // Security: don't allow SVG
        dangerouslyAllowSVG: false,
        // Loader configuration
        loader: "default",
    },
    // Zwiększ limit body size do 50MB (dla dużych zdjęć)
    experimental: {
        serverActions: {
            bodySizeLimit: "50mb",
        },
    },
};

export default nextConfig;
