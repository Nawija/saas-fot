// components/dashboard/HeroPreviewModal.tsx
"use client";

import { useEffect } from "react";
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
    onSave: () => void;
    onReset: () => void;
    collectionName: string;
    collectionDescription?: string;
    heroImage?: string;
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
}: HeroPreviewModalProps) {
    // Handle Esc key
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
                    aria-label="Kreator wyglądu hero"
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
                                className="flex items-center justify-between px-6 sm:px-8 py-4 border-b border-gray-200 bg-white/70 backdrop-blur"
                            >
                                <div>
                                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                                        Edytor wyglądu hero
                                    </h2>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        Podgląd (desktop + mobile) po prawej,
                                        wybór szablonów po lewej. Zapisz, aby
                                        zastosować.
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onClose}
                                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
                                    aria-label="Zamknij edytor (Esc)"
                                >
                                    <X className="w-5 h-5" />
                                </motion.button>
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
                                    className="lg:col-span-5 order-2 lg:order-1 overflow-y-auto"
                                >
                                    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm h-[80vh]">
                                        <HeroTemplateSelector
                                            templates={templates}
                                            selectedTemplate={selectedTemplate}
                                            savedTemplate={savedTemplate}
                                            saving={saving}
                                            onSelectTemplate={onSelectTemplate}
                                            onSave={onSave}
                                            onReset={onReset}
                                            previewData={{
                                                title: collectionName,
                                                description:
                                                    collectionDescription,
                                                image: heroImage,
                                            }}
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
                                                    <Desktop
                                                        title={collectionName}
                                                        description={
                                                            collectionDescription
                                                        }
                                                        image={heroImage}
                                                    />
                                                </div>
                                            </div>

                                            {/* Mobile phone overlay */}
                                            <motion.div
                                                whileHover={{
                                                    scale: 1.05,
                                                    transition: {
                                                        duration: 0.3,
                                                    },
                                                }}
                                                className="hidden md:block absolute right-2 lg:right-6 -bottom-8 w-[170px] h-[360px] rounded-4xl border-8 border-black overflow-hidden shadow-2xl bg-black"
                                            >
                                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-1.5 rounded-full bg-black/60 z-20" />
                                                <div className="absolute inset-0">
                                                    <Mobile
                                                        title={collectionName}
                                                        description={
                                                            collectionDescription
                                                        }
                                                        image={heroImage}
                                                    />
                                                </div>
                                            </motion.div>

                                            {/* Mobile-friendly stacked previews */}
                                            <div className="md:hidden mt-4 grid grid-cols-2 gap-3 relative">
                                                <div className="col-span-2">
                                                    <div className="rounded-lg overflow-hidden border border-gray-200 bg-black">
                                                        <div className="aspect-video relative">
                                                            <Desktop
                                                                title={
                                                                    collectionName
                                                                }
                                                                description={
                                                                    collectionDescription
                                                                }
                                                                image={
                                                                    heroImage
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="rounded-xl absolute -top-2 -right-10 scale-50 overflow-hidden border-8 border-black bg-black">
                                                    <div className="relative w-[120px] h-[260px]">
                                                        <Mobile
                                                            title={
                                                                collectionName
                                                            }
                                                            description={
                                                                collectionDescription
                                                            }
                                                            image={heroImage}
                                                        />
                                                    </div>
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
