// components/gallery/hero/templates/Cinematic.tsx
"use client";

import { motion } from "framer-motion";
import { GalleryHeroTemplate } from "../types";

// Premium: Cinematic look with letterbox bars and strong typography
export const CinematicTemplate: GalleryHeroTemplate = ({ data, options }) => {
    const shouldAnimate = !options?.disableAnimations;

    // --- Variants ---
    const imageVariants = shouldAnimate
        ? {
              initial: { scale: 1.1, opacity: 0 },
              animate: { scale: 1, opacity: 1 },
              transition: { duration: 1.8, ease: "easeOut" as const },
          }
        : {};

    const overlayVariants = shouldAnimate
        ? {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: { duration: 1.2 },
          }
        : {};

    const letterboxVariants = shouldAnimate
        ? {
              initial: { height: 0 },
              animate: { height: ["0rem", "2.5rem", "2.5rem"] },
              transition: { duration: 1, ease: "easeInOut" as const },
          }
        : { animate: { height: "2.5rem" } };

    const titleVariants = shouldAnimate
        ? {
              initial: { opacity: 0, y: 30 },
              animate: { opacity: 1, y: 0 },
              transition: {
                  delay: 0.6,
                  duration: 1,
                  ease: "easeOut" as const,
              },
          }
        : {};

    const descVariants = shouldAnimate
        ? {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: {
                  delay: 0.8,
                  duration: 1,
                  ease: "easeOut" as const,
              },
          }
        : {};

    const linkVariants = shouldAnimate
        ? {
              initial: { opacity: 0, y: 0 },
              animate: { opacity: 1, y: 0 },
              transition: {
                  delay: 0.7,
                  duration: 1,
                  ease: "easeOut" as const,
              },
          }
        : {};

    return (
        <div
            className="relative w-full bg-black overflow-hidden"
            style={{ height: "100dvh" }}
        >
            {/* BACKGROUND IMAGE */}
            {data.image ? (
                <motion.img
                    src={data.image}
                    alt={data.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    {...imageVariants}
                />
            ) : (
                <motion.div
                    className="absolute inset-0 w-full h-full bg-linear-to-br from-zinc-900 to-slate-700"
                    {...overlayVariants}
                />
            )}

            {/* LETTERBOX BARS */}
            <motion.div
                className="absolute top-0 left-0 right-0 bg-black/95"
                {...letterboxVariants}
            />
            <motion.div
                className="absolute bottom-0 left-0 right-0 bg-black/95"
                {...letterboxVariants}
            />

            {/* GRADIENT OVERLAY */}
            <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/30 to-black/70" />

            {/* TITLE + DESCRIPTION + CTA */}
            <div className="relative z-10 h-full flex items-center justify-center px-6">
                <div className="text-center text-white">
                    <motion.h1
                        {...titleVariants}
                        className="text-5xl md:text-7xl font-extrabold tracking-wide mb-4 drop-shadow-lg"
                    >
                        {data.name}
                    </motion.h1>

                    {data.description && (
                        <motion.p
                            {...descVariants}
                            className="text-sm lg:text-base font-semibold text-gray-100 max-w-3xl mx-auto leading-relaxed mb-10"
                        >
                            {data.description}
                        </motion.p>
                    )}

                    <motion.a
                        href="#gallery"
                        {...linkVariants}
                        className="inline-block py-3 px-8 border border-white/70 bg-white/10 hover:bg-black/10 text-white text-sm font-semibold transition-all duration-300 hover:text-white"
                    >
                        Przejdź do galerii
                    </motion.a>
                </div>
            </div>
        </div>
    );
};
