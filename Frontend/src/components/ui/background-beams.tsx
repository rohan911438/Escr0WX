import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
    const beamsRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={beamsRef}
            className={cn(
                "absolute inset-0 overflow-hidden [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]",
                className
            )}
        >
            <div className="absolute inset-0 bg-black/90" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-brand-accent-cyan/20 opacity-20 blur-[100px]" />
            <div className="absolute right-0 top-0 -z-10 h-[310px] w-[310px] rounded-full bg-brand-accent-purple/20 opacity-20 blur-[100px]" />

            {/* Animated Beams */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0.5, y: -100, x: -100 }}
                    animate={{ opacity: [0.2, 0.5, 0.2], y: "100vh", x: "100vw" }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-0 w-[40rem] h-[100vh] bg-gradient-to-r from-transparent via-brand-accent-cyan/10 to-transparent transform rotate-45 blur-3xl pointer-events-none"
                />
                <motion.div
                    initial={{ opacity: 0.5, y: -200, x: "20vw" }}
                    animate={{ opacity: [0.2, 0.4, 0.2], y: "120vh", x: "-50vw" }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 2 }}
                    className="absolute top-0 right-0 w-[30rem] h-[100vh] bg-gradient-to-l from-transparent via-brand-accent-purple/10 to-transparent transform -rotate-45 blur-3xl pointer-events-none"
                />
            </div>
        </div>
    );
};
