"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AnimatedNumber from "@/components/AnimatedNumber";
import BackgroundOrbs from "@/components/BackgroundOrbs";
import Link from "next/link";

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [suma, setSuma] = useState<number>(0);
  const [newSuma, setNewSuma] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin-auth");
    if (saved === "1") setLoggedIn(true);
    fetchSuma();
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    const channel = supabase
      .channel("colecta-admin")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "colecta" },
        (payload) => {
          setSuma(payload.new.suma ?? 0);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loggedIn]);

  async function fetchSuma() {
    try {
      const res = await fetch("/api/colecta");
      if (res.ok) {
        const data = await res.json();
        setSuma(data.suma ?? 0);
      }
    } catch {}
    setLoading(false);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    // We verify password on the server; do a quick check
    fetch("/api/colecta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suma, password }),
    }).then(async (res) => {
      if (res.ok) {
        sessionStorage.setItem("admin-auth", "1");
        sessionStorage.setItem("admin-pwd", password);
        setLoggedIn(true);
        setError("");
      } else {
        setError("Parolă incorectă.");
      }
    });
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    const val = parseFloat(newSuma.replace(",", "."));
    if (isNaN(val) || val < 0) {
      setSaveMsg("Sumă invalidă.");
      return;
    }
    setSaving(true);
    setSaveMsg("");
    const pwd = sessionStorage.getItem("admin-pwd") || "";
    const res = await fetch("/api/colecta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suma: val, password: pwd }),
    });
    if (res.ok) {
      const data = await res.json();
      setSuma(data.suma);
      setNewSuma("");
      setSaveMsg("✓ Suma actualizată cu succes!");
    } else {
      setSaveMsg("Eroare la actualizare.");
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 4000);
  }

  function handleLogout() {
    sessionStorage.removeItem("admin-auth");
    sessionStorage.removeItem("admin-pwd");
    setLoggedIn(false);
    setPassword("");
  }

  // Quick adjustments
  async function adjustSuma(delta: number) {
    const newVal = Math.max(0, suma + delta);
    setSaving(true);
    const pwd = sessionStorage.getItem("admin-pwd") || "";
    const res = await fetch("/api/colecta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suma: newVal, password: pwd }),
    });
    if (res.ok) {
      const data = await res.json();
      setSuma(data.suma);
      setSaveMsg(`✓ +${delta} RON adăugat`);
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <BackgroundOrbs />

      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <motion.div
          className="flex flex-col items-center gap-2 text-center mb-8"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(201,168,76,0.5)",
              fontFamily: "var(--font-inter)",
            }}
          >
            Panou administrare
          </span>
          <h1
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "1.6rem",
              fontWeight: 800,
              color: "#c9a84c",
              letterSpacing: "-0.02em",
            }}
          >
            Fest Sala Nouă
          </h1>
        </motion.div>

        <AnimatePresence mode="wait">
          {!loggedIn ? (
            /* LOGIN FORM */
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="glass gold-glow rounded-2xl p-8"
            >
              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "rgba(240,236,224,0.4)",
                      fontFamily: "var(--font-inter)",
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    Parolă admin
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full rounded-xl px-4 py-3 outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(201,168,76,0.2)",
                      color: "#f0ece0",
                      fontFamily: "var(--font-dm-mono)",
                      fontSize: 14,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ fontSize: 12, color: "#f87171", textAlign: "center" }}
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  className="w-full rounded-xl py-3 font-semibold transition-all"
                  style={{
                    background: "linear-gradient(135deg, #a07830, #c9a84c, #e8c96a)",
                    color: "#08080d",
                    fontFamily: "var(--font-inter)",
                    fontSize: 13,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Autentificare
                </button>
              </form>
            </motion.div>
          ) : (
            /* ADMIN PANEL */
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="flex flex-col gap-4"
            >
              {/* Current suma display */}
              <div className="glass gold-glow rounded-2xl px-6 py-5 text-center">
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    color: "rgba(240,236,224,0.3)",
                    fontFamily: "var(--font-inter)",
                    marginBottom: 8,
                  }}
                >
                  Suma curentă
                </div>
                <div className="flex items-baseline justify-center gap-2">
                  <AnimatedNumber
                    value={suma}
                    style={{
                      fontFamily: "var(--font-dm-mono)",
                      fontSize: "2.4rem",
                      color: "#c9a84c",
                      textShadow: "0 0 20px rgba(201,168,76,0.4)",
                      letterSpacing: "-0.03em",
                    } as React.CSSProperties}
                  />
                  <span style={{ color: "rgba(201,168,76,0.4)", fontFamily: "var(--font-inter)", fontSize: "1rem" }}>
                    RON
                  </span>
                </div>
              </div>

              {/* Quick adjustments */}
              <div className="glass rounded-2xl px-6 py-5">
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(240,236,224,0.3)",
                    fontFamily: "var(--font-inter)",
                    marginBottom: 12,
                  }}
                >
                  Ajustare rapidă
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[50, 100, 200, 500].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => adjustSuma(amount)}
                      disabled={saving}
                      className="rounded-xl py-2 text-center transition-all"
                      style={{
                        background: "rgba(201,168,76,0.08)",
                        border: "1px solid rgba(201,168,76,0.15)",
                        color: "rgba(201,168,76,0.8)",
                        fontFamily: "var(--font-dm-mono)",
                        fontSize: 13,
                        cursor: saving ? "not-allowed" : "pointer",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = "rgba(201,168,76,0.15)";
                        e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = "rgba(201,168,76,0.08)";
                        e.currentTarget.style.borderColor = "rgba(201,168,76,0.15)";
                      }}
                    >
                      +{amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Set exact amount */}
              <div className="glass rounded-2xl px-6 py-5">
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(240,236,224,0.3)",
                    fontFamily: "var(--font-inter)",
                    marginBottom: 12,
                  }}
                >
                  Setează suma exactă
                </div>
                <form onSubmit={handleUpdate} className="flex flex-col gap-3">
                  <input
                    type="number"
                    value={newSuma}
                    onChange={(e) => setNewSuma(e.target.value)}
                    placeholder="Ex: 3500"
                    min="0"
                    step="1"
                    className="w-full rounded-xl px-4 py-3 outline-none"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(201,168,76,0.2)",
                      color: "#f0ece0",
                      fontFamily: "var(--font-dm-mono)",
                      fontSize: 16,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                  />
                  <button
                    type="submit"
                    disabled={saving || !newSuma}
                    className="w-full rounded-xl py-3 font-semibold transition-all"
                    style={{
                      background:
                        saving || !newSuma
                          ? "rgba(201,168,76,0.2)"
                          : "linear-gradient(135deg, #a07830, #c9a84c, #e8c96a)",
                      color: saving || !newSuma ? "rgba(240,236,224,0.3)" : "#08080d",
                      fontFamily: "var(--font-inter)",
                      fontSize: 12,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      cursor: saving || !newSuma ? "not-allowed" : "pointer",
                    }}
                  >
                    {saving ? "Se salvează..." : "Actualizează"}
                  </button>
                </form>

                <AnimatePresence>
                  {saveMsg && (
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        marginTop: 10,
                        fontSize: 12,
                        textAlign: "center",
                        color: saveMsg.startsWith("✓") ? "#6ee7b7" : "#f87171",
                        fontFamily: "var(--font-inter)",
                      }}
                    >
                      {saveMsg}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer links */}
              <div className="flex justify-between items-center px-1">
                <Link
                  href="/"
                  style={{
                    fontSize: 11,
                    color: "rgba(201,168,76,0.5)",
                    fontFamily: "var(--font-inter)",
                    letterSpacing: "0.1em",
                    textDecoration: "none",
                  }}
                >
                  ← Înapoi la colectă
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    fontSize: 11,
                    color: "rgba(240,100,100,0.4)",
                    fontFamily: "var(--font-inter)",
                    letterSpacing: "0.1em",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Deconectare
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
