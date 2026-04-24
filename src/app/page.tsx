"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ApplyWizzFooter } from "@/app/components/ApplyWizzFooter";

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
    <div className="home-page-shell" style={styles.page}>
      <main className="home-main" style={styles.main}>
        {/* Official Banner */}
        <div className="home-banner animate-fade-in" style={styles.bannerWrap}>
          <Image
            src="/banner.png"
            alt="Siddipet Police Udyoga Mitra 2026"
            width={1200}
            height={320}
            priority
            style={{ ...styles.bannerImg, height: "auto" }}
          />
        </div>

        {/* Hero */}
        <div className="home-hero animate-fade-in-up" style={styles.hero}>
          <div className="home-brand-badge" style={styles.brandBadge}>
            <span style={styles.brandIcon}>🚔</span>
            Siddipet Police
          </div>
          <h1 className="home-heading" style={styles.heading}>
            POLICE UDYOGA <span style={styles.headingAccent}>MITRA</span>
            <br />
            Job Portal
          </h1>
          <p className="home-subheading" style={styles.subheading}>
            Official Recruitment Portal launched on 23/04/2026. Track every application and get real-time status intelligence.
          </p>
        </div>

        <div
          className="home-lookup-card animate-fade-in-up stagger-2"
          style={styles.lookupCard}
        >
          <h2 style={styles.cardTitle}>🔍 Candidate Status Lookup</h2>
          <p style={styles.cardSub}>
            Enter your <strong>Aadhar Number</strong>, Mobile, or Email to view your dashboard
          </p>
          <div className="home-input-row" style={styles.inputRow}>
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
              className="btn-primary home-lookup-btn"
              onClick={handleLookup}
              style={styles.lookupBtn}
              disabled={!cid.trim()}
              id="cid-lookup-btn"
            >
              View Dashboard →
            </button>
          </div>
        </div>

        <div className="home-login-row animate-fade-in-up stagger-3" style={styles.loginRow}>
          <div className="home-login-card" style={styles.hrCard}>
            <h2 className="home-login-title" style={styles.hrTitle}>For Company HR Teams</h2>
            <p className="home-login-sub" style={styles.hrSub}>
              Login to review shortlisted candidates and hiring data.
            </p>
            <button
              className="btn-primary home-login-btn"
              onClick={() => router.push("/hr/login")}
              style={styles.hrBtn}
              id="hr-login-btn"
            >
              HR Login
            </button>
          </div>

          <div className="home-login-card" style={styles.hrCard}>
            <h2 className="home-login-title" style={styles.hrTitle}>For Admin Team</h2>
            <p className="home-login-sub" style={styles.hrSub}>
              Login to access admin analytics and candidate controls.
            </p>
            <button
              className="btn-primary home-login-btn"
              onClick={() => router.push("/admin/login")}
              style={styles.hrBtn}
              id="admin-login-btn"
            >
              Admin Login
            </button>
          </div>
        </div>



        <ApplyWizzFooter />
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
  poweredBy: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginTop: "16px",
  },
  poweredText: {
    fontSize: "0.65rem",
    fontWeight: 800,
    color: "#475569",
    letterSpacing: "0.1em",
  },
  poweredLogo: {
    height: "32px",
    width: "auto",
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
    flex: 1,
    minWidth: "280px",
  },
  loginRow: {
    display: "flex",
    gap: "16px",
    alignItems: "stretch",
    flexWrap: "wrap",
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
