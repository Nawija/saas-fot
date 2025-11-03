interface StatItemProps {
    label: string;
    value: string | number;
    isLast?: boolean;
}

function StatItem({ label, value, isLast }: StatItemProps) {
    return (
        <div
            className={`flex items-center justify-between py-3 ${
                !isLast ? "border-b border-gray-100" : ""
            }`}
        >
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm font-medium text-gray-900">{value}</span>
        </div>
    );
}

interface CollectionStatsCardProps {
    photosCount: number;
    totalSize: string;
    createdAt: string;
}

export default function CollectionStatsCard({
    photosCount,
    totalSize,
    createdAt,
}: CollectionStatsCardProps) {
    return (
        <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="text-lg font-light text-gray-900">Statistics</h2>
            </div>
            <div className="p-6">
                <StatItem label="Photos" value={photosCount} />
                <StatItem label="Storage" value={totalSize} />
                <StatItem label="Created" value={createdAt} isLast />
            </div>
        </div>
    );
}
