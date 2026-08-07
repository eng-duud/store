"use client";

import React from "react";
import { useCart } from "@/hooks/use-cart";
import { motion, AnimatePresence } from "framer-motion";
import SplineScene from "./spline-scene";

export default function FloatingCart() {
  const { cartItems, isCartOpen, setIsCartOpen, isHydrated } = useCart();
  const itemCount = isHydrated ? cartItems.reduce((acc, item) => acc + item.quantity, 0) : 0;

  if (!isHydrated || itemCount === 0) return null;

  return (
    <AnimatePresence mode="wait">
      {itemCount > 0 && (
        <motion.button
          layoutId="main-cart"
          initial={{ scale: 0.8, y: -100 }}
          animate={{
            scale: 1,
            y: 0,
            boxShadow: "0 25px 50px -12px rgba(37, 99, 235, 0.4)",
          }}
          exit={{ scale: 0.5, opacity: 0, y: 100 }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 15,
            mass: 1,
          }}
          onClick={() => setIsCartOpen(!isCartOpen)}
          className="fixed bottom-6 left-6 z-50 p-2 bg-white/40 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[40px] shadow-2xl flex flex-col items-center justify-center border border-white/50 dark:border-slate-700/50 group overflow-hidden cursor-pointer"
          aria-label="سلة المشتريات"
        >
          {/* The 3D WOW Factor */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <SplineScene />

            {/* Number Badge with fancy animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={itemCount}
              className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-black w-8 h-8 flex items-center justify-center rounded-full shadow-lg border-2 border-white dark:border-slate-900 z-10"
            >
              {itemCount}
            </motion.div>
          </div>

          <div className="pb-4 px-4 flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary opacity-90">
              سلتك
            </span>
            <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 mt-0.5">
              انقر للعرض
            </span>
          </div>

          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
