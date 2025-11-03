// components/dashboard/HeroSidePanel.tsx
"use client";

import { useState } from "react";
import {
    X,
    ImagePlus,
    Paintbrush,
    Eye,
    Download,
    Settings,
    Globe,
    Lock,
} from "lucide-react";
import MainButton from "@/components/buttons/MainButton";

type PanelType =
    | "image"
    | "template"
    | "gallery"
    | "download"
    | "settings"
    | null;

interface HeroSidePanelProps {
    activePanel: PanelType;
    onClose: () => void;
    children: React.ReactNode;
}

export default function HeroSidePanel({
    activePanel,
    onClose,
    children,
}: HeroSidePanelProps) {
    if (!activePanel) return null;

    const titles = {
        image: "Edit Hero Image",
        template: "Choose Template",
        gallery: "Gallery Preview",
        download: "Download Collection",
        settings: "Collection Settings",
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Side Panel */}
            <div className="fixed right-0 top-0 h-full w-full md:w-[600px] lg:w-[700px] bg-white shadow-2xl z-50 transform transition-transform duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                    <h2 className="text-2xl font-light text-gray-900">
                        {titles[activePanel]}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="h-[calc(100%-88px)] overflow-y-auto">
                    {children}
                </div>
            </div>
        </>
    );
}

// Sub-components for different panel types
export function ImageEditPanel({
    currentImage,
    onSave,
    saving,
}: {
    currentImage?: string;
    onSave: (file: File) => void;
    saving: boolean;
}) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onSave(file);
    };

    return (
        <div className="p-8 space-y-8">
            {/* Current Image Preview */}
            {currentImage && (
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                        Current Image
                    </label>
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200">
                        <img
                            src={currentImage}
                            alt="Current hero"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            )}

            {/* Upload Section */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                    Upload New Image
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center hover:border-gray-300 transition-colors">
                    <ImagePlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-4 font-light">
                        Drag and drop or click to upload
                    </p>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={saving}
                        className="hidden"
                        id="hero-image-upload"
                    />
                    <label htmlFor="hero-image-upload">
                        <MainButton
                            label={saving ? "Uploading..." : "Choose File"}
                            variant="secondary"
                            disabled={saving}
                            onClick={() => {}}
                            className="cursor-pointer"
                        />
                    </label>
                </div>
            </div>

            {/* Guidelines */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-2">
                <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Image Guidelines
                </p>
                <ul className="text-sm text-gray-600 space-y-1 font-light">
                    <li>• Recommended: 1920x1080px or higher</li>
                    <li>• Max file size: 10MB</li>
                    <li>• Formats: JPG, PNG, WebP</li>
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
        <div className="p-8 space-y-8">
            {/* Preview */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                    Live Preview
                </label>
                <div className="relative bg-gray-900 rounded-xl overflow-hidden border border-gray-200">
                    <div className="w-full aspect-video overflow-hidden">
                        {selectedTemplateObj && (
                            <div
                                className="origin-top-left"
                                style={{
                                    transform: "scale(0.3)",
                                    width: "333.33%",
                                    height: "333.33%",
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
                            className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                                selectedFont === font
                                    ? "border-gray-900 bg-gray-50"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <span
                                className="text-sm font-medium text-gray-900 capitalize"
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
                <div className="grid grid-cols-2 gap-4">
                    {templates.map((template) => (
                        <button
                            key={template.key}
                            onClick={() => onSelectTemplate(template.key)}
                            className={`relative group rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                                selectedTemplate === template.key
                                    ? "border-gray-900 shadow-md"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <div className="aspect-video bg-gray-900 overflow-hidden">
                                <div
                                    className="origin-top-left"
                                    style={{
                                        transform: "scale(0.15)",
                                        width: "666.67%",
                                        height: "666.67%",
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
            <div className="flex gap-3 pt-4 border-t border-gray-100">
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
        <div className="p-8 space-y-8">
            {/* Visibility Toggle */}
            <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">
                    Gallery Visibility
                </label>
                <div className="space-y-3">
                    <button
                        onClick={() => setLocalIsPublic(true)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                            localIsPublic
                                ? "border-gray-900 bg-gray-50"
                                : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                        <Globe className="w-5 h-5 text-gray-700" />
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
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                            !localIsPublic
                                ? "border-gray-900 bg-gray-50"
                                : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                        <Lock className="w-5 h-5 text-gray-700" />
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-light"
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
