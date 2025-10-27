// components/gallery/hero/templates/Split.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GalleryHeroTemplate } from "../types";

export const SplitTemplate: GalleryHeroTemplate = ({ data, options }) => {
    const shouldAnimate = !options?.disableAnimations;

    const leftPanelVariants = shouldAnimate
        ? {
              initial: { opacity: 0, x: -40 },
              animate: { opacity: 1, x: 0 },
              transition: { duration: 0.8, ease: "easeOut" as const },
          }
        : {};

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
              initial: { opacity: 0, x: 40 },
              animate: { opacity: 1, x: 0 },
              transition: { duration: 1, ease: "easeOut" as const },
          }
        : {};

    return (
        <div className="relative h-screen w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden">
            {/* TEKST */}
            <motion.div
                {...leftPanelVariants}
                className="relative order-2 md:order-1 flex items-center justify-center p-10 bg-white"
            >
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
                            href="#s"
                            className="inline-block px-6 py-3 bg-black rounded-xl text-white border-gray-200 text-sm font-semibold hover:bg-gray-900 transition-colors duration-300"
                        >
                            Zobacz zdjęcia
                        </a>
                    </motion.div>
                </div>
            </motion.div>

            {/* OBRAZ */}
            <motion.div
                {...rightPanelVariants}
                className="relative order-1 md:order-2"
            >
                {data.image ? (
                    <img
                        src={data.image}
                        alt={data.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-gray-700 to-gray-500" />
                )}
            </motion.div>
        </div>
    );
};
