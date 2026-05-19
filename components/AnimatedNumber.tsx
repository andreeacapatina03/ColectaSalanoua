"use client";

import { useEffect, useRef, useState } from "react";
import { useSpring, useTransform, motion } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

function formatRON(value: number): string {
  return new Intl.NumberFormat("ro-RO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AnimatedNumber({
  value,
  className = "",
  suffix = "",
  prefix = "",
  decimals = 0,
}: AnimatedNumberProps) {
  const spring = useSpring(value, { stiffness: 35, damping: 18 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    spring.set(value);
    const unsub = spring.onChange((v) => {
      setDisplay(decimals > 0 ? parseFloat(v.toFixed(decimals)) : Math.round(v));
    });
    return unsub;
  }, [value, spring, decimals]);

  return (
    <motion.span
      key={value}
      className={className}
      initial={{ opacity: 0.7 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}
      {decimals > 0 ? display.toFixed(decimals) : formatRON(display)}
      {suffix}
    </motion.span>
  );
}
