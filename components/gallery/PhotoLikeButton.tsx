"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface PhotoLikeButtonProps {
    photoId: number;
    onLikeCountChange?: (count: number) => void;
}

const GUEST_EMAIL_KEY = "gallery_guest_email";

export default function PhotoLikeButton({
    photoId,
    onLikeCountChange,
}: PhotoLikeButtonProps) {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    // Load guest email from localStorage
    useEffect(() => {
        const storedEmail = localStorage.getItem(GUEST_EMAIL_KEY);
        if (storedEmail) {
            setEmail(storedEmail);
            fetchLikeStatus(storedEmail);
        } else {
            // Just fetch count without checking liked status
            fetchLikeCount();
        }
    }, [photoId]);

    const fetchLikeCount = async () => {
        try {
            const res = await fetch(`/api/photos/${photoId}/like`);
            if (res.ok) {
                const data = await res.json();
                setLikeCount(data.likeCount);
                if (onLikeCountChange) {
                    onLikeCountChange(data.likeCount);
                }
            }
        } catch (error) {
            console.error("Error fetching like count:", error);
        }
    };

    const fetchLikeStatus = async (guestEmail: string) => {
        try {
            const res = await fetch(
                `/api/photos/${photoId}/like?email=${encodeURIComponent(
                    guestEmail
                )}`
            );
            if (res.ok) {
                const data = await res.json();
                setLiked(data.liked);
                setLikeCount(data.likeCount);
                if (onLikeCountChange) {
                    onLikeCountChange(data.likeCount);
                }
            }
        } catch (error) {
            console.error("Error fetching like status:", error);
        }
    };

    const validateEmail = (email: string): boolean => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleEmailSubmit = () => {
        setEmailError("");

        if (!email.trim()) {
            setEmailError("Email is required");
            return;
        }

        if (!validateEmail(email)) {
            setEmailError("Please enter a valid email");
            return;
        }

        // Save email to localStorage
        localStorage.setItem(GUEST_EMAIL_KEY, email);
        setEmailDialogOpen(false);

        // Proceed with like
        toggleLike(email);
    };

    const handleLikeClick = () => {
        const storedEmail = localStorage.getItem(GUEST_EMAIL_KEY);
        if (!storedEmail) {
            setEmailDialogOpen(true);
        } else {
            toggleLike(storedEmail);
        }
    };

    const toggleLike = async (guestEmail: string) => {
        setLoading(true);

        try {
            const method = liked ? "DELETE" : "POST";
            const res = await fetch(`/api/photos/${photoId}/like`, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: guestEmail }),
            });

            const data = await res.json();

            if (res.ok) {
                setLiked(data.liked);
                setLikeCount(data.likeCount);
                if (onLikeCountChange) {
                    onLikeCountChange(data.likeCount);
                }
                toast.success(data.liked ? "Liked!" : "Unliked");
            } else if (res.status === 409) {
                // Already liked - just update UI 
                setLiked(true);
                fetchLikeStatus(guestEmail);
            } else {
                toast.error(data.error || "Failed to update like");
            }
        } catch (error) {
            console.error("Error toggling like:", error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLikeClick();
                }}
                onPointerDown={(e) => {
                    e.stopPropagation();
                }}
                onMouseDown={(e) => {
                    e.stopPropagation();
                }}
                disabled={loading}
                className={`flex items-center gap-1.5 px-3 py-1.5  rounded transition-all duration-200 ${
                    liked
                        ? "text-red-500 bg-white"
                        : "text-white/80 bg-white/20 hover:bg-white/30 hover:text-white"
                }`}
                title={liked ? "Unlike" : "Like"}
            >
                <Heart size={18} />
                {likeCount > 0 && (
                    <span className="text-sm font-medium">{likeCount}</span>
                )}
            </button>

            {/* Email Dialog */}
            <AlertDialog
                open={emailDialogOpen}
                onOpenChange={setEmailDialogOpen}
            >
                <AlertDialogContent
                    className="max-w-md"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onPointerDown={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>Like this photo?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Enter your email to like photos. We won't store your
                            email or send you spam.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4">
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setEmailError("");
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            onPointerDown={(e) => {
                                e.stopPropagation();
                            }}
                            onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === "Enter") {
                                    handleEmailSubmit();
                                }
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                emailError
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                        />
                        {emailError && (
                            <p className="text-red-500 text-sm mt-2">
                                {emailError}
                            </p>
                        )}
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleEmailSubmit();
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
