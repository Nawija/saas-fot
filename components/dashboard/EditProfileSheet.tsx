"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import MainButton from "../buttons/MainButton";

interface EditProfileSheetProps {
    currentName?: string;
    currentBio?: string;
}

export default function EditProfileSheet({
    currentName,
    currentBio,
}: EditProfileSheetProps) {
    const router = useRouter();
    const [name, setName] = useState(currentName || "");
    const [bio, setBio] = useState(currentBio || "Photo galleries & portfolio");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, bio }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to update profile");
                return;
            }

            // Close sheet and refresh page
            setOpen(false);
            router.refresh();
        } catch (err) {
            console.error("Error updating profile:", err);
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <MainButton
                    icon={<Pencil className="w-4 h-4" />}
                    label="Edit Profile"
                />
            </SheetTrigger>
            <SheetContent className="px-6">
                <form onSubmit={handleSubmit}>
                    <SheetHeader>
                        <SheetTitle>Edit Profile</SheetTitle>
                        <SheetDescription>
                            Update your name and bio. This information will be
                            displayed on your public portfolio.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-6 py-6 px-3">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                maxLength={100}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Photo galleries & portfolio"
                                className="min-h-[100px] resize-none"
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-500">
                                {bio.length}/500 characters
                            </p>
                        </div>
                    </div>

                    <SheetFooter >
                        <SheetClose asChild>
                            <MainButton
                                loading={loading}
                                label="Cancel"
                                variant="secondary"
                            />
                        </SheetClose>

                        <MainButton
                            type="submit"
                            loading={loading}
                            loadingText="Saving"
                            label="Save Changes"
                     
                        />
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
