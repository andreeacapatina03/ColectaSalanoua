"use client";

export default function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Single very subtle top orb */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          top: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          background: "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      {/* Bottom fade */}
      <div
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: 200,
          background: "linear-gradient(to top, rgba(201,168,76,0.02) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
