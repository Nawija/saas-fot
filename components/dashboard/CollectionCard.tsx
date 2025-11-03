import Link from "next/link";
import {
    Globe,
    Lock,
    Image as ImageIcon,
    ExternalLink,
    Settings,
    Trash2,
} from "lucide-react";
import MainButton from "@/components/buttons/MainButton";
import ResponsiveHeroImage from "@/components/gallery/hero/ResponsiveHeroImage";
import type { Collection } from "@/types/collection";

interface CollectionCardProps {
    collection: Collection;
    username?: string;
    onDelete: (id: number, name: string) => void;
}

export default function CollectionCard({
    collection,
    username,
    onDelete,
}: CollectionCardProps) {
    const publicUrl = username
        ? `https://${username}.seovileo.pl/g/${collection.slug}`
        : `/g/${collection.slug}`;

    return (
        <div className="group bg-white overflow-hidden transition-all duration-500">
            {/* Hero Image */}
            <Link href={`/dashboard/collections/${collection.id}`}>
                <div className="relative aspect-video bg-gray-100 overflow-hidden mb-5">
                    {collection.hero_image ? (
                        <>
                            <ResponsiveHeroImage
                                desktop={collection.hero_image}
                                mobile={collection.hero_image_mobile}
                                alt={collection.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                priority
                            />
                            {/* Subtle Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-gray-200" />
                        </div>
                    )}
                </div>
            </Link>

            {/* Content */}
            <div className="space-y-3">
                <Link href={`/dashboard/collections/${collection.id}`}>
                    <h3 className="text-xl font-light text-gray-900 line-clamp-1 group-hover:text-gray-600 transition-colors">
                        {collection.name}
                    </h3>
                </Link>

                {/* Stats & Status */}
                <div className="flex items-center text-xs text-gray-400 font-medium pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 mr-4">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>{collection.photo_count || 0} photos</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {collection.is_public ? (
                            <>
                                <Globe className="w-3.5 h-3.5" />
                                <span>Public</span>
                            </>
                        ) : (
                            <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>Protected</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                    <MainButton
                        href={publicUrl}
                        target="_blank"
                        icon={<ExternalLink className="w-4 h-4" />}
                        label="View"
                        variant="secondary"
                        className="text-sm flex-1"
                    />

                    <MainButton
                        variant="secondary"
                        href={`/dashboard/collections/${collection.id}`}
                        icon={<Settings className="w-4 h-4" />}
                    />

                    <MainButton
                        variant="danger"
                        onClick={() => onDelete(collection.id, collection.name)}
                        icon={<Trash2 className="w-4 h-4" />}
                    />
                </div>
            </div>
        </div>
    );
}
