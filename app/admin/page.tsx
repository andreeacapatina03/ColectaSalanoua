"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AnimatedNumber from "@/components/AnimatedNumber";
import BackgroundOrbs from "@/components/BackgroundOrbs";
import Link from "next/link";

interface Tranzactie {
  id: number;
  created_at: string;
  suma_adaugata: number;
  comentariu: string;
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [suma, setSuma] = useState<number>(0);
  const [newSuma, setNewSuma] = useState<string>("");
  const [comentariu, setComentariu] = useState<string>("");
  const [istoric, setIstoric] = useState<Tranzactie[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/colecta");
      if (res.ok) {
        const data = await res.json();
        setSuma(data.suma ?? 0);
        setIstoric(data.istoric || []);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin-auth");
    if (saved === "1") setLoggedIn(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!loggedIn) return;
    const channel = supabase
      .channel("tranzactii-admin-live-delete")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tranzactii" },
        () => {
          fetchData();
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loggedIn, fetchData]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    fetch("/api/colecta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
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
    const refText = comentariu.trim();

    if (isNaN(val) || val <= 0) {
      setSaveMsg("Te rugăm să introduci o sumă validă.");
      return;
    }
    if (!refText) {
      setSaveMsg("Te rugăm să introduci o referință.");
      return;
    }

    setSaving(true);
    setSaveMsg("");
    
    const pwd = sessionStorage.getItem("admin-pwd") || "";
    const res = await fetch("/api/colecta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suma_noua: val, comentariu: refText, password: pwd }),
    });

    if (res.ok) {
      const data = await res.json();
      setSuma(data.suma);
      setNewSuma("");
      setComentariu("");
      setSaveMsg(`✓ +${val} RON adăugați cu succes!`);
    } else {
      setSaveMsg("Eroare la salvare.");
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 4000);
  }

  // REPARAT: Trimitem ID și Parolă securizat în interiorul body-ului cererii JSON
  async function handleDelete(id: number, sumaTranzactie: number) {
    if (!window.confirm(`Sigur vrei să ștergi înregistrarea de ${sumaTranzactie} RON? Această acțiune va scădea suma din total.`)) {
      return;
    }

    const pwd = sessionStorage.getItem("admin-pwd") || "";
    
    const res = await fetch("/api/colecta", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password: pwd })
    });

    if (res.ok) {
      setSaveMsg("✓ Tranzacție ștearsă din istoric!");
      fetchData();
    } else {
      const data = await res.json().catch(() => ({}));
      setSaveMsg(data.error || "Eroare la ștergerea din baza de date.");
    }
    setTimeout(() => setSaveMsg(""), 4000);
  }

  function handleLogout() {
    sessionStorage.removeItem("admin-auth");
    sessionStorage.removeItem("admin-pwd");
    setLoggedIn(false);
    setPassword("");
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <BackgroundOrbs />
        <motion.div
          style={{ width: 22, height: 22, borderRadius: "50%", border: "1.5px solid rgba(201,168,76,0.15)", borderTopColor: "#c9a84c" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-start px-4 py-12 overflow-y-auto">
      <BackgroundOrbs />

      <div className="relative z-10 w-full max-w-sm flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-1 text-center">
          <span style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(201,168,76,0.5)", fontFamily: "var(--font-inter)" }}>
            Panou administrare
          </span>
          <h1 style={{ fontFamily: "var(--font-inter)", fontSize: "1.5rem", fontWeight: 800, color: "#c9a84c", letterSpacing: "-0.02em" }}>
            Fest Sala Nouă
          </h1>
        </div>

        <AnimatePresence mode="wait">
          {!loggedIn ? (
            /* LOGIN FORM */
            <motion.div key="login" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="glass gold-glow rounded-2xl p-8">
              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <div>
                  <label style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,236,224,0.4)", fontFamily: "var(--font-inter)", display: "block", marginBottom: 8 }}>
                    Parolă admin
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full rounded-xl px-4 py-3 outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)", color: "#f0ece0", fontFamily: "var(--font-dm-mono)", fontSize: 14 }}
                    placeholder="••••••••"
                  />
                </div>
                {error && <p style={{ fontSize: 12, color: "#f87171", textAlign: "center" }}>{error}</p>}
                <button type="submit" className="w-full rounded-xl py-3 font-semibold text-uppercase" style={{ background: "linear-gradient(135deg, #a07830, #c9a84c, #e8c96a)", color: "#08080d", fontFamily: "var(--font-inter)", fontSize: 12, letterSpacing: "0.1em" }}>
                  Autentificare
                </button>
              </form>
            </motion.div>
          ) : (
            /* ADMIN PANEL */
            <motion.div key="panel" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="flex flex-col gap-5">
              
              {/* Sumă Totală */}
              <div className="glass gold-glow rounded-2xl px-6 py-4 text-center">
                <div style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,236,224,0.3)", fontFamily: "var(--font-inter)", marginBottom: 4 }}>
                  Suma totală strânsă (Live)
                </div>
                <div className="flex items-baseline justify-center gap-2">
                  <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "2.5rem", fontWeight: 500, color: "#c9a84c", textShadow: "0 0 20px rgba(201,168,76,0.4)", letterSpacing: "-0.03em" }}>
                    <AnimatedNumber value={suma} />
                  </span>
                  <span style={{ color: "rgba(201,168,76,0.4)", fontFamily: "var(--font-inter)", fontSize: "1rem" }}>RON</span>
                </div>
              </div>

              {/* Formular adăugare */}
              <div className="glass rounded-2xl px-6 py-5">
                <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,236,224,0.3)", fontFamily: "var(--font-inter)", marginBottom: 14 }}>
                  Înregistrare donație nouă
                </div>
                <form onSubmit={handleUpdate} className="flex flex-col gap-3.5">
                  <div>
                    <label style={{ fontSize: 10, color: "rgba(240,236,224,0.4)", fontFamily: "var(--font-inter)", display: "block", marginBottom: 5, letterSpacing: "0.05em" }}>Suma (RON)</label>
                    <input
                      type="number"
                      value={newSuma}
                      onChange={(e) => setNewSuma(e.target.value)}
                      placeholder="Ex: 250"
                      min="1"
                      className="w-full rounded-xl px-4 py-2.5 outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)", color: "#f0ece0", fontFamily: "var(--font-dm-mono)", fontSize: 14 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 10, color: "rgba(240,236,224,0.4)", fontFamily: "var(--font-inter)", display: "block", marginBottom: 5, letterSpacing: "0.05em" }}>Referință / Comentariu</label>
                    <input
                      type="text"
                      value={comentariu}
                      onChange={(e) => setComentariu(e.target.value)}
                      placeholder="Ex: Transfer de la nenea X"
                      className="w-full rounded-xl px-4 py-2.5 outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.15)", color: "#f0ece0", fontFamily: "var(--font-inter)", fontSize: 13 }}
                    />
                  </div>

                  <button type="submit" disabled={saving || !newSuma || !comentariu} className="w-full rounded-xl py-3 font-semibold mt-2" style={{ background: saving || !newSuma || !comentariu ? "rgba(201,168,76,0.15)" : "linear-gradient(135deg, #a07830, #c9a84c, #e8c96a)", color: saving || !newSuma || !comentariu ? "rgba(240,236,224,0.2)" : "#08080d", fontFamily: "var(--font-inter)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", cursor: saving || !newSuma || !comentariu ? "not-allowed" : "pointer" }}>
                    {saving ? "Se salvează..." : "Adaugă în istoric"}
                  </button>
                </form>

                <AnimatePresence>
                  {saveMsg && (
                    <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginTop: 10, fontSize: 12, textAlign: "center", color: saveMsg.startsWith("✓") ? "#6ee7b7" : "#f87171", fontFamily: "var(--font-inter)" }}>
                      {saveMsg}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Istoric cronologic */}
              <div className="glass rounded-2xl px-5 py-4 flex flex-col gap-3 max-h-80 overflow-y-auto">
                <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,236,224,0.3)", fontFamily: "var(--font-inter)" }}>
                  Istoric înregistrări ({istoric.length})
                </div>
                
                <div className="flex flex-col gap-2.5">
                  {istoric.length === 0 ? (
                    <div style={{ fontSize: 12, color: "rgba(240,236,224,0.2)", textAlign: "center", padding: "15px 0" }}>Nicio referință adăugată încă.</div>
                  ) : (
                    istoric.map((item) => (
                      <div key={item.id} className="flex flex-col gap-1 p-3 rounded-xl relative group" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.03)" }}>
                        <div className="flex justify-between items-start gap-4">
                          <span style={{ fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 500, color: "rgba(238,234,224,0.9)", lineHeight: 1.3, wordBreak: "break-word", paddingRight: "4px" }}>
                            {item.comentariu}
                          </span>
                          
                          <div className="flex items-center gap-2.5">
                            <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: 12, fontWeight: 600, color: "#6ee7b7", whiteSpace: "nowrap" }}>
                              +{new Intl.NumberFormat("ro-RO").format(item.suma_adaugata)} RON
                            </span>
                            
                            <button
                              onClick={() => handleDelete(item.id, item.suma_adaugata)}
                              title="Șterge tranzacția greșită"
                              style={{
                                background: "none",
                                border: "none",
                                color: "rgba(248, 113, 113, 0.4)",
                                cursor: "pointer",
                                fontSize: 14,
                                padding: "2px 4px",
                                transition: "all 0.2s",
                              }}
                              onMouseOver={(e) => e.currentTarget.style.color = "rgba(248, 113, 113, 1)"}
                              onMouseOut={(e) => e.currentTarget.style.color = "rgba(248, 113, 113, 0.4)"}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        
                        <div style={{ fontFamily: "var(--font-dm-mono)", fontSize: 10, color: "rgba(238,234,224,0.25)", display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                          <span>Data salvării:</span>
                          <span>
                            {new Date(item.created_at).toLocaleString("ro-RO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Link subsol */}
              <div className="flex justify-between items-center px-1 mt-1">
                <Link href="/" style={{ fontSize: 11, color: "rgba(201,168,76,0.5)", fontFamily: "var(--font-inter)", letterSpacing: "0.1em", textDecoration: "none" }}>
                  ← Înapoi la ecranul live
                </Link>
                <button onClick={handleLogout} style={{ fontSize: 11, color: "rgba(240,100,100,0.4)", fontFamily: "var(--font-inter)", letterSpacing: "0.1em", background: "none", border: "none", cursor: "pointer" }}>
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