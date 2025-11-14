// components/dashboard/collections/HeroTemplateCard.tsx
import { SquarePen } from "lucide-react";

interface HeroTemplateCardProps {
    heroImage: string;
    collectionName: string;
    templateLabel: string;
    title?: string;
    description?: string;
    onEditImage: () => void;
}

export default function HeroTemplateCard({
    heroImage,
    collectionName,
    templateLabel,
    title,
    description,
    onEditImage,
}: HeroTemplateCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="text-base font-semibold text-gray-900">
                    Gallery page template
                </h2>
            </div>

            <div className="p-5">
                <div className="space-y-4">
                    {/* Template Preview */}
                    <div className="relative group">
                        <img
                            src={heroImage}
                            alt={collectionName}
                            className="w-full h-auto z-0"
                        />
                        <div
                            onClick={onEditImage}
                            className="flex items-center cursor-pointer font-semibold text-sm opacity-0 hover:opacity-100 transition-opacity justify-center h-full w-full bg-black/30 gap-1 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                        >
                            <SquarePen size={20} /> Edit
                        </div>
                        {/* Title & description */}
                        {(title || description) && (
                            <div className="px-2 absolute bottom-2 left-2 bg-white/90 rounded p-2 max-w-[90%] z-10">
                                {title && (
                                    <h3 className="text-sm line-clamp-1 font-semibold text-gray-900">
                                        {title}
                                    </h3>
                                )}
                                {description && (
                                    <p className="text-xs line-clamp-1 text-gray-600 mt-1">
                                        {description}
                                    </p>
                                )}
                            </div>
                        )}
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
