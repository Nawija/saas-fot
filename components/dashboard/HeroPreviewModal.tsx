// components/dashboard/HeroPreviewModal.tsx
"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { HERO_TEMPLATES, getTemplateByKey } from "./hero-templates/registry";
import HeroTemplateSelector from "./HeroTemplateSelector";

interface HeroPreviewModalProps {
    open: boolean;
    onClose: () => void;
    templates?: typeof HERO_TEMPLATES;
    selectedTemplate: string;
    savedTemplate: string;
    saving: boolean;
    onSelectTemplate: (key: string) => void;
    onSave: (settings: { template: string; font: string }) => void;
    onReset: () => void;
    collectionName: string;
    collectionDescription?: string;
    heroImage?: string;
    selectedFont?: string; // current saved font to initialize the picker
}

export default function HeroPreviewModal({
    open,
    onClose,
    templates = HERO_TEMPLATES,
    selectedTemplate,
    savedTemplate,
    saving,
    onSelectTemplate,
    onSave,
    onReset,
    collectionName,
    collectionDescription,
    heroImage,
    selectedFont: savedFont,
}: HeroPreviewModalProps) {
    // Google Fonts options for the editor
    const FONT_OPTIONS: Array<{
        key: string;
        label: string;
        cssFamily: string;
        googleHref: string;
    }> = [
        {
            key: "inter",
            label: "Inter",
            cssFamily:
                "'Inter', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif",
            googleHref:
                "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap",
        },
        {
            key: "playfair",
            label: "Playfair Display",
            cssFamily:
                "'Playfair Display', Georgia, Cambria, 'Times New Roman', Times, serif",
            googleHref:
                "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap",
        },
        {
            key: "poppins",
            label: "Poppins",
            cssFamily:
                "'Poppins', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif",
            googleHref:
                "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap",
        },
    ];

    const [selectedFont, setSelectedFont] = useState<string>("inter");

    // Sync local font state with parent-provided value when editor opens or it changes
    useEffect(() => {
        if (savedFont) setSelectedFont(savedFont);
    }, [savedFont, open]);
    useEffect(() => {
        if (!open) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [open, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    const template = getTemplateByKey(selectedTemplate);
    const Desktop = template.Desktop;
    const Mobile = template.Mobile;

    // Iframe-based preview so Tailwind breakpoints are evaluated per viewport
    function IframePreview({
        BaseComp,
        baseW,
        baseH,
        title,
        description,
        image,
        fitBoth = false,
        fontCssFamily,
        fontHref,
    }: {
        BaseComp: React.ComponentType<{
            title: string;
            description?: string;
            image?: string;
        }>;
        baseW: number;
        baseH: number;
        title: string;
        description?: string;
        image?: string;
        fitBoth?: boolean;
        fontCssFamily?: string;
        fontHref?: string;
    }) {
        const wrapperRef = useRef<HTMLDivElement | null>(null);
        const iframeRef = useRef<HTMLIFrameElement | null>(null);
        const rootRef = useRef<ReactDOM.Root | null>(null);
        const [scale, setScale] = useState(1);

        useLayoutEffect(() => {
            const el = wrapperRef.current;
            if (!el) return;
            const compute = () => {
                const w = el.clientWidth || 0;
                const h = el.clientHeight || 0;
                if (w === 0) return;
                const sW = w / baseW;
                const sH = h > 0 ? h / baseH : sW;
                const s = fitBoth ? Math.min(sW, sH) : sW;
                setScale(s);
            };
            compute();
            const ro = new ResizeObserver(compute);
            ro.observe(el);
            return () => ro.disconnect();
        }, [baseW, baseH, fitBoth]);

        // Mount React app into iframe for isolated viewport width
        useEffect(() => {
            const iframe = iframeRef.current;
            if (!iframe) return;
            const doc = iframe.contentDocument;
            if (!doc) return;

            doc.open();
            doc.write(`<!DOCTYPE html><html><head><meta charset=\"utf-8\" />
                <meta name=\"viewport\" content=\"width=${baseW}, initial-scale=1\" />
                <style>html,body,#root{margin:0;padding:0;width:100%;height:100%;background:transparent;}</style>
            </head><body><div id=\"root\"></div></body></html>`);
            doc.close();

            // Copy styles from parent document
            try {
                const parentSheets = Array.from(
                    document.styleSheets
                ) as CSSStyleSheet[];
                const styleEl = doc.createElement("style");
                let cssText = "";
                for (const sheet of parentSheets) {
                    try {
                        const rules = sheet.cssRules;
                        for (const rule of Array.from(rules)) {
                            cssText += rule.cssText + "\n";
                        }
                    } catch {
                        const ownerNode =
                            sheet.ownerNode as HTMLLinkElement | null;
                        if (ownerNode?.href) {
                            const link = doc.createElement("link");
                            link.rel = "stylesheet";
                            link.href = ownerNode.href;
                            doc.head.appendChild(link);
                        }
                    }
                }
                if (cssText) {
                    styleEl.appendChild(doc.createTextNode(cssText));
                    doc.head.appendChild(styleEl);
                }
            } catch {}

            // Ensure selected Google Font is loaded inside iframe
            if (fontHref) {
                const id = "hero-font-link";
                let link = doc.getElementById(id) as HTMLLinkElement | null;
                if (!link) {
                    link = doc.createElement("link");
                    link.id = id;
                    link.rel = "stylesheet";
                    doc.head.appendChild(link);
                }
                link.href = fontHref;
            }

            const mount = doc.getElementById("root");
            if (!mount) return;
            rootRef.current = ReactDOM.createRoot(mount);
            rootRef.current.render(
                <div
                    className="hero-preview-scope"
                    style={{
                        width: baseW,
                        height: baseH,
                        fontFamily: fontCssFamily,
                    }}
                >
                    <BaseComp
                        title={title}
                        description={description}
                        image={image}
                    />
                </div>
            );

            return () => {
                rootRef.current?.unmount();
                rootRef.current = null;
            };
        }, [BaseComp, baseW, baseH]);

        // Update on prop changes
        useEffect(() => {
            const iframe = iframeRef.current;
            const doc = iframe?.contentDocument;
            if (!doc || !rootRef.current) return;
            // Update font link if changed
            if (fontHref) {
                const id = "hero-font-link";
                let link = doc.getElementById(id) as HTMLLinkElement | null;
                if (!link) {
                    link = doc.createElement("link");
                    link.id = id;
                    link.rel = "stylesheet";
                    doc.head.appendChild(link);
                }
                if (link.href !== fontHref) link.href = fontHref;
            }
            rootRef.current.render(
                <div
                    className="hero-preview-scope"
                    style={{
                        width: baseW,
                        height: baseH,
                        fontFamily: fontCssFamily,
                    }}
                >
                    <BaseComp
                        title={title}
                        description={description}
                        image={image}
                    />
                </div>
            );
        }, [
            title,
            description,
            image,
            BaseComp,
            baseW,
            baseH,
            fontCssFamily,
            fontHref,
        ]);

        const height = Math.round(baseH * scale);

        return (
            <div
                ref={wrapperRef}
                className="relative w-full"
                style={{ height }}
            >
                <iframe
                    ref={iframeRef}
                    title="hero-preview-iframe"
                    style={{
                        width: baseW,
                        height: baseH,
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                        border: "0",
                        display: "block",
                        background: "transparent",
                    }}
                />
            </div>
        );
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 w-screen h-screen"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Hero design editor"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="relative z-10 flex h-full w-full items-stretch"
                    >
                        <div className="flex-1 h-full bg-linear-to-br from-gray-50 to-gray-100">
                            {/* Top bar */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.3,
                                    delay: 0.1,
                                    ease: "easeOut",
                                }}
                                className="flex items-center justify-between px-6 sm:px-8 py-4 border-b border-gray-200 bg-white/70"
                            >
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                                    Hero design editor
                                </h2>

                                <button
                                    onClick={onClose}
                                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
                                    aria-label="Close editor (Esc)"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </motion.div>

                            {/* Main area */}
                            <div className="h-[calc(100%-64px)] sm:h-[calc(100%-72px)] grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 p-4 sm:p-6">
                                {/* Selector panel (left on desktop, top on mobile) */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: 0.2,
                                        ease: "easeOut",
                                    }}
                                    className="lg:col-span-4 order-2 lg:order-1 overflow-y-auto"
                                >
                                    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm lg:h-[86vh] lg:pb-24 pb-40">
                                        <HeroTemplateSelector
                                            templates={templates}
                                            selectedTemplate={selectedTemplate}
                                            savedTemplate={savedTemplate}
                                            saving={saving}
                                            onSelectTemplate={onSelectTemplate}
                                            onSave={() =>
                                                onSave({
                                                    template: selectedTemplate,
                                                    font: selectedFont,
                                                })
                                            }
                                            onReset={onReset}
                                            previewData={{
                                                title: collectionName,
                                                description:
                                                    collectionDescription,
                                                image: heroImage,
                                            }}
                                            selectedFont={selectedFont}
                                            onSelectFont={setSelectedFont}
                                            savedFont={savedFont}
                                        />
                                    </div>
                                </motion.div>

                                {/* Preview panel */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: 0.2,
                                        ease: "easeOut",
                                    }}
                                    className="lg:col-span-7 order-1 lg:order-2 flex items-center justify-center"
                                >
                                    <div className="w-full flex items-center justify-center py-4">
                                        <div className="relative max-w-5xl w-full mx-auto">
                                            {/* Desktop frame */}
                                            <div className="relative hidden md:block mx-auto bg-black px-2 py-4 rounded-lg border border-gray-200 shadow-2xl w-[92%] md:w-[86%]">
                                                <div className="aspect-video relative overflow-hidden bg-gray-900 rounded-b-lg">
                                                    <div className="absolute inset-0 p-0 m-0">
                                                        <IframePreview
                                                            BaseComp={Desktop}
                                                            baseW={1280}
                                                            baseH={720}
                                                            title={
                                                                collectionName
                                                            }
                                                            description={
                                                                collectionDescription
                                                            }
                                                            image={heroImage}
                                                            fontCssFamily={
                                                                FONT_OPTIONS.find(
                                                                    (f) =>
                                                                        f.key ===
                                                                        selectedFont
                                                                )?.cssFamily
                                                            }
                                                            fontHref={
                                                                FONT_OPTIONS.find(
                                                                    (f) =>
                                                                        f.key ===
                                                                        selectedFont
                                                                )?.googleHref
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* DESKTOP Mobile phone overlay*/}
                                            <div className="hidden md:block absolute right-2 lg:right-6 -bottom-8 w-[170px] h-[360px] rounded-4xl border-8 border-black overflow-hidden shadow-2xl bg-black">
                                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-1.5 rounded-full bg-black/60 z-20" />
                                                <div className="absolute inset-0">
                                                    <div className="w-full h-full">
                                                        <IframePreview
                                                            BaseComp={Mobile}
                                                            baseW={390}
                                                            baseH={844}
                                                            title={
                                                                collectionName
                                                            }
                                                            description={
                                                                collectionDescription
                                                            }
                                                            image={heroImage}
                                                            fitBoth
                                                            fontCssFamily={
                                                                FONT_OPTIONS.find(
                                                                    (f) =>
                                                                        f.key ===
                                                                        selectedFont
                                                                )?.cssFamily
                                                            }
                                                            fontHref={
                                                                FONT_OPTIONS.find(
                                                                    (f) =>
                                                                        f.key ===
                                                                        selectedFont
                                                                )?.googleHref
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mobile-friendly stacked previews */}
                                            <div className="md:hidden mt-4 grid grid-cols-2 gap-3 relative">
                                                <div className="col-span-2">
                                                    <div className="rounded-lg overflow-hidden border-8 border-black bg-black mr-12">
                                                        <div className="aspect-video relative">
                                                            <div className="absolute inset-0">
                                                                <IframePreview
                                                                    BaseComp={
                                                                        Desktop
                                                                    }
                                                                    baseW={1280}
                                                                    baseH={720}
                                                                    title={
                                                                        collectionName
                                                                    }
                                                                    description={
                                                                        collectionDescription
                                                                    }
                                                                    image={
                                                                        heroImage
                                                                    }
                                                                    fontCssFamily={
                                                                        FONT_OPTIONS.find(
                                                                            (
                                                                                f
                                                                            ) =>
                                                                                f.key ===
                                                                                selectedFont
                                                                        )
                                                                            ?.cssFamily
                                                                    }
                                                                    fontHref={
                                                                        FONT_OPTIONS.find(
                                                                            (
                                                                                f
                                                                            ) =>
                                                                                f.key ===
                                                                                selectedFont
                                                                        )
                                                                            ?.googleHref
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div
                                                    className="rounded-xl absolute -top-2 right-0 overflow-hidden border-4 border-black bg-black"
                                                    style={{
                                                        width: 80,
                                                        height: 160,
                                                    }}
                                                >
                                                    <IframePreview
                                                        BaseComp={Mobile}
                                                        baseW={390}
                                                        baseH={844}
                                                        title={collectionName}
                                                        description={
                                                            collectionDescription
                                                        }
                                                        image={heroImage}
                                                        fitBoth
                                                        fontCssFamily={
                                                            FONT_OPTIONS.find(
                                                                (f) =>
                                                                    f.key ===
                                                                    selectedFont
                                                            )?.cssFamily
                                                        }
                                                        fontHref={
                                                            FONT_OPTIONS.find(
                                                                (f) =>
                                                                    f.key ===
                                                                    selectedFont
                                                            )?.googleHref
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
