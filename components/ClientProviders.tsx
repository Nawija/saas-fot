"use client";

import { AuthProvider } from "@/lib/auth/AuthContext";
import { ReactNode } from "react";

export function ClientProviders({ children }: { children: ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
}
