"use client";

import { motion } from "framer-motion";

export default function LiveDot() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center w-2 h-2">
        <motion.div
          className="absolute w-full h-full rounded-full"
          style={{ background: "rgba(201,168,76,0.4)" }}
          animate={{ scale: [1, 2.5, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: "#c9a84c" }}
        />
      </div>
      <span
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: "11px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "rgba(201,168,76,0.7)",
        }}
      >
        Live
      </span>
    </div>
  );
}
