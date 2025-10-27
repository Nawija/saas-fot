// components/gallery/hero/templates/Gradient.tsx
"use client";

import { motion } from "framer-motion";
import { GalleryHeroTemplate } from "../types";

export const GradientTemplate: GalleryHeroTemplate = ({ data, options }) => {
    const shouldAnimate = !options?.disableAnimations;

    const glowVariants = shouldAnimate
        ? {
              animate: {
                  backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
              },
              transition: {
                  duration: 20,
                  repeat: Infinity,
                  ease: "easeInOut" as const,
              },
          }
        : {};

    const circleVariants = shouldAnimate
        ? {
              initial: { scale: 0.9, opacity: 0 },
              animate: { scale: 1, opacity: 1 },
              transition: { duration: 1, ease: "easeOut" as const },
          }
        : {};

    const imageHoverVariants = shouldAnimate
        ? {
              whileHover: { scale: 1.05 },
              transition: { duration: 0.6 },
          }
        : {};

    const textVariants = shouldAnimate
        ? {
              initial: { y: 50, opacity: 0 },
              animate: { y: 0, opacity: 1 },
              transition: {
                  delay: 0.6,
                  duration: 1,
                  ease: "easeOut" as const,
              },
          }
        : {};

    return (
        <div className="relative h-screen w-full overflow-hidden bg-linear-to-br from-gray-900 via-slate-800 to-gray-700">
            {/* Animated background glow */}
            <motion.div
                className="absolute inset-0 bg-linear-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl"
                {...glowVariants}
                style={{
                    backgroundSize: "400% 400%",
                }}
            />

            {/* Centered image circle */}
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                    {...circleVariants}
                    className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border border-white/20 shadow-[0_0_60px_rgba(255,255,255,0.1)]"
                >
                    {data.image ? (
                        <motion.img
                            src={data.image}
                            alt={data.name}
                            className="w-full h-full object-cover"
                            {...imageHoverVariants}
                        />
                    ) : (
                        <div className="w-full h-full bg-linear-to-br from-slate-600 to-slate-400" />
                    )}
                </motion.div>
            </div>

            {/* Overlay vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.8)_100%)]" />

            {/* Text content */}
            <div className="relative z-10 flex flex-col items-center justify-end h-full text-white text-center px-6 pb-20">
                <motion.div {...textVariants} className="max-w-3xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight drop-shadow-lg tracking-tight">
                        {data.name}
                    </h1>

                    {data.description && (
                        <p className="text-lg md:text-2xl text-gray-200/90 leading-relaxed max-w-2xl mx-auto">
                            {data.description}
                        </p>
                    )}
                </motion.div>
            </div>
        </div>
    );
};
