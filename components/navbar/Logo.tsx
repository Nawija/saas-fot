import Image from "next/image";
import Link from "next/link";

export default function Logo({ href }: { href: string }) {
    return (
        <Link
            href={href}
            className="text-base font-semibold flex items-center gap-2 text-gray-700"
        >
            <Image
                src="/logo.svg"
                alt="Logo"
                className="h-7 w-auto"
                height={20}
                width={20}
            />
            <p>Seovileo</p>
        </Link>
    );
}
