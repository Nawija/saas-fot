import { Plus } from "lucide-react";
import MainButton from "@/components/buttons/MainButton";

interface PageHeaderProps {
    title: string;
    description: string;
    actionLabel: string;
    actionHref: string;
}

export default function PageHeader({
    title,
    description,
    actionLabel,
    actionHref,
}: PageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16">
            <div className="mb-6 md:mb-0">
                <h1 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight mb-3">
                    {title}
                </h1>
                <p className="text-base text-gray-500 font-light leading-relaxed max-w-2xl">
                    {description}
                </p>
            </div>

            <MainButton
                href={actionHref}
                label={actionLabel}
                icon={<Plus className="w-5 h-5" />}
                className="w-full md:w-auto"
            />
        </div>
    );
}
