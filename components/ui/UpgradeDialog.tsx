"use client";

import { useRouter } from "next/navigation";
import { Crown, Sparkles } from "lucide-react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import MainButton from "@/components/buttons/MainButton";

interface UpgradeDialogProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    feature?: string;
}

export default function UpgradeDialog({
    open,
    onClose,
    title = "Feature available on higher plans",
    description = "This feature is available for Basic, Pro and Unlimited plans.",
    feature,
}: UpgradeDialogProps) {
    const router = useRouter();

    const handleUpgrade = () => {
        onClose();
        router.push("/dashboard/billing#plans");
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-linear-to-tl from-blue-600 to-blue-100 flex items-center justify-center mb-4 border border-blue-400">
                        <Crown className="w-6 h-6 text-white" />
                    </div>
                    <AlertDialogTitle className="text-center text-xl">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center text-base">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {feature && (
                    <div className="bg-linear-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">
                                    {feature}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Available starting from{" "}
                                    <strong className="text-black">
                                        Basic
                                    </strong>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                        What you get with Basic:
                    </h4>
                    <ul className="space-y-1.5 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            10 GB storage (5x more)
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Up to 20 galleries
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Password protection
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            No watermarks
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Premium templates
                        </li>
                    </ul>
                </div>

                <AlertDialogFooter className="flex-col sm:flex-row gap-1">
                    <MainButton
                        onClick={onClose}
                        label="Maybe later"
                        variant="secondary"
                        className="w-full text-sm sm:w-auto"
                    />
                    <MainButton
                        href="/dashboard/billing#plans"
                        label="See plans"
                        variant="primary"
                        className="w-full text-sm sm:w-auto"
                    />
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
