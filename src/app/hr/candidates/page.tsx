"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getHrCandidatesPreview, HrCandidatePreview } from "@/lib/supabase";

export default function HrCandidatesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<HrCandidatePreview[]>([]);

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("hr-authenticated") === "true";
    if (!isAuthenticated) {
      router.replace("/hr/login");
      return;
    }

    (async () => {
      const rows = await getHrCandidatesPreview(3);
      setCandidates(rows);
      setLoading(false);
    })();
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("hr-authenticated");
    router.push("/hr/login");
  };

  return (
    <div style={styles.page}>
      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <p style={styles.kicker}>HR Dashboard</p>
            <h1 style={styles.title}>List of Candidates</h1>
            <p style={styles.subtitle}>
              Showing first 3 candidates from the `candidates` table.
            </p>
          </div>
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </header>

        {loading ? (
          <div className="glass-card" style={styles.loadingCard}>
            Loading candidates...
          </div>
        ) : (
          <div style={styles.grid}>
            {candidates.map((candidate) => (
              <article key={candidate.id} className="glass-card" style={styles.card}>
                <div style={styles.cardTop}>
                  <h2 style={styles.name}>{candidate.name || "Unnamed Candidate"}</h2>
                  <span style={styles.cid}>{candidate.id}</span>
                </div>

                <div style={styles.infoGrid}>
                  <InfoRow label="Email" value={candidate.email} />
                  <InfoRow label="Phone Number" value={candidate.phone} />
                  <InfoRow label="Gender" value={candidate.gender} />
                  <InfoRow label="Village" value={candidate.village} />
                  <InfoRow label="Mandal" value={candidate.mandal} />
                  <InfoRow label="District" value={candidate.district} />
                  <InfoRow
                    label="Education Qualification"
                    value={candidate.education_qualification}
                  />
                </div>
              </article>
            ))}

            {candidates.length === 0 ? (
              <div className="glass-card" style={styles.emptyCard}>
                No candidate records available.
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value?.trim() ? value : "-"}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "28px 16px",
  },
  main: {
    maxWidth: "1120px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  kicker: {
    fontSize: "0.8rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    color: "#64748b",
    marginBottom: "4px",
    fontWeight: 700,
  },
  title: {
    fontSize: "2rem",
    marginBottom: "6px",
  },
  subtitle: {
    color: "#64748b",
  },
  loadingCard: {
    padding: "28px",
    textAlign: "center" as const,
    fontWeight: 600,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
    gap: "16px",
  },
  card: {
    padding: "18px",
    borderRadius: "16px",
    background: "#ffffff",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "14px",
    paddingBottom: "10px",
    borderBottom: "1px solid rgba(0, 26, 61, 0.08)",
  },
  name: {
    fontSize: "1.15rem",
    margin: 0,
  },
  cid: {
    fontFamily: "var(--font-mono)",
    color: "#0f172a",
    fontWeight: 700,
    fontSize: "0.85rem",
    background: "rgba(0, 26, 61, 0.08)",
    borderRadius: "999px",
    padding: "4px 10px",
  },
  infoGrid: {
    display: "grid",
    gap: "10px",
  },
  infoRow: {
    display: "grid",
    gap: "4px",
  },
  infoLabel: {
    fontSize: "0.72rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: "#64748b",
    fontWeight: 700,
  },
  infoValue: {
    fontSize: "0.95rem",
    color: "#001A3D",
    wordBreak: "break-word" as const,
  },
  emptyCard: {
    gridColumn: "1 / -1",
    padding: "28px",
    textAlign: "center" as const,
    color: "#64748b",
    fontWeight: 600,
  },
};
