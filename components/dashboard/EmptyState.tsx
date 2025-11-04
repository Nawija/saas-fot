import { Plus, Image as ImageIcon } from "lucide-react";
import MainButton from "@/components/buttons/MainButton";

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    actionLabel: string;
    actionHref: string;
}

export default function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    actionHref,
}: EmptyStateProps) {
    return (
        <div className="text-center py-32">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-2xl mb-6">
                {icon || <ImageIcon className="w-8 h-8 text-gray-300" />}
            </div>
            <h2 className="text-2xl font-light text-gray-900 mb-3">{title}</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                {description}
            </p>

            <MainButton
                href={actionHref}
                label={actionLabel}
                icon={<Plus className="w-5 h-5" />}
            />
        </div>
    );
}
