// components/gallery/hero/templates/PremiumModern.tsx
"use client";

import { GalleryHeroTemplate } from "../types";
import ResponsiveHeroImage from "../ResponsiveHeroImage";
import { useEffect, useRef } from "react";

export const ModernTemplate: GalleryHeroTemplate = ({ data, elements }) => {
    const Scroll = elements.ScrollIndicator;
    // Confetti confined to this component: create a local canvas and use
    // canvas-confetti's `create` API so particles render only inside this node.
    const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
    useEffect(() => {
        let mounted = true;
        let confettiInstance: any = null;
        (async () => {
            try {
                const mod = await import("canvas-confetti");
                const confetti = (mod && (mod.default || mod)) as any;
                if (!mounted || !confetti) return;

                const canvas = confettiCanvasRef.current;
                if (!canvas) return;

                // create a confetti launcher bound to this canvas
                if (typeof confetti.create === "function") {
                    confettiInstance = confetti.create(canvas, {
                        resize: true,
                    });
                } else {
                    confettiInstance = confetti;
                }

                const burst = (opts: any) =>
                    confettiInstance({
                        particleCount: opts.particleCount ?? 40,
                        spread: opts.spread ?? 60,
                        startVelocity: opts.startVelocity ?? 50,
                        ticks: opts.ticks ?? 500,
                        gravity: opts.gravity ?? 0.6,
                        origin: { x: opts.x ?? 0.5, y: opts.y ?? 0.35 },
                        scalar: opts.scalar ?? 1,
                        colors: opts.colors,
                    });

                burst({
                    x: 0.5,
                    y: 0.35,
                    scalar: 1.1,
                    colors: ["#ffd166", "#ef476f", "#06d6a0"],
                });
                setTimeout(
                    () =>
                        burst({
                            x: 0.3,
                            y: 0.4,
                            colors: ["#ffd166", "#ef476f"],
                        }),
                    150
                );
                setTimeout(
                    () =>
                        burst({
                            x: 0.7,
                            y: 0.4,
                            colors: ["#06d6a0", "#118ab2"],
                        }),
                    300
                );
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error("Confetti failed to load:", err);
            }
        })();

        return () => {
            mounted = false;
            confettiInstance = null;
        };
    }, []);
    return (
        <div
            className="relative w-full overflow-hidden bg-black text-white"
            style={{ height: "100dvh" }}
        >
            {/* Confetti canvas confined to this template */}
            <canvas
                ref={confettiCanvasRef}
                className="pointer-events-none absolute inset-0 w-full h-full z-40"
            />
            {/* Background image with soft overlay */}
            {data.image ? (
                <div className="absolute inset-0 z-10">
                    <ResponsiveHeroImage
                        desktop={data.image}
                        mobile={data.imageMobile || data.image}
                        alt={data.name}
                        className="w-full h-full object-cover filter saturate-110"
                        priority
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(180deg, rgba(12,12,16,0.55) 0%, rgba(8,6,10,0.6) 60%), radial-gradient(800px 400px at 10% 20%, rgba(255,120,120,0.08), transparent 20%), radial-gradient(600px 300px at 90% 80%, rgba(80,120,255,0.06), transparent 20%)",
                        }}
                    />
                </div>
            ) : (
                <div
                    className="absolute inset-0 -z-10"
                    style={{
                        background:
                            "linear-gradient(to bottom, #0f1724, #000000)",
                    }}
                />
            )}

            {/* Decorative floating shapes */}
            <div className="pointer-events-none">
                <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-pink-400/10 blur-3xl transform-gpu animate-blob" />
                <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-indigo-400/8 blur-3xl transform-gpu animate-blob animation-delay-2000" />
            </div>

            {/* Main content centered */}
            <div className="absolute inset-0 flex items-center justify-center z-20 px-6">
                <div className="max-w-4xl w-full text-center">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold leading-tight tracking-tight">
                        {data.name}
                    </h1>
                    {data.description && (
                        <p className="mt-6 text-base md:text-lg text-white/85 max-w-3xl mx-auto leading-relaxed">
                            {data.description}
                        </p>
                    )}

                    <div className="mt-8 flex items-center justify-center gap-4">
                        <a
                            href="#gallery"
                            className="inline-flex items-center px-6 py-3 bg-white text-gray-900 font-medium rounded-md shadow-lg hover:shadow-2xl transition"
                        >
                            Zobacz galerię
                        </a>
                    </div>
                </div>
            </div>

            {/* Subtle bottom metadata bar */}
            <div className="absolute bottom-6 left-6 right-6 z-30 flex items-center justify-between text-sm text-white/70">
                <span className="hidden md:inline">Premium Collection</span>

                <div className="opacity-90">Gallery</div>
            </div>

            {Scroll && <Scroll />}

            <style jsx>{`
                @keyframes blob {
                    0% {
                        transform: translateY(0) scale(1);
                    }
                    50% {
                        transform: translateY(10px) scale(1.06);
                    }
                    100% {
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite ease-in-out;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
            `}</style>
        </div>
    );
};

export default ModernTemplate;
