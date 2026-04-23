"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { uploadExcelData, ExcelRow } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [cid, setCid] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    candidatesCreated: number;
    applicationsCreated: number;
    duplicatesSkipped: number;
  } | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLookup = () => {
    const trimmed = cid.trim().toUpperCase();
    if (trimmed) {
      router.push(`/candidate/${trimmed}`);
    }
  };

  const processExcel = useCallback(async (file: File) => {
    setUploading(true);
    setUploadError("");
    setUploadResult(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });

      const rows: ExcelRow[] = [];

      for (const sheetName of workbook.SheetNames) {
        if (sheetName === "Summary") continue;

        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

        for (const row of jsonData) {
          const userId = String(row["User ID"] || "").trim();
          if (!userId || !userId.match(/^\d+$/)) continue;

          const jobId = String(row["Job ID"] || "").trim();
          if (!jobId) continue;

          let matchPct = String(row["Match %"] || "0").replace("%", "").trim();
          const matchNum = parseInt(matchPct) || 0;

          rows.push({
            user_id: userId,
            name: String(row["Candidate Name"] || "Unknown").trim(),
            email: `user${userId}@recruitment.local`,
            job_id: jobId,
            role: String(row["Role"] || "Unknown").trim(),
            company: String(row["Company"] || "Unknown").trim(),
            category: String(row["Category"] || sheetName).trim(),
            match_percent: matchNum,
            reason: String(row["Reason"] || "").trim(),
          });
        }
      }

      if (rows.length === 0) {
        setUploadError(
          "No valid data found. Ensure your Excel has columns: User ID, Job ID, Candidate Name, Role, Company, Match %"
        );
        setUploading(false);
        return;
      }

      const result = await uploadExcelData(rows);
      setUploadResult(result);
    } catch (err) {
      setUploadError(
        `Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }

    setUploading(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processExcel(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processExcel(file);
  };

  return (
    <div style={styles.page}>
      {/* Decorative orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      <main style={styles.main}>
        {/* Hero */}
        <div className="animate-fade-in-up" style={styles.hero}>
          <div style={styles.brandBadge}>
            <span style={styles.brandIcon}>🚔</span>
            Siddipet Police
          </div>
          <h1 style={styles.heading}>
            Udyogh <span style={styles.headingAccent}>Mitra</span>
            <br />
            Job Portal
          </h1>
          <p style={styles.subheading}>
            Official Recruitment Portal launched on 23/04/2026. Track every application and get real-time status intelligence.
          </p>
        </div>

        {/* CID Lookup */}
        <div
          className="animate-fade-in-up stagger-2"
          style={styles.lookupCard}
        >
          <h2 style={styles.cardTitle}>🔍 Candidate Lookup</h2>
          <p style={styles.cardSub}>
            Enter your unique Candidate ID to view your personalized dashboard
          </p>
          <div style={styles.inputRow}>
            <input
              type="text"
              className="input-field input-large"
              placeholder="CID101"
              value={cid}
              onChange={(e) => setCid(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
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

        {/* Excel Upload */}
        <div
          className="animate-fade-in-up stagger-3"
          style={styles.uploadCard}
        >
          <h2 style={styles.cardTitle}>📊 Upload Recruitment Data</h2>
          <p style={styles.cardSub}>
            Upload your Excel file to auto-process candidates, assign CIDs, and
            merge applications
          </p>

          <div
            className={`upload-zone ${dragOver ? "drag-over" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            id="upload-zone"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              style={{ display: "none" }}
              id="file-input"
            />
            <div className="upload-icon">
              {uploading ? "⏳" : "📁"}
            </div>
            <div className="upload-title">
              {uploading
                ? "Processing your data..."
                : "Drop Excel file here or click to browse"}
            </div>
            <div className="upload-sub">
              Supports .xlsx, .xls — Columns: User ID, Job ID, Candidate Name,
              Role, Company, Match %
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div style={styles.progressWrap}>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: "60%", animation: "pulse 1s infinite" }}
                />
              </div>
              <p style={styles.progressText}>
                Deduplicating candidates & merging applications...
              </p>
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div className="alert-card success" style={styles.resultCard}>
              <span style={{ fontSize: "1.5rem" }}>✅</span>
              <div>
                <strong>Upload Complete!</strong>
                <div style={styles.resultGrid}>
                  <div style={styles.resultItem}>
                    <span style={styles.resultNum}>
                      {uploadResult.candidatesCreated}
                    </span>
                    <span style={styles.resultLabel}>Candidates Created</span>
                  </div>
                  <div style={styles.resultItem}>
                    <span style={styles.resultNum}>
                      {uploadResult.applicationsCreated}
                    </span>
                    <span style={styles.resultLabel}>Applications Added</span>
                  </div>
                  <div style={styles.resultItem}>
                    <span style={styles.resultNum}>
                      {uploadResult.duplicatesSkipped}
                    </span>
                    <span style={styles.resultLabel}>Duplicates Skipped</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Error */}
          {uploadError && (
            <div className="alert-card danger" style={styles.resultCard}>
              <span style={{ fontSize: "1.5rem" }}>❌</span>
              <div>
                <strong>Upload Error</strong>
                <p style={{ marginTop: 4, fontSize: "0.9rem" }}>
                  {uploadError}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div
          className="animate-fade-in-up stagger-4"
          style={styles.linksRow}
        >
          <a
            href="/admin"
            className="btn-secondary"
            style={styles.linkBtn}
            id="admin-link"
          >
            📈 Admin Dashboard
          </a>
        </div>

        {/* Footer */}
        <footer style={styles.footer}>
          <p style={styles.footerText}>
            Siddipet Police Udyogh Mitra — v2.0 (23/04/2026)
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
    overflow: "hidden",
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
  main: {
    maxWidth: "640px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
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
    background: "linear-gradient(135deg, #2dd4a8, #4f8cff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subheading: {
    fontSize: "1.05rem",
    color: "#94a3b8",
    lineHeight: 1.6,
    maxWidth: "480px",
    margin: "0 auto",
  },
  lookupCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "32px",
    backdropFilter: "blur(12px)",
  },
  cardTitle: {
    fontSize: "1.2rem",
    fontWeight: 700,
    marginBottom: "6px",
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
  uploadCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "32px",
    backdropFilter: "blur(12px)",
  },
  progressWrap: {
    marginTop: "16px",
  },
  progressText: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    marginTop: "8px",
    textAlign: "center" as const,
  },
  resultCard: {
    marginTop: "16px",
  },
  resultGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginTop: "12px",
  },
  resultItem: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
  },
  resultNum: {
    fontSize: "1.5rem",
    fontWeight: 800,
    fontFamily: "'JetBrains Mono', monospace",
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
