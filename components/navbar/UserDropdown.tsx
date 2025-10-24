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
import { EllipsisVertical, LogOut } from "lucide-react";
import LogoutButton from "../buttons/LogoutButton";
import ChangePassword from "../buttons/ChangePassword";

interface UserDropdownProps {
    name?: string | null;
    email?: string | null;
    avatar?: string | null;
}

export default function UserDropdown({
    name,
    email,
    avatar,
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

            <DropdownMenuContent align="end" className="w-64 p-2">
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

                <DropdownMenuItem>
                    <p>Zmień Plan</p>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <ChangePassword />
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <p>Zmiana Avatara</p>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <p>Ustawienia</p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <LogoutButton />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
