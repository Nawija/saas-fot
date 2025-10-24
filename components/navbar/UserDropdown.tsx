"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LogoutButton from "../buttons/LogoutButton";
import ChangePassword from "../buttons/ChangePassword";
import Link from "next/link";
import { Settings, CreditCard } from "lucide-react";

interface UserDropdownProps {
    name?: string | null;
    email?: string | null;
    avatar?: string | null;
    provider?: string | null;
}

export default function UserDropdown({
    name,
    email,
    avatar,
    provider,
}: UserDropdownProps) {
    const displayName = name || email?.split("@")[0] || "Użytkownik";
    const avatarUrl = avatar && avatar.trim() !== "" ? avatar : "/avatar.jpg";
    const fallback = displayName.charAt(0).toUpperCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="rounded-full relative focus:outline-none border border-gray-300 focus:ring-2 focus:ring-offset-2 focus:ring-gray-200">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={avatarUrl} alt={displayName} />
                        <AvatarFallback>{fallback}</AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 p-2 mt-3">
                <DropdownMenuLabel className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={avatarUrl} alt={displayName} />
                        <AvatarFallback>{fallback}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <b>{displayName}</b>
                        <span className="text-xs text-gray-500">{email}</span>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link
                        href="/dashboard/billing"
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <CreditCard size={16} />
                        <span>Subskrypcja i płatności</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <Settings size={16} />
                        <span>Ustawienia profilu</span>
                    </Link>
                </DropdownMenuItem>

                {/* Opcja zmiany hasła tylko dla użytkowników z emailem */}
                {provider === "email" && (
                    <DropdownMenuItem>
                        <ChangePassword />
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <LogoutButton />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
