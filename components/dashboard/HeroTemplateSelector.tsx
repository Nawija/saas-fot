// components/dashboard/HeroTemplateSelector.tsx
"use client";

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
    return (
        <div className="lg:flex items-start justify-between flex-col h-full w-full">
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
                            <div className="relative w-full bg-black transition-transform duration-300 group-hover:brightness-110">
                                <div className="aspect-video w-full overflow-hidden">
                                    <div className="relative w-full h-full">
                                        <DesktopComp
                                            title={
                                                previewData?.title || tpl.label
                                            }
                                            image={previewData?.image}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 flex items-center justify-between bg-white">
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
