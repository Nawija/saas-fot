// components/dashboard/collections/HeroTemplateCard.tsx
import { Paintbrush, SquarePen } from "lucide-react";
import MainButton from "@/components/buttons/MainButton";

interface HeroTemplateCardProps {
    heroImage: string;
    collectionName: string;
    templateLabel: string;
    onEditImage: () => void;
    onEditTemplate: () => void;
}

export default function HeroTemplateCard({
    heroImage,
    collectionName,
    templateLabel,
    onEditImage,
    onEditTemplate,
}: HeroTemplateCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="text-base font-semibold text-gray-900">
                    Hero appearance
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    Gallery page template
                </p>
            </div>

            <div className="p-5">
                <div className="space-y-4">
                    {/* Template Preview */}
                    <div className="relative group">
                        <img
                            src={heroImage}
                            alt={collectionName}
                            className="w-full h-auto"
                        />
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 justify-center h-full w-full bg-black/10 gap-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <MainButton
                                onClick={onEditImage}
                                icon={<SquarePen size={20} />}
                                variant="secondary"
                            />
                            <MainButton
                                onClick={onEditTemplate}
                                icon={<Paintbrush size={20} />}
                                variant="secondary"
                            />
                        </div>
                    </div>

                    {/* Template Name */}
                    <div className="bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">
                                Active template
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm font-semibold text-gray-900">
                                    {templateLabel}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
