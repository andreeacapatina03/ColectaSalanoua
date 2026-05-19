"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AnimatedNumber from "@/components/AnimatedNumber";
import BackgroundOrbs from "@/components/BackgroundOrbs";
import Confetti from "@/components/Confetti";

const MILESTONE_STEP = 10000;

function getMilestone(suma: number): number {
  return Math.floor(suma / MILESTONE_STEP) * MILESTONE_STEP;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString("ro-RO", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// Sub-componentă curată pentru punctul Live (folosește Framer Motion)
function LiveDot() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 4 }}>
      <div style={{ position: "relative", width: 6, height: 6 }}>
        <motion.div
          style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: "rgba(201,168,76,0.5)",
          }}
          animate={{ scale: [1, 3], opacity: [1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c9a84c" }} />
      </div>
      <span style={{
        fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
        color: "rgba(201,168,76,0.45)", fontFamily: "var(--font-inter)", fontWeight: 500,
      }}>Live</span>
    </div>
  );
}

// Emoji + label per milestone
function getMilestoneEmoji(m: number): { emoji: string; label: string } {
  const map: Record<number, { emoji: string; label: string }> = {
    10000:  { emoji: "🌱", label: "Pilon 1: Pe calea cea buna!" },
    20000:  { emoji: "🔥", label: "Pilon 2: În duhul de acțiune!" },
    30000:  { emoji: "⚡", label: "Pilon 3: Un pas mai aproape de noul nostru loc!" },
    40000:  { emoji: "🚀", label: "Pilon 4: Privim în viitor!" },
    50000:  { emoji: "💎", label: "Pilon 5: Și mai aproape de țintă!" },
    60000:  { emoji: "🌊", label: "Pilon 6: Prin credință!" },
    70000:  { emoji: "🏔️", label: "Pilon 7: Construim!" },
    80000:  { emoji: "✨", label: "" },
    90000:  { emoji: "🎯", label: "" },
    100000: { emoji: "👑", label: "" },
  };
  if (map[m]) return map[m];
  if (m > 100000) return { emoji: "🏆", label: `${m / 1000}k` };
  return { emoji: "🎉", label: `${m / 1000}k` };
}

function MilestoneTrack({ suma }: { suma: number }) {
  const reachedMilestones: number[] = [];
  for (let m = MILESTONE_STEP; m <= getMilestone(suma); m += MILESTONE_STEP) {
    reachedMilestones.push(m);
  }

  const currentMilestone = getMilestone(suma);
  const nextMilestone = currentMilestone + MILESTONE_STEP;
  const segmentProgress = ((suma - currentMilestone) / MILESTONE_STEP) * 100;

  const visible = reachedMilestones.slice(-4);

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Progress fill bar */}
      <div style={{ position: "relative" }}>
        <div style={{
          height: 2,
          background: "rgba(255,255,255,0.05)",
          borderRadius: 99,
          overflow: "hidden",
        }}>
          <motion.div
            style={{
              height: "100%",
              background: "linear-gradient(90deg, rgba(201,168,76,0.4), #c9a84c)",
              borderRadius: 99,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(segmentProgress, 100)}%` }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <div style={{
          position: "absolute", right: 0, top: 8,
          fontSize: 10, color: "rgba(238,234,224,0.2)",
          fontFamily: "var(--font-dm-mono)",
        }}>
          {new Intl.NumberFormat("ro-RO").format(nextMilestone)}
        </div>
      </div>

      {/* Milestone cards */}
      {visible.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <AnimatePresence>
            {visible.map((m, i) => {
              const { emoji, label } = getMilestoneEmoji(m);
              const isLatest = m === currentMilestone;
              return (
                <motion.div
                  key={m}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: isLatest ? 1 : 0.45, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: isLatest ? "rgba(201,168,76,0.07)" : "rgba(255,255,255,0.02)",
                    border: isLatest ? "1px solid rgba(201,168,76,0.18)" : "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <span style={{ fontSize: isLatest ? 22 : 18, lineHeight: 1 }}>{emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: isLatest ? 13 : 12,
                      fontFamily: "var(--font-inter)",
                      fontWeight: isLatest ? 500 : 400,
                      color: isLatest ? "rgba(238,234,224,0.85)" : "rgba(238,234,224,0.35)",
                    }}>
                      {label}
                    </div>
                    <div style={{
                      fontSize: 11,
                      fontFamily: "var(--font-dm-mono)",
                      color: isLatest ? "rgba(201,168,76,0.6)" : "rgba(201,168,76,0.25)",
                      marginTop: 1,
                    }}>
                      {new Intl.NumberFormat("ro-RO").format(m)} RON
                    </div>
                  </div>
                  {isLatest && (
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: "#c9a84c",
                        boxShadow: "0 0 8px rgba(201,168,76,0.6)",
                      }}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Empty state */}
      {visible.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "16px 0 8px",
          fontSize: 11,
          color: "rgba(238,234,224,0.2)",
          fontFamily: "var(--font-inter)",
          letterSpacing: "0.05em",
        }}>
          Primul jalonul la {new Intl.NumberFormat("ro-RO").format(MILESTONE_STEP)} RON ✦
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [suma, setSuma] = useState<number>(0);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const prevMilestoneRef = useRef<number>(-1);

  const triggerConfettiIfNewMilestone = useCallback((newSuma: number, isInitial: boolean) => {
    const milestone = getMilestone(newSuma);
    if (milestone === 0) return;
    const seenKey = `milestone-seen-${milestone}`;
    const alreadySeen = localStorage.getItem(seenKey);
    if (!alreadySeen && (isInitial || milestone > prevMilestoneRef.current)) {
      localStorage.setItem(seenKey, "1");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
    prevMilestoneRef.current = milestone;
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/colecta");
      if (res.ok) {
        const data = await res.json();
        const s = data.suma ?? 0;
        setSuma(s);
        setUpdatedAt(data.updated_at ?? "");
        triggerConfettiIfNewMilestone(s, true);
      }
    } catch {}
    setLoading(false);
  }, [triggerConfettiIfNewMilestone]);

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel("colecta-live")
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "colecta" },
        (payload) => {
          const newSuma = payload.new.suma ?? 0;
          setSuma(newSuma);
          setUpdatedAt(payload.new.updated_at ?? "");
          setFlashKey(k => k + 1);
          triggerConfettiIfNewMilestone(newSuma, false);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData, triggerConfettiIfNewMilestone]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <BackgroundOrbs />
        <motion.div
          style={{
            width: 22, height: 22, borderRadius: "50%",
            border: "1.5px solid rgba(201,168,76,0.15)",
            borderTopColor: "#c9a84c",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      <BackgroundOrbs />
      <Confetti active={showConfetti} />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8">

        {/* Header */}
        <motion.div
          className="flex flex-col items-center gap-3 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 1,
                height: 24,
                background: "linear-gradient(to bottom, transparent, rgba(201,168,76,0.5), transparent)",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: 11,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "rgba(201,168,76,0.6)",
              }}
            >
              Festin de acțiune iunie
            </span>
            <div
              style={{
                width: 1,
                height: 24,
                background: "linear-gradient(to bottom, transparent, rgba(201,168,76,0.5), transparent)",
              }}
            />
          </div>

          <h1
            className="shimmer"
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Colectă Sala Nouă
          </h1>

          <LiveDot />
        </motion.div>

        {/* Big animated number */}
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          <span style={{
            fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
            color: "rgba(238,234,224,0.18)", fontFamily: "var(--font-inter)",
            fontWeight: 500, marginBottom: 10,
          }}>
            Total colectat
          </span>

          <motion.div
            key={flashKey}
            animate={flashKey > 0 ? { scale: [1, 1.03, 1] } : {}}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-baseline justify-center gap-2"
          >
            <span
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "clamp(2.6rem, 9vw, 3.8rem)",
                fontWeight: 500,
                color: "#c9a84c",
                textShadow: "0 0 30px rgba(201,168,76,0.4)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              <AnimatedNumber value={suma} />
            </span>
            
            <span style={{
              fontFamily: "var(--font-syne)",
              fontSize: "clamp(1rem, 3.5vw, 1.4rem)",
              color: "rgba(201,168,76,0.3)",
              fontWeight: 400,
              paddingBottom: 2,
              letterSpacing: "0.02em",
            }}>
              RON
            </span>
          </motion.div>
        </motion.div>

        {/* Milestones */}
        <motion.div
          className="glass rounded-2xl px-5 py-5 w-full"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
        >
          <MilestoneTrack suma={suma} />
        </motion.div>

        {/* Last updated */}
        {updatedAt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              fontSize: 10,
              color: "rgba(238,234,224,0.13)",
              fontFamily: "var(--font-inter)",
              textAlign: "center",
              letterSpacing: "0.04em",
            }}
          >
            Actualizat {formatDate(updatedAt)}
          </motion.div>
        )}

      </div>
    </main>
  );
}