"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  percentage: number;
}

export default function ProgressBar({ percentage }: ProgressBarProps) {
  const pct = Math.min(percentage, 100);

  return (
    <div className="w-full">
      <div
        className="relative w-full rounded-full overflow-hidden"
        style={{
          height: 6,
          background: "rgba(201,168,76,0.08)",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)",
        }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #8a6f2e 0%, #c9a84c 50%, #e8c96a 100%)",
            boxShadow: "0 0 16px rgba(201,168,76,0.4), 0 0 32px rgba(201,168,76,0.2)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-y-0 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
            width: "30%",
          }}
          animate={{ left: ["-30%", "130%"] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}
