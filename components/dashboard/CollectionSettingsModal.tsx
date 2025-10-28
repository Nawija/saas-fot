"use client";

import { useState } from "react";
import { Lock, Globe } from "lucide-react";
import MainButton from "@/components/buttons/MainButton";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CollectionSettingsModalProps {
    open: boolean;
    onClose: () => void;
    isPublic: boolean;
    passwordPlain?: string;
    onSave: (isPublic: boolean, password?: string) => Promise<void>;
    saving: boolean;
    userPlan?: string; // plan użytkownika do sprawdzania limitów
    onUpgradeRequired?: () => void; // callback gdy użytkownik próbuje użyć premium feature
}

export default function CollectionSettingsModal({
    open,
    onClose,
    isPublic: initialIsPublic,
    passwordPlain: initialPassword,
    onSave,
    saving,
    userPlan = "free",
    onUpgradeRequired,
}: CollectionSettingsModalProps) {
    const [isPublic, setIsPublic] = useState(initialIsPublic);
    const [password, setPassword] = useState(initialPassword || "");

    const isFree = userPlan === "free";

    const handleSave = async () => {
        await onSave(isPublic, isPublic ? undefined : password);
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>Access settings</AlertDialogTitle>
                    <AlertDialogDescription>
                        Choose who can view this collection
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-4">
                    {/* Public Option */}
                    <button
                        onClick={() => setIsPublic(true)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            isPublic
                                ? "border-emerald-500 bg-emerald-50"
                                : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    isPublic ? "bg-emerald-500" : "bg-gray-100"
                                }`}
                            >
                                <Globe
                                    size={20}
                                    className={
                                        isPublic
                                            ? "text-white"
                                            : "text-gray-600"
                                    }
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    Public
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Anyone with the link can view this gallery
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Protected Option */}
                    <button
                        onClick={() => {
                            if (isFree && onUpgradeRequired) {
                                onUpgradeRequired();
                                return;
                            }
                            if (!isFree) {
                                setIsPublic(false);
                            }
                        }}
                        disabled={isFree && !onUpgradeRequired}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            !isPublic
                                ? "border-amber-500 bg-amber-50"
                                : isFree && !onUpgradeRequired
                                ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                                : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    !isPublic ? "bg-amber-500" : "bg-gray-100"
                                }`}
                            >
                                <Lock
                                    size={20}
                                    className={
                                        !isPublic
                                            ? "text-white"
                                            : "text-gray-600"
                                    }
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        Password-protected
                                    </h3>
                                    {isFree && (
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                            Basic+
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">
                                    {isFree
                                        ? "Available starting from Basic"
                                        : "A password is required to view this gallery"}
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Password Input */}
                    {!isPublic && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-sm font-medium text-gray-700">
                                Access password
                            </label>
                            <input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter a password..."
                                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none transition-colors"
                            />
                            <p className="text-xs text-gray-500">
                                This password will be required to open the
                                gallery
                            </p>
                        </div>
                    )}
                </div>

                <AlertDialogFooter>
                    <MainButton
                        onClick={onClose}
                        label="Cancel"
                        variant="secondary"
                        disabled={saving}
                    />
                    <MainButton
                        onClick={handleSave}
                        label="Save changes"
                        variant="primary"
                        loading={saving}
                        disabled={!isPublic && !password}
                    />
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
