import { ImagePlus, Paintbrush, Eye, Download, Settings } from "lucide-react";

interface HeroTemplateCardProps {
    currentTemplate:
        | {
              key: string;
              label: string;
              Desktop: React.ComponentType<any>;
          }
        | undefined;
    collectionName: string;
    collectionDescription: string;
    heroImage: string;
    heroFont?: string;
    heroImagePositionX?: number;
    heroImagePositionY?: number;
    onEditImage: () => void;
    onEditTemplate: () => void;
    onViewGallery: () => void;
    onDownload: () => void;
    onSettings: () => void;
    isPublic: boolean;
    photosCount: number;
}

export default function HeroTemplateCard({
    currentTemplate,
    collectionName,
    collectionDescription,
    heroImage,
    heroFont,
    heroImagePositionX = 50,
    heroImagePositionY = 50,
    onEditImage,
    onEditTemplate,
    onViewGallery,
    onDownload,
    onSettings,
    isPublic,
    photosCount,
}: HeroTemplateCardProps) {
    const getFontFamily = () => {
        if (heroFont === "playfair") {
            return "'Playfair Display', Georgia, Cambria, 'Times New Roman', Times, serif";
        }
        if (heroFont === "poppins") {
            return "'Poppins', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif";
        }
        return "'Inter', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif";
    };

    // Debug logging
    console.log(
        "[HeroTemplateCard] Position X:",
        heroImagePositionX,
        "Position Y:",
        heroImagePositionY
    );

    return (
        <div className="space-y-4">
            {/* Hero Template Preview */}
            {currentTemplate && (
                <div className="relative bg-gray-900 overflow-hidden max-w-[500px] mx-auto border border-gray-200 shadow-sm">
                    <div className="overflow-hidden aspect-video mx-auto text-center w-full">
                        <div
                            className="origin-top-left"
                            style={{
                                transform: "scale(0.25)",
                                aspectRatio: "16 / 9",
                                width: "400%",
                                fontFamily: getFontFamily(),
                            }}
                        >
                            <currentTemplate.Desktop
                                title={collectionName}
                                description={collectionDescription}
                                image={heroImage}
                                imagePositionX={heroImagePositionX}
                                imagePositionY={heroImagePositionY}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Action Icons - Always Visible */}
            <div className="bg-white border border-gray-200 p-4">
                <div className="grid grid-cols-5 gap-2">
                    <button
                        onClick={onEditImage}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                        title="Edit Image"
                    >
                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors duration-200">
                            <ImagePlus className="w-5 h-5 text-gray-700" />
                        </div>
                        <span className="text-xs text-gray-600 font-light">
                            Image
                        </span>
                    </button>

                    <button
                        onClick={onEditTemplate}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                        title="Edit Template"
                    >
                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors duration-200">
                            <Paintbrush className="w-5 h-5 text-gray-700" />
                        </div>
                        <span className="text-xs text-gray-600 font-light">
                            Template
                        </span>
                    </button>

                    <button
                        onClick={onViewGallery}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                        title="View Gallery"
                    >
                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors duration-200">
                            <Eye className="w-5 h-5 text-gray-700" />
                        </div>
                        <span className="text-xs text-gray-600 font-light">
                            View
                        </span>
                    </button>

                    <button
                        onClick={onDownload}
                        disabled={photosCount === 0}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Download All"
                    >
                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors duration-200">
                            <Download className="w-5 h-5 text-gray-700" />
                        </div>
                        <span className="text-xs text-gray-600 font-light">
                            Download
                        </span>
                    </button>

                    <button
                        onClick={onSettings}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                        title="Settings"
                    >
                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors duration-200">
                            <Settings className="w-5 h-5 text-gray-700" />
                        </div>
                        <span className="text-xs text-gray-600 font-light">
                            Settings
                        </span>
                    </button>
                </div>
            </div>

            {/* Template Info Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600 font-light">
                        {currentTemplate?.label || "Minimal"}
                    </span>
                </div>
                <span className="text-xs text-gray-400 uppercase tracking-wider">
                    {isPublic ? "Public" : "Private"}
                </span>
            </div>
        </div>
    );
}
