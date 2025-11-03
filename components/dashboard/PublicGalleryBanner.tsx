import Link from "next/link";
import { Globe, ExternalLink } from "lucide-react";
import MainButton from "@/components/buttons/MainButton";

interface PublicGalleryBannerProps {
    username: string;
}

export default function PublicGalleryBanner({
    username,
}: PublicGalleryBannerProps) {
    const galleryUrl = `https://${username}.seovileo.pl`;

    return (
        <div className="mb-16 pb-12 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Left: Label + URL */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Public Gallery
                        </span>
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    </div>
                    <Link
                        href={galleryUrl}
                        target="_blank"
                        className="group inline-flex items-baseline gap-2.5 hover:opacity-80 transition-opacity"
                    >
                        <span className="text-3xl md:text-5xl font-light text-gray-900 tracking-tight">
                            {username}.seovileo.pl
                        </span>
                        <ExternalLink className="w-5 h-5 text-gray-400 mb-1 group-hover:text-gray-600 transition-colors" />
                    </Link>
                </div>

                {/* Right: Action */}
                <MainButton
                    href={galleryUrl}
                    label="Open Gallery"
                    variant="primary"
                    target="_blank"
                    icon={<ExternalLink className="w-4 h-4" />}
                    className="w-full md:w-auto"
                />
            </div>
        </div>
    );
}
