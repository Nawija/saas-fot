// components/dashboard/HeroTemplateSelector.tsx
"use client";

import { Check } from "lucide-react";

interface HeroTemplateSelectorProps {
    templates: Array<{ key: string; label: string }>;
    selectedTemplate: string;
    savedTemplate: string;
    saving: boolean;
    onSelectTemplate: (key: string) => void;
    onSave: () => void;
    onReset: () => void;
}

export default function HeroTemplateSelector({
    templates,
    selectedTemplate,
    savedTemplate,
    saving,
    onSelectTemplate,
    onSave,
    onReset,
}: HeroTemplateSelectorProps) {
    return (
        <div>
            <div className="flex items-center justify-start overflow-x-auto gap-4 mb-6">
                {templates.map((tpl) => {
                    const isSaved = savedTemplate === tpl.key;
                    const isPreview = selectedTemplate === tpl.key;
                    return (
                        <button
                            key={tpl.key}
                            onClick={() => onSelectTemplate(tpl.key)}
                            className={`group relative w-max text-left overflow-hidden rounded-xl border transition-all ${
                                isPreview
                                    ? "border-blue-500"
                                    : isSaved
                                    ? "border-green-500"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <div className="p-3 flex items-center justify-between">
                                <div className="text-sm font-medium text-gray-900">
                                    {tpl.label}
                                </div>

                                <div className="flex items-center gap-2">
                                    {isSaved && (
                                        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                                            <Check className="w-4 h-4" />{" "}
                                            Zapisany
                                        </span>
                                    )}
                                    {isPreview && !isSaved && (
                                        <span className="inline-flex items-center gap-1 text-blue-600 text-xs font-medium">
                                            <Check className="w-4 h-4" />{" "}
                                            Podgląd
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center justify-end gap-2">
                <button
                    disabled={saving || selectedTemplate === savedTemplate}
                    onClick={onSave}
                    className={`px-4 py-2 text-sm rounded-md text-white ${
                        saving || selectedTemplate === savedTemplate
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {saving ? "Zapisywanie..." : "Zapisz wybrany wygląd"}
                </button>
                <button
                    disabled={saving}
                    onClick={onReset}
                    className="px-4 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50"
                >
                    Reset podglądu
                </button>
            </div>
        </div>
    );
}
