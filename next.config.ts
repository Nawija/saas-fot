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
    },
};

export default nextConfig;
