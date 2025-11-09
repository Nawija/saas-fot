import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
} from "@/components/ui/pagination";
import { ArrowLeft, ArrowRight } from "lucide-react";

type PaginatorProps = {
    page: number;
    total: number; // total items
    pageSize: number;
    onPageChange?: (p: number) => void;
    maxPagesToShow?: number; // including first/last
};

export default function Paginator({
    page,
    total,
    pageSize,
    onPageChange,
    maxPagesToShow = 7,
}: PaginatorProps) {
    const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));

    if (!onPageChange || totalPages <= 1) return null;

    const makePages = () => {
        // if small, show all
        if (totalPages <= maxPagesToShow) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | "...")[] = [];
        const sidePages = Math.floor((maxPagesToShow - 3) / 2); // reserve for first,last and possible ellipses

        const left = Math.max(2, page - sidePages);
        const right = Math.min(totalPages - 1, page + sidePages);

        pages.push(1);

        if (left > 2) pages.push("...");

        for (let i = left; i <= right; i++) pages.push(i);

        if (right < totalPages - 1) pages.push("...");

        pages.push(totalPages);

        return pages;
    };

    const pages = makePages();

    return (
        <div className="mt-3 pt-5 border-t border-gray-200 flex justify-center">
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationLink
                            onClick={() => onPageChange(Math.max(1, page - 1))}
                            className={
                                page <= 1
                                    ? "opacity-50 pointer-events-none"
                                    : undefined
                            }
                            aria-disabled={page <= 1}
                        >
                            <ArrowLeft size={20} />
                        </PaginationLink>
                    </PaginationItem>

                    {pages.map((p, i) => {
                        if (p === "...") {
                            return (
                                <PaginationItem key={`e-${i}`}>
                                    <span className="flex items-center px-3 text-sm text-gray-500">
                                        …
                                    </span>
                                </PaginationItem>
                            );
                        }

                        return (
                            <PaginationItem key={p}>
                                <PaginationLink
                                    isActive={p === page}
                                    onClick={() => onPageChange(p as number)}
                                >
                                    {p}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    })}

                    <PaginationItem>
                        <PaginationLink
                            onClick={() =>
                                onPageChange(Math.min(totalPages, page + 1))
                            }
                            className={
                                page >= totalPages
                                    ? "opacity-50 pointer-events-none"
                                    : undefined
                            }
                            aria-disabled={page >= totalPages}
                        >
                            <ArrowRight size={20} />
                        </PaginationLink>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
