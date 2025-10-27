// components/dashboard/HeroTemplateSelector.tsx
"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import {
    HeroTemplateDefinition,
    HeroTemplateProps,
} from "./hero-templates/types";

interface HeroTemplateSelectorProps {
    templates: HeroTemplateDefinition[];
    selectedTemplate: string;
    savedTemplate: string;
    saving: boolean;
    onSelectTemplate: (key: string) => void;
    onSave: () => void;
    onReset: () => void;
    previewData?: Pick<HeroTemplateProps, "title" | "description" | "image">;
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
}: HeroTemplateSelectorProps) {
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
                            <div className="p-2 flex items-center justify-between bg-white">
                                <div className="text-sm font-medium text-gray-900">
                                    {tpl.label}
                                </div>
                                <div className="flex items-center gap-2">
                                    {isSaved && (
                                        <span className="absolute top-1 right-1 px-2 py-1 bg-green-100 rounded-3xl flex items-center gap-1 text-green-600 text-[10px] font-medium">
                                            <Check size={11} /> Zapisany
                                        </span>
                                    )}
                                    {isPreview && !isSaved && (
                                        <span className="absolute top-1 right-1 px-2 py-1 bg-blue-100 rounded-3xl flex items-center gap-1 text-blue-600 text-[10px] font-medium">
                                            <Check size={11} /> Podgląd
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            <div className="flex items-center justify-end gap-2">
                <button
                    disabled={saving || selectedTemplate === savedTemplate}
                    onClick={onSave}
                    className={`px-4 py-2 text-sm rounded-md text-white transition-all duration-200 ${
                        saving || selectedTemplate === savedTemplate
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                    }`}
                >
                    {saving ? "Zapisywanie..." : "Zapisz wybrany wygląd"}
                </button>
                <button
                    disabled={saving}
                    onClick={onReset}
                    className="px-4 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50 transition-all duration-200"
                >
                    Reset podglądu
                </button>
            </div>
        </div>
    );
}
