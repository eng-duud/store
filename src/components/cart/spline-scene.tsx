"use client";

import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

export default function SplineScene() {
  return (
    <div className="w-24 h-24 relative flex items-center justify-center overflow-hidden pointer-events-none select-none">
      {/* The Glass Orb (CSS 3D Look) */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative w-20 h-20 rounded-full bg-gradient-to-br from-white/40 to-white/5 backdrop-blur-xl border border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center overflow-hidden"
      >
        {/* Inner Glows */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/40 rounded-full blur-xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/30 rounded-full blur-xl" />

        {/* The Icon */}
        <ShoppingBag className="w-10 h-10 text-primary dark:text-white relative z-10" />

        {/* Shine Reflection */}
        <div className="absolute top-2 left-4 w-8 h-4 bg-white/30 rounded-[50%] rotate-[-20deg] blur-[1px]" />
      </motion.div>

      {/* Floating Particles around the orb */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -40, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            delay: i * 1,
          }}
          className="absolute w-1.5 h-1.5 bg-primary dark:bg-accent rounded-full"
          style={{
            left: `${30 + i * 20}%`,
            top: "60%",
          }}
        />
      ))}
    </div>
  );
}
