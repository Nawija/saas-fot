// components/dashboard/HeroPreview.tsx
"use client";

import { getTemplateByKey } from "./hero-templates/registry";

interface HeroPreviewProps {
    selectedTemplate: string;
    previewTab: "landing" | "photos";
    collectionName: string;
    collectionDescription?: string;
    heroImage?: string;
}

export default function HeroPreview({
    selectedTemplate,
    collectionName,
    collectionDescription,
    heroImage,
}: HeroPreviewProps) {
    const template = getTemplateByKey(selectedTemplate);
    const DesktopComponent = template.Desktop;
    const MobileComponent = template.Mobile;

    return (
        <div className="mt-6">
            {/* Desktop preview */}
            <div className="relative w-1/2 mx-auto mb-8">
                <div className="p-1.5 rounded-lg border border-gray-200 w-full h-auto shadow-xl bg-black">
                    <div className="aspect-video p-3 relative">
                        <DesktopComponent
                            title={collectionName}
                            description={collectionDescription}
                            image={heroImage}
                        />
                    </div>
                </div>

                {/* Mobile preview (positioned absolutely) */}
                <div className="absolute z-10 -bottom-4 -right-24 w-[150px] h-[330px] rounded-4xl border-8 border-black overflow-hidden shadow-xl bg-black">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-1.5 rounded-full bg-black/60 z-20" />
                    <div className="absolute inset-0">
                        <MobileComponent
                            title={collectionName}
                            description={collectionDescription}
                            image={heroImage}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
