"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [cid, setCid] = useState("");

  const handleLookup = () => {
    const trimmed = cid.trim().toUpperCase();
    if (trimmed) {
      router.push(`/candidate/${trimmed}`);
    }
  };

  return (
    <div style={styles.page}>
      <main style={styles.main}>
        {/* Official Banner */}
        <div className="animate-fade-in" style={styles.bannerWrap}>
          <img 
            src="/banner.png" 
            alt="Siddipet Police Udyoga Mitra 2026" 
            style={styles.bannerImg} 
          />
        </div>

        {/* Hero */}
        <div className="animate-fade-in-up" style={styles.hero}>
          <div style={styles.brandBadge}>
            <span style={styles.brandIcon}>🚔</span>
            Siddipet Police
          </div>
          <h1 style={styles.heading}>
            POLICE UDYOGA <span style={styles.headingAccent}>MITRA</span>
            <br />
            Job Portal
          </h1>
          <p style={styles.subheading}>
            Official Recruitment Portal launched on 23/04/2026. Track every application and get real-time status intelligence.
          </p>
        </div>

        <div
          className="animate-fade-in-up stagger-2"
          style={styles.lookupCard}
        >
          <h2 style={styles.cardTitle}>🔍 Candidate Status Lookup</h2>
          <p style={styles.cardSub}>
            Enter your <strong>Aadhar Number</strong>, Mobile, or Email to view your dashboard
          </p>
          <div style={styles.inputRow}>
            <input
              type="text"
              className="input-field input-large"
              placeholder="Aadhar / Mobile / Email"
              value={cid}
              onChange={(e) => setCid(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              autoComplete="off"
              id="cid-input"
            />
            <button
              className="btn-primary"
              onClick={handleLookup}
              style={styles.lookupBtn}
              disabled={!cid.trim()}
              id="cid-lookup-btn"
            >
              View Dashboard →
            </button>
          </div>
        </div>

        <div className="animate-fade-in-up stagger-3" style={styles.hrCard}>
          <h2 style={styles.hrTitle}>For Company HR Teams</h2>
          <p style={styles.hrSub}>
            Login to review shortlisted candidates and hiring data.
          </p>
          <button
            className="btn-primary"
            onClick={() => router.push("/hr/login")}
            style={styles.hrBtn}
            id="hr-login-btn"
          >
            HR Login
          </button>
        </div>



        {/* Footer */}
        <footer style={styles.footer}>
          <p style={styles.footerText}>
            Siddipet POLICE UDYOGA MITRA — v2.0 (23/04/2026)
          </p>
        </footer>
      </main>
    </div>
  );
}

/* ── Inline Styles ─────────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    padding: "40px 16px",
  },
  orb1: {
    position: "fixed",
    top: "-20%",
    right: "-10%",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(45,212,168,0.08), transparent 70%)",
    pointerEvents: "none",
  },
  orb2: {
    position: "fixed",
    bottom: "-15%",
    left: "-10%",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(79,140,255,0.06), transparent 70%)",
    pointerEvents: "none",
  },
  orb3: {
    position: "fixed",
    top: "40%",
    left: "50%",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(167,139,250,0.04), transparent 70%)",
    pointerEvents: "none",
    transform: "translateX(-50%)",
  },
  bannerWrap: {
    width: "100%",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.1)",
    marginBottom: "12px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
  },
  bannerImg: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  main: {
    maxWidth: "860px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    position: "relative",
    zIndex: 1,
  },
  hero: {
    textAlign: "center",
    marginBottom: "8px",
  },
  brandBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 16px",
    background: "rgba(45, 212, 168, 0.08)",
    border: "1px solid rgba(45, 212, 168, 0.2)",
    borderRadius: "9999px",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#2dd4a8",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    marginBottom: "20px",
  },
  brandIcon: {
    fontSize: "0.7rem",
  },
  heading: {
    fontSize: "2.8rem",
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: "-0.03em",
    marginBottom: "16px",
  },
  headingAccent: {
    color: "#E31E24",
  },
  subheading: {
    fontSize: "1.1rem",
    color: "#475569",
    lineHeight: 1.5,
    maxWidth: "500px",
    margin: "0 auto",
  },
  lookupCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "32px",
    textAlign: "center",
    backdropFilter: "blur(12px)",
  },
  cardTitle: {
    fontSize: "1.4rem",
    fontWeight: 800,
    marginBottom: "8px",
    color: "#001A3D",
  },
  cardSub: {
    fontSize: "0.9rem",
    color: "#94a3b8",
    marginBottom: "20px",
  },
  inputRow: {
    display: "flex",
    gap: "12px",
    alignItems: "stretch",
  },
  lookupBtn: {
    whiteSpace: "nowrap" as const,
    minWidth: "160px",
  },
  hrCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "28px 32px",
    textAlign: "center",
  },
  hrTitle: {
    fontSize: "1.25rem",
    fontWeight: 800,
    color: "#001A3D",
    marginBottom: "8px",
  },
  hrSub: {
    fontSize: "0.95rem",
    color: "#64748b",
    marginBottom: "18px",
  },
  hrBtn: {
    minWidth: "180px",
  },
  resultLabel: {
    fontSize: "0.7rem",
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
  linksRow: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
  },
  linkBtn: {
    padding: "12px 28px",
  },
  footer: {
    textAlign: "center" as const,
    paddingTop: "20px",
  },
  footerText: {
    fontSize: "0.75rem",
    color: "#475569",
  },
};
