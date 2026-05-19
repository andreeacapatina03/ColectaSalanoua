"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface CircularProgressProps {
  percentage: number;
  size?: number;
}

export default function CircularProgress({
  percentage,
  size = 280,
}: CircularProgressProps) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  // Cap display at 999% visually for the ring (ring goes full at 100%+)
  const ringPct = Math.min(percentage, 100);
  const dashOffset = circumference - (ringPct / 100) * circumference;

  const spring = useSpring(percentage, { stiffness: 40, damping: 20 });
  const displayPct = useTransform(spring, (v) => Math.round(v));
  const [displayVal, setDisplayVal] = useState(Math.round(percentage));

  useEffect(() => {
    spring.set(percentage);
    const unsub = displayPct.onChange((v) => setDisplayVal(v));
    return unsub;
  }, [percentage, spring, displayPct]);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Outer pulse ring */}
      <div
        className="absolute inset-0 rounded-full pulse-ring"
        style={{
          background:
            "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)",
          boxShadow: "0 0 60px rgba(201,168,76,0.1)",
        }}
      />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(201,168,76,0.08)"
          strokeWidth={strokeWidth}
        />

        {/* Glow filter */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8c96a" />
            <stop offset="50%" stopColor="#c9a84c" />
            <stop offset="100%" stopColor="#a07830" />
          </linearGradient>
        </defs>

        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          filter="url(#glow)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>

      {/* Center content */}
      <div className="relative flex flex-col items-center justify-center text-center">
        <motion.div
          key={displayVal}
          initial={{ opacity: 0.6, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="leading-none font-mono font-medium"
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: size * 0.13,
            color: "#c9a84c",
            textShadow: "0 0 30px rgba(201,168,76,0.5)",
          }}
        >
          {displayVal}%
        </motion.div>
        <div
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: size * 0.05,
            color: "rgba(240,236,224,0.3)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginTop: 4,
          }}
        >
          din obiectiv
        </div>
      </div>
    </div>
  );
}
