// components/dashboard/HeroSheetPanel.tsx
"use client";

import { useState } from "react";
import { ImagePlus, Globe, Lock } from "lucide-react";
import MainButton from "@/components/buttons/MainButton";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

type PanelType = "image" | "template" | "settings" | null;

interface HeroSheetPanelProps {
    activePanel: PanelType;
    onClose: () => void;
    children: React.ReactNode;
}

export default function HeroSheetPanel({
    activePanel,
    onClose,
    children,
}: HeroSheetPanelProps) {
    const titles = {
        image: "Edit Hero Image",
        template: "Choose Template",
        settings: "Collection Settings",
    };

    const descriptions = {
        image: "Upload a new hero image for your gallery",
        template: "Select a template and customize your gallery appearance",
        settings: "Manage visibility and access settings",
    };

    return (
        <Sheet open={!!activePanel} onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-[540px] md:max-w-[600px] lg:max-w-[700px] p-0 overflow-hidden"
            >
                <SheetHeader className="px-6 md:px-8 py-6 border-b border-gray-100">
                    <SheetTitle className="text-xl md:text-2xl font-light text-gray-900">
                        {activePanel && titles[activePanel]}
                    </SheetTitle>
                    <SheetDescription className="text-sm text-gray-500 font-light">
                        {activePanel && descriptions[activePanel]}
                    </SheetDescription>
                </SheetHeader>
                <div className="h-[calc(100vh-130px)] overflow-y-auto">
                    {children}
                </div>
            </SheetContent>
        </Sheet>
    );
}

// Sub-components for different panel types
export function ImageEditPanel({
    currentImage,
    onSave,
    saving,
}: {
    currentImage?: string;
    onSave: (file: File, position: { x: number; y: number }) => void;
    saving: boolean;
}) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setPosition({ x: 50, y: 50 }); // Reset position
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;

        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        setPosition((prev) => ({
            x: Math.max(0, Math.min(100, prev.x + deltaX / 5)),
            y: Math.max(0, Math.min(100, prev.y + deltaY / 5)),
        }));

        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - dragStart.x;
        const deltaY = touch.clientY - dragStart.y;

        setPosition((prev) => ({
            x: Math.max(0, Math.min(100, prev.x + deltaX / 5)),
            y: Math.max(0, Math.min(100, prev.y + deltaY / 5)),
        }));

        setDragStart({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const handleSave = () => {
        if (selectedFile) {
            console.log("[ImageEditPanel] Saving with position:", position);
            onSave(selectedFile, position);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setPosition({ x: 50, y: 50 });
    };

    return (
        <div className="p-6 md:p-8 space-y-6 md:space-y-8">
            {/* Current Image Preview */}
            {currentImage && !previewUrl && (
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                        Current Image
                    </label>
                    <div className="relative w-full aspect-video overflow-hidden border border-gray-200">
                        <img
                            src={currentImage}
                            alt="Current hero"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            )}

            {/* New Image Preview with Position Control */}
            {previewUrl && (
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                        Adjust Image Position
                    </label>
                    <div
                        className="relative w-full aspect-video overflow-hidden border border-gray-900 cursor-move select-none"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <img
                            src={previewUrl}
                            alt="New hero preview"
                            className="w-full h-full object-cover transition-none"
                            style={{
                                objectPosition: `${position.x}% ${position.y}%`,
                            }}
                            draggable={false}
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors pointer-events-none" />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                            Drag to adjust position
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleReset}
                            className="text-sm text-gray-600 hover:text-gray-900 font-light underline"
                        >
                            Choose different image
                        </button>
                    </div>
                </div>
            )}

            {/* Upload Section */}
            {!previewUrl && (
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                        Upload New Image
                    </label>
                    <div className="border border-dashed border-gray-200 p-8 md:p-12 text-center hover:border-gray-300 transition-colors">
                        <ImagePlus className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 mb-4 font-light">
                            Click to select an image
                        </p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={saving}
                            className="hidden"
                            id="hero-image-upload"
                        />
                        <MainButton
                            label="Choose File"
                            variant="secondary"
                            disabled={saving}
                            onClick={() =>
                                document
                                    .getElementById("hero-image-upload")
                                    ?.click()
                            }
                            className="cursor-pointer"
                        />
                    </div>
                </div>
            )}

            {/* Save Button - Only show when image is selected */}
            {previewUrl && (
                <div className="pt-4 border-t border-gray-100">
                    <MainButton
                        label={saving ? "Uploading..." : "Upload & Save"}
                        variant="primary"
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full"
                    />
                </div>
            )}

            {/* Guidelines */}
            <div className="bg-gray-50 p-4 md:p-6 space-y-2">
                <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Image Guidelines
                </p>
                <ul className="text-sm text-gray-600 space-y-1 font-light">
                    <li>• Recommended: 1920x1080px or higher</li>
                    <li>• Max file size: 10MB</li>
                    <li>• Formats: JPG, PNG, WebP</li>
                    <li>• After upload, drag to adjust focal point</li>
                </ul>
            </div>
        </div>
    );
}

export function TemplatePanel({
    templates,
    selectedTemplate,
    savedTemplate,
    selectedFont,
    collectionName,
    collectionDescription,
    heroImage,
    onSelectTemplate,
    onSelectFont,
    onSave,
    onReset,
    saving,
}: {
    templates: Array<{
        key: string;
        label: string;
        description?: string;
        Desktop: React.ComponentType<any>;
        isPremium?: boolean;
    }>;
    selectedTemplate: string;
    savedTemplate: string;
    selectedFont: string;
    collectionName: string;
    collectionDescription: string;
    heroImage: string;
    onSelectTemplate: (key: string) => void;
    onSelectFont: (font: string) => void;
    onSave: () => void;
    onReset: () => void;
    saving: boolean;
}) {
    const getFontFamily = (font: string) => {
        if (font === "playfair") return "'Playfair Display', serif";
        if (font === "poppins") return "'Poppins', sans-serif";
        return "'Inter', sans-serif";
    };

    const selectedTemplateObj = templates.find(
        (t) => t.key === selectedTemplate
    );

    return (
        <div className="p-6 md:p-8 space-y-6 md:space-y-8">
            {/* Preview */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                    Live Preview
                </label>
                <div className="relative bg-gray-900 overflow-hidden border border-gray-200">
                    <div className="w-full aspect-video overflow-hidden">
                        {selectedTemplateObj && (
                            <div
                                className="origin-top-left"
                                style={{
                                    transform: "scale(0.5)",
                                    width: "200%",
                                    height: "200%",
                                    fontFamily: getFontFamily(selectedFont),
                                }}
                            >
                                <selectedTemplateObj.Desktop
                                    title={collectionName}
                                    description={collectionDescription}
                                    image={heroImage}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Font Selection */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                    Font Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {["inter", "playfair", "poppins"].map((font) => (
                        <button
                            key={font}
                            onClick={() => onSelectFont(font)}
                            className={`px-3 md:px-4 py-2 md:py-3 rounded border transition-all duration-200 ${
                                selectedFont === font
                                    ? "border-gray-900 bg-gray-50"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <span
                                className="text-xs md:text-sm font-medium text-gray-900 capitalize"
                                style={{ fontFamily: getFontFamily(font) }}
                            >
                                {font}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Template Grid */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                    Choose Template
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {templates.map((template) => (
                        <button
                            key={template.key}
                            onClick={() => onSelectTemplate(template.key)}
                            className={`relative group border-2 p-0.5 overflow-hidden transition-all duration-200 ${
                                selectedTemplate === template.key
                                    ? "border-yellow-400"
                                    : "border-gray-100 hover:border-gray-200"
                            }`}
                        >
                            <div className="aspect-video bg-gray-900 overflow-hidden">
                                <div
                                    className="origin-top-left"
                                    style={{
                                        transform: "scale(0.18)",
                                        width: "600%",
                                        height: "600%",
                                    }}
                                >
                                    <template.Desktop
                                        title={collectionName}
                                        description={collectionDescription}
                                        image={heroImage}
                                    />
                                </div>
                            </div>
                            <div className="p-3 bg-white">
                                <p className="text-sm font-medium text-gray-900">
                                    {template.label}
                                    {template.isPremium && (
                                        <span className="ml-2 text-xs text-gray-500">
                                            PRO
                                        </span>
                                    )}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <MainButton
                    label="Reset"
                    variant="ghost"
                    onClick={onReset}
                    disabled={saving || selectedTemplate === savedTemplate}
                    className="flex-1"
                />
                <MainButton
                    label={saving ? "Saving..." : "Save Changes"}
                    variant="primary"
                    onClick={onSave}
                    disabled={saving || selectedTemplate === savedTemplate}
                    className="flex-1"
                />
            </div>
        </div>
    );
}

export function SettingsPanel({
    isPublic,
    passwordPlain,
    userPlan,
    onSave,
    saving,
    onUpgradeRequired,
}: {
    isPublic: boolean;
    passwordPlain?: string;
    userPlan?: string;
    onSave: (isPublic: boolean, password?: string) => void;
    saving: boolean;
    onUpgradeRequired?: () => void;
}) {
    const [localIsPublic, setLocalIsPublic] = useState(isPublic);
    const [localPassword, setLocalPassword] = useState(passwordPlain || "");
    const isPaidPlan = userPlan !== "free" && userPlan !== undefined;

    const handlePasswordToggle = () => {
        if (!isPaidPlan && !localIsPublic) {
            onUpgradeRequired?.();
            return;
        }
        setLocalIsPublic(!localIsPublic);
    };

    return (
        <div className="p-6 md:p-8 space-y-6 md:space-y-8">
            {/* Visibility Toggle */}
            <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">
                    Gallery Visibility
                </label>
                <div className="space-y-3">
                    <button
                        onClick={() => setLocalIsPublic(true)}
                        className={`w-full flex items-center gap-3 md:gap-4 p-4 border transition-all duration-200 ${
                            localIsPublic
                                ? "border-gray-900 bg-gray-50"
                                : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                        <Globe className="w-5 h-5 text-gray-700 shrink-0" />
                        <div className="text-left flex-1">
                            <p className="text-sm font-medium text-gray-900">
                                Public
                            </p>
                            <p className="text-xs text-gray-500 font-light">
                                Anyone with the link can view
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={handlePasswordToggle}
                        className={`w-full flex items-center gap-3 md:gap-4 p-4 border transition-all duration-200 ${
                            !localIsPublic
                                ? "border-gray-900 bg-gray-50"
                                : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                        <Lock className="w-5 h-5 text-gray-700 shrink-0" />
                        <div className="text-left flex-1">
                            <p className="text-sm font-medium text-gray-900">
                                Password Protected
                                {!isPaidPlan && (
                                    <span className="ml-2 text-xs text-gray-500">
                                        PRO
                                    </span>
                                )}
                            </p>
                            <p className="text-xs text-gray-500 font-light">
                                Requires password to access
                            </p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Password Input */}
            {!localIsPublic && (
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                        Set Password
                    </label>
                    <input
                        type="text"
                        value={localPassword}
                        onChange={(e) => setLocalPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-light text-sm md:text-base"
                    />
                    <p className="text-xs text-gray-500 font-light">
                        Share this password with people who should access your
                        gallery
                    </p>
                </div>
            )}

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-100">
                <MainButton
                    label={saving ? "Saving..." : "Save Settings"}
                    variant="primary"
                    onClick={() => onSave(localIsPublic, localPassword)}
                    disabled={saving}
                    className="w-full"
                />
            </div>
        </div>
    );
}
