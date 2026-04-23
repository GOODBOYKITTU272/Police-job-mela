"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CandidateIntent,
  CompanyDecision,
  getHrAllocatedCandidatesByEmail,
  HrAllocatedCandidatePreview,
  updateCandidateAllocationDecision,
} from "@/lib/supabase";

export default function HrCandidatesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<HrAllocatedCandidatePreview[]>([]);
  const [intentFilter, setIntentFilter] = useState<"All" | CandidateIntent>("All");
  const [selectedCandidate, setSelectedCandidate] =
    useState<HrAllocatedCandidatePreview | null>(null);
  const [savingDecisionFor, setSavingDecisionFor] = useState<string | null>(null);

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("hr-authenticated") === "true";
    const hrEmail = sessionStorage.getItem("hr-email");
    if (!isAuthenticated) {
      router.replace("/hr/login");
      return;
    }
    if (!hrEmail) {
      router.replace("/hr/login");
      return;
    }

    (async () => {
      const rows = await getHrAllocatedCandidatesByEmail(hrEmail);
      setCandidates(rows);
      setLoading(false);
    })();
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("hr-authenticated");
    sessionStorage.removeItem("hr-email");
    router.push("/hr/login");
  };

  const filteredCandidates =
    intentFilter === "All"
      ? candidates
      : candidates.filter((candidate) => candidate.intent === intentFilter);

  const getDecisionKey = (candidate: HrAllocatedCandidatePreview) =>
    `${candidate.id}::${candidate.allocated_company_name}`;

  const handleDecisionChange = async (
    candidate: HrAllocatedCandidatePreview,
    selectedValue: string
  ) => {
    const decision = selectedValue ? (selectedValue as CompanyDecision) : null;
    const key = getDecisionKey(candidate);
    setSavingDecisionFor(key);

    const previousCandidates = candidates;
    const nextCandidates = candidates.map((row) =>
      row.id === candidate.id &&
      row.allocated_company_name === candidate.allocated_company_name
        ? { ...row, company_decision: decision }
        : row
    );
    setCandidates(nextCandidates);

    if (
      selectedCandidate &&
      selectedCandidate.id === candidate.id &&
      selectedCandidate.allocated_company_name === candidate.allocated_company_name
    ) {
      setSelectedCandidate({ ...selectedCandidate, company_decision: decision });
    }

    const ok = await updateCandidateAllocationDecision(
      candidate.id,
      candidate.allocated_company_name,
      decision
    );

    if (!ok) {
      setCandidates(previousCandidates);
      if (
        selectedCandidate &&
        selectedCandidate.id === candidate.id &&
        selectedCandidate.allocated_company_name === candidate.allocated_company_name
      ) {
        const original = previousCandidates.find(
          (row) =>
            row.id === candidate.id &&
            row.allocated_company_name === candidate.allocated_company_name
        );
        if (original) {
          setSelectedCandidate(original);
        }
      }
    }

    setSavingDecisionFor(null);
  };

  return (
    <div style={styles.page}>
      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <p style={styles.kicker}>HR Dashboard</p>
            <h1 style={styles.title}>List of Candidates</h1>
            <p style={styles.subtitle}>
              Showing candidates allocated to your company.
            </p>
          </div>
          <div style={styles.headerActions}>
            <button className="btn-secondary" type="button" onClick={() => router.push("/")}>
              ← Back to Portal
            </button>
            <button className="btn-secondary" type="button" onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </header>

        <section style={styles.filterBar}>
          <div style={styles.filterBarInner}>
            <div style={styles.filterLeft}>
              <span style={styles.filterLabel}>Filter by Intent</span>
              <div style={styles.filterButtonsWrap}>
                {(["All", "Pending", "Not Interested", "Will Attend"] as const).map(
                  (option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setIntentFilter(option)}
                      style={{
                        ...styles.filterBtn,
                        ...(intentFilter === option
                          ? styles.filterBtnActive
                          : styles.filterBtnInactive),
                      }}
                    >
                      {option}
                    </button>
                  )
                )}
              </div>
            </div>
            {!loading ? (
              <span style={styles.filterCount}>
                {filteredCandidates.length}{" "}
                {filteredCandidates.length === 1 ? "candidate" : "candidates"}
              </span>
            ) : null}
          </div>
        </section>

        {loading ? (
          <div className="glass-card" style={styles.loadingCard}>
            Loading candidates...
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredCandidates.map((candidate) => (
              <article key={candidate.id} className="glass-card" style={styles.card}>
                <div style={styles.cardTop}>
                  <h2 style={styles.name}>{candidate.name || "Unnamed Candidate"}</h2>
                  <span style={styles.cid}>{candidate.id}</span>
                </div>

                <div style={styles.infoGrid}>
                  <InfoRow
                    label="Allocated Company"
                    value={candidate.allocated_company_name}
                  />
                  <IntentRow intent={candidate.intent} />
                  <DecisionRow
                    value={candidate.company_decision}
                    disabled={savingDecisionFor === getDecisionKey(candidate)}
                    onChange={(value) => handleDecisionChange(candidate, value)}
                  />

                  <button
                    type="button"
                    onClick={() => setSelectedCandidate(candidate)}
                    style={styles.viewMoreBtn}
                  >
                    View More Details
                  </button>
                </div>
              </article>
            ))}

            {filteredCandidates.length === 0 ? (
              <div className="glass-card" style={styles.emptyCard}>
                No candidates found for the selected intent.
              </div>
            ) : null}
          </div>
        )}

        {selectedCandidate ? (
          <div style={styles.modalOverlay} onClick={() => setSelectedCandidate(null)}>
            <div style={styles.modalCard} onClick={(event) => event.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  {selectedCandidate.name || "Candidate Details"}
                </h2>
                <button
                  type="button"
                  style={styles.modalCloseBtn}
                  onClick={() => setSelectedCandidate(null)}
                >
                  ✕
                </button>
              </div>

              <div style={styles.modalBody}>
                <InfoRow
                  label="Allocated Company"
                  value={selectedCandidate.allocated_company_name}
                />
                <IntentRow intent={selectedCandidate.intent} />
                <DecisionRow
                  value={selectedCandidate.company_decision}
                  disabled={
                    savingDecisionFor === getDecisionKey(selectedCandidate)
                  }
                  onChange={(value) =>
                    handleDecisionChange(selectedCandidate, value)
                  }
                />
                <InfoRow label="Email" value={selectedCandidate.email} />
                <InfoRow label="Phone Number" value={selectedCandidate.phone} />
                <InfoRow label="Gender" value={selectedCandidate.gender} />
                <InfoRow label="Village" value={selectedCandidate.village} />
                <InfoRow label="Mandal" value={selectedCandidate.mandal} />
                <InfoRow label="District" value={selectedCandidate.district} />
                <InfoRow
                  label="Education Qualification"
                  value={selectedCandidate.education_qualification}
                />
              </div>
            </div>
          </div>
        ) : null}
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

function IntentRow({ intent }: { intent: CandidateIntent }) {
  const variant =
    intent === "Will Attend"
      ? styles.intentBadgeAttend
      : intent === "Not Interested"
      ? styles.intentBadgeNotInterested
      : styles.intentBadgePending;

  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>Intent</span>
      <span style={{ ...styles.intentBadgeBase, ...variant }}>{intent}</span>
    </div>
  );
}

function DecisionRow({
  value,
  disabled,
  onChange,
}: {
  value: CompanyDecision | null;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>Company Decision</span>
      <select
        className="input-field"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        style={styles.decisionSelect}
      >
        <option value="">Select</option>
        <option value="No Show">No Show</option>
        <option value="Not Selected">Not Selected</option>
        <option value="Selected">Selected</option>
      </select>
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
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  headerActions: {
    display: "flex",
    gap: "10px",
    flexShrink: 0,
  },
  logoutBtn: {
    minWidth: "110px",
  },
  filterBar: {
    marginBottom: "18px",
    padding: "4px 0 10px 0",
  },
  filterBarInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    width: "100%",
  },
  filterLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    flex: "1 1 auto",
    minWidth: 0,
  },
  filterCount: {
    fontSize: "0.95rem",
    fontWeight: 800,
    color: "#001A3D",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },
  filterLabel: {
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
  filterButtonsWrap: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  filterBtn: {
    borderRadius: "999px",
    padding: "8px 14px",
    fontSize: "0.85rem",
    fontWeight: 700,
    border: "1px solid transparent",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  filterBtnInactive: {
    background: "#ffffff",
    color: "#475569",
    borderColor: "rgba(100,116,139,0.25)",
  },
  filterBtnActive: {
    background: "#001A3D",
    color: "#ffffff",
    borderColor: "#001A3D",
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
  intentBadgeBase: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "fit-content",
    fontSize: "0.8rem",
    fontWeight: 800,
    letterSpacing: "0.02em",
    padding: "5px 12px",
    borderRadius: "999px",
    border: "1px solid transparent",
  },
  intentBadgePending: {
    color: "#334155",
    background: "rgba(100, 116, 139, 0.16)",
    borderColor: "rgba(100, 116, 139, 0.24)",
  },
  intentBadgeNotInterested: {
    color: "#b91c1c",
    background: "rgba(248, 113, 113, 0.16)",
    borderColor: "rgba(248, 113, 113, 0.35)",
  },
  intentBadgeAttend: {
    color: "#047857",
    background: "rgba(52, 211, 153, 0.18)",
    borderColor: "rgba(16, 185, 129, 0.35)",
  },
  viewMoreBtn: {
    marginTop: "2px",
    width: "fit-content",
    borderRadius: "999px",
    padding: "8px 14px",
    border: "1px solid rgba(0,26,61,0.2)",
    background: "#ffffff",
    color: "#001A3D",
    fontSize: "0.82rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  decisionSelect: {
    width: "100%",
    maxWidth: "220px",
    padding: "8px 10px",
    borderRadius: "10px",
    fontSize: "0.88rem",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(2, 6, 23, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000,
  },
  modalCard: {
    width: "100%",
    maxWidth: "520px",
    maxHeight: "85vh",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid rgba(0,26,61,0.12)",
    boxShadow: "0 20px 50px rgba(2,6,23,0.25)",
    padding: "18px",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "10px",
    paddingBottom: "10px",
    borderBottom: "1px solid rgba(0,26,61,0.08)",
  },
  modalTitle: {
    fontSize: "1.25rem",
    margin: 0,
    color: "#001A3D",
  },
  modalCloseBtn: {
    border: "none",
    background: "transparent",
    fontSize: "1.1rem",
    cursor: "pointer",
    color: "#334155",
    width: "32px",
    height: "32px",
    borderRadius: "999px",
  },
  modalBody: {
    display: "grid",
    gap: "10px",
  },
  emptyCard: {
    gridColumn: "1 / -1",
    padding: "28px",
    textAlign: "center" as const,
    color: "#64748b",
    fontWeight: 600,
  },
};
