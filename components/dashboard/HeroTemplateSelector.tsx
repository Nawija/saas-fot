// components/dashboard/HeroTemplateSelector.tsx
"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import {
    HeroTemplateDefinition,
    HeroTemplateProps,
} from "./hero-templates/types";
import MainButton from "../buttons/MainButton";

interface HeroTemplateSelectorProps {
    templates: HeroTemplateDefinition[];
    selectedTemplate: string;
    savedTemplate: string;
    saving: boolean;
    onSelectTemplate: (key: string) => void;
    onSave: () => void;
    onReset: () => void;
    previewData?: Pick<HeroTemplateProps, "title" | "description" | "image">;
    // Typography controls
    selectedFont?: string; // key of the selected font
    onSelectFont?: (fontKey: string) => void;
    savedFont?: string; // the persisted font for comparison
}

export default function HeroTemplateSelector({
    templates,
    selectedTemplate,
    savedTemplate,
    saving,
    onSelectTemplate,
    onSave,
    onReset,
    previewData,
    selectedFont,
    onSelectFont,
    savedFont,
}: HeroTemplateSelectorProps) {
    // Local registry of available fonts for the editor (Google Fonts)
    const FONT_OPTIONS: Array<{
        key: string;
        label: string;
        cssFamily: string; // CSS font-family to apply
        googleHref: string; // <link> href for Google Fonts
    }> = [
        {
            key: "inter",
            label: "Inter",
            cssFamily:
                "'Inter', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif",
            googleHref:
                "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap",
        },
        {
            key: "playfair",
            label: "Playfair Display",
            cssFamily:
                "'Playfair Display', Georgia, Cambria, 'Times New Roman', Times, serif",
            googleHref:
                "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap",
        },
        {
            key: "poppins",
            label: "Poppins",
            cssFamily:
                "'Poppins', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif",
            googleHref:
                "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap",
        },
    ];

    // Ensure the selected font is loaded in the parent document for mini-previews
    useEffect(() => {
        if (!selectedFont) return;
        const font = FONT_OPTIONS.find((f) => f.key === selectedFont);
        if (!font) return;
        const id = "hero-font-link";
        let link = document.getElementById(id) as HTMLLinkElement | null;
        if (!link) {
            link = document.createElement("link");
            link.id = id;
            link.rel = "stylesheet";
            document.head.appendChild(link);
        }
        link.href = font.googleHref;
        return () => {
            // do not remove on unmount to avoid flicker if re-opened; keep cached
        };
    }, [selectedFont]);

    function MiniPreview({
        DesktopComp,
        title,
        description,
        image,
    }: {
        DesktopComp: React.ComponentType<HeroTemplateProps>;
        title: string;
        description?: string;
        image?: string;
    }) {
        const wrapperRef = useRef<HTMLDivElement | null>(null);
        const [scale, setScale] = useState(0.2);
        const baseW = 1280;
        const baseH = 720;

        useLayoutEffect(() => {
            const el = wrapperRef.current;
            if (!el) return;

            const compute = () => {
                const w = el.clientWidth;
                if (w > 0) {
                    const s = Math.max(0.12, Math.min(0.35, w / baseW));
                    setScale(s);
                }
            };
            compute();

            const ro = new ResizeObserver(compute);
            ro.observe(el);
            return () => ro.disconnect();
        }, []);

        const height = Math.round(baseH * scale);

        return (
            <div
                ref={wrapperRef}
                className="relative w-full rounded-lg overflow-hidden bg-black/90 border border-gray-200/60 shadow-sm"
                style={{ height }}
            >
                <div
                    className="origin-top-left"
                    style={{
                        width: baseW,
                        height: baseH,
                        transform: `scale(${scale})`,
                        fontFamily:
                            FONT_OPTIONS.find((f) => f.key === selectedFont)
                                ?.cssFamily || undefined,
                    }}
                >
                    <div className="relative w-full h-full">
                        <DesktopComp
                            title={title}
                            description={description}
                            image={image}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full">
            {/* Typography selector */}
            <div className="mb-8">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                    Hero font
                </label>
                <div className="flex flex-wrap gap-2">
                    {FONT_OPTIONS.map((f) => {
                        const isActive = selectedFont === f.key;
                        return (
                            <button
                                key={f.key}
                                type="button"
                                onClick={() => onSelectFont?.(f.key)}
                                className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                                    isActive
                                        ? "border-blue-500 bg-blue-50 text-blue-700"
                                        : "border-gray-200 hover:bg-gray-50"
                                }`}
                                style={{ fontFamily: f.cssFamily }}
                            >
                                {f.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {templates.map((tpl, index) => {
                    const isSaved = savedTemplate === tpl.key;
                    const isPreview = selectedTemplate === tpl.key;
                    const DesktopComp = tpl.Desktop;
                    return (
                        <motion.button
                            key={tpl.key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.3,
                                delay: index * 0.1,
                                ease: "easeOut",
                            }}
                            onClick={() => onSelectTemplate(tpl.key)}
                            className={`group relative text-left overflow-hidden rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                isPreview
                                    ? "border-blue-500 shadow-md"
                                    : isSaved
                                    ? "border-green-500"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                            aria-pressed={isPreview}
                        >
                            {/* Faithful desktop miniature that scales to container width */}
                            <MiniPreview
                                DesktopComp={DesktopComp}
                                title={previewData?.title || tpl.label}
                                description={previewData?.description}
                                image={previewData?.image}
                            />
                            {/* Premium badge - yellow star in top-left corner */}
                            {tpl.premium && (
                                <div className="absolute top-2 left-2 bg-yellow-400 rounded-full p-1.5 shadow-md z-10">
                                    <svg
                                        className="w-4 h-4 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </div>
                            )}
                            <div className="p-2 flex items-center justify-between bg-white">
                                <div className="text-sm font-medium text-gray-900">
                                    {tpl.label}
                                </div>
                                <div className="flex items-center gap-2">
                                    {isSaved && (
                                        <span className="absolute top-1 right-1 px-2 py-1 bg-green-100 rounded-3xl flex items-center gap-1 text-green-600 text-[10px] font-medium">
                                            <Check size={11} /> Saved
                                        </span>
                                    )}
                                    {isPreview && !isSaved && (
                                        <span className="absolute top-1 right-1 px-2 py-1 bg-blue-100 rounded-3xl flex items-center gap-1 text-blue-600 text-[10px] font-medium">
                                            <Check size={11} /> Preview
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            <div className="flex flex-col gap-3">
                {/* Premium info if premium template is selected */}
                {templates.find((t) => t.key === selectedTemplate)?.premium && (
                    <div className="flex items-start gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <svg
                            className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <div className="text-xs text-yellow-800">
                            <span className="font-semibold">
                                Premium template
                            </span>
                            <p className="mt-0.5">
                                Available for users with an active subscription
                                (Basic, Pro, Unlimited)
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-end gap-2">
                    <button
                        disabled={
                            saving ||
                            (selectedTemplate === savedTemplate &&
                                (selectedFont || "") === (savedFont || ""))
                        }
                        onClick={onSave}
                        className={`px-4 py-2 text-sm rounded-md text-white transition-all duration-200 ${
                            saving ||
                            (selectedTemplate === savedTemplate &&
                                (selectedFont || "") === (savedFont || ""))
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                        }`}
                    >
                        {saving ? "Saving..." : "Save design"}
                    </button>
                    <button
                        disabled={saving}
                        onClick={() => {
                            // Reset local font preview immediately
                            if (onSelectFont) {
                                onSelectFont(savedFont || "inter");
                            }
                            onReset();
                        }}
                        className="px-4 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50 transition-all duration-200"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
}
