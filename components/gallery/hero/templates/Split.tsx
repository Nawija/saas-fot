// components/gallery/hero/templates/Split.tsx
"use client";

import { motion } from "framer-motion";
import { GalleryHeroTemplate } from "../types";

export const SplitTemplate: GalleryHeroTemplate = ({ data, options }) => {
    const shouldAnimate = !options?.disableAnimations;

    const titleVariants = shouldAnimate
        ? {
              initial: { y: 20, opacity: 0 },
              animate: { y: 0, opacity: 1 },
              transition: {
                  delay: 0.2,
                  duration: 0.8,
                  ease: "easeOut" as const,
              },
          }
        : {};

    const descVariants = shouldAnimate
        ? {
              initial: { y: 20, opacity: 0 },
              animate: { y: 0, opacity: 1 },
              transition: {
                  delay: 0.4,
                  duration: 0.8,
                  ease: "easeOut" as const,
              },
          }
        : {};

    const buttonVariants = shouldAnimate
        ? {
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              transition: {
                  delay: 0.6,
                  duration: 0.6,
                  ease: "easeOut" as const,
              },
          }
        : {};

    const rightPanelVariants = shouldAnimate
        ? {
              initial: { opacity: 0, scale: 1.05 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 1, ease: "easeOut" as const },
          }
        : {};

    return (
        <div
            className="relative w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden p-4 bg-zinc-200"
            style={{ height: "100dvh" }}
        >
            {/* TEKST */}
            <div className="relative order-2 md:order-1 flex items-center justify-center p-10 bg-white">
                <div className="max-w-lg text-center md:text-left">
                    <motion.h1
                        {...titleVariants}
                        className="text-4xl md:text-6xl font-bold text-gray-900 mb-4"
                    >
                        {data.name}
                    </motion.h1>

                    {data.description && (
                        <motion.p
                            {...descVariants}
                            className="text-lg md:text-xl text-gray-600 mb-12"
                        >
                            {data.description}
                        </motion.p>
                    )}

                    <motion.div {...buttonVariants}>
                        <a
                            href="#gallery"
                            className="inline-block px-6 py-3 bg-black rounded text-white border-gray-200 text-sm font-semibold hover:bg-gray-900 transition-colors duration-300"
                        >
                            Zobacz zdjęcia
                        </a>
                    </motion.div>
                </div>
            </div>

            {/* OBRAZ */}
            <div className="relative order-1 md:order-2 overflow-hidden">
                <motion.div {...rightPanelVariants} className="w-full h-full ">
                    <img
                        src={data.image}
                        alt={data.name}
                        className="w-full h-full object-cover"
                    />
                </motion.div>
            </div>
        </div>
    );
};
