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
import ApplyWizzFooter from "@/app/components/ApplyWizzFooter";

export default function HrCandidatesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<HrAllocatedCandidatePreview[]>([]);
  const [intentFilter, setIntentFilter] = useState<"All" | CandidateIntent>("All");
  const [selectedCandidate, setSelectedCandidate] =
    useState<HrAllocatedCandidatePreview | null>(null);
  const [savingDecisionFor, setSavingDecisionFor] = useState<string | null>(null);
  const [decisionFilter, setDecisionFilter] = useState<
    "All" | "No Show" | "Not Selected" | "Selected"
  >("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

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

  const filteredCandidates = candidates.filter((candidate) => {
    const intentMatches = intentFilter === "All" || candidate.intent === intentFilter;
    const decisionMatches =
      decisionFilter === "All" || candidate.company_decision === decisionFilter;
    const query = searchQuery.trim().toLowerCase();
    const searchMatches =
      !query ||
      candidate.id.toLowerCase().includes(query) ||
      (candidate.name || "").toLowerCase().includes(query);
    return intentMatches && decisionMatches && searchMatches;
  });
  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedCandidates = filteredCandidates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const companyName =
    (candidates[0]?.allocated_company_name || "").trim() || "Your Company";
  const pendingCount = filteredCandidates.filter(
    (candidate) => !candidate.company_decision
  ).length;
  const selectedCount = filteredCandidates.filter(
    (candidate) => candidate.company_decision === "Selected"
  ).length;
  const rejectedCount = filteredCandidates.filter(
    (candidate) => candidate.company_decision === "Not Selected"
  ).length;

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
            <h1 style={styles.title}>Company Dashboard: {companyName}</h1>
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

        <section style={styles.summaryRow}>
          <div className="stat-card blue" style={styles.summaryCard}>
            <div className="stat-value">{filteredCandidates.length}</div>
            <div className="stat-label">Visible Candidates</div>
          </div>
          <div className="stat-card teal" style={styles.summaryCard}>
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Pending Decision</div>
          </div>
          <div className="stat-card green" style={styles.summaryCard}>
            <div className="stat-value">{selectedCount}</div>
            <div className="stat-label">Selected</div>
          </div>
          <div className="stat-card purple" style={styles.summaryCard}>
            <div className="stat-value">{rejectedCount}</div>
            <div className="stat-label">Not Selected</div>
          </div>
        </section>

        <section style={styles.filterBar}>
          <div style={styles.filterBarInner}>
            <div style={styles.filterLeft}>
              <span style={styles.filterLabel}>Filters</span>
              <div style={styles.filterButtonsWrap}>
                {(["All", "Pending", "Not Interested", "Will Attend"] as const).map(
                  (option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setIntentFilter(option);
                        setPage(1);
                      }}
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
                {(["No Show", "Not Selected", "Selected"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setDecisionFilter((prev) => {
                        setPage(1);
                        return prev === option ? "All" : option;
                      })
                    }
                    style={{
                      ...styles.filterBtn,
                      ...(decisionFilter === option
                        ? styles.filterBtnActive
                        : styles.filterBtnInactive),
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            {!loading ? (
              <span style={styles.filterCount}>
                {filteredCandidates.length}{" "}
                {filteredCandidates.length === 1 ? "candidate" : "candidates"}
              </span>
            ) : null}
            <div style={styles.viewToggle}>
              <div style={styles.searchWrap}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Search CID or Name..."
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setPage(1);
                  }}
                  style={styles.searchInput}
                />
                {searchQuery.trim() ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setPage(1);
                    }}
                    style={styles.clearSearchBtn}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                style={{
                  ...styles.filterBtn,
                  ...(viewMode === "grid" ? styles.filterBtnActive : styles.filterBtnInactive),
                }}
              >
                Grid View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                style={{
                  ...styles.filterBtn,
                  ...(viewMode === "table" ? styles.filterBtnActive : styles.filterBtnInactive),
                }}
              >
                Table View
              </button>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="glass-card" style={styles.loadingCard}>
            Loading candidates...
          </div>
        ) : (
          viewMode === "grid" ? (
            <div style={styles.grid}>
              {pagedCandidates.map((candidate) => (
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

              {pagedCandidates.length === 0 ? (
                <div className="glass-card" style={styles.emptyCard}>
                  No candidates found for selected filters.
                </div>
              ) : null}
            </div>
          ) : (
            <div className="glass-card" style={styles.tableWrap}>
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={styles.th}>CID</th>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Intent</th>
                      <th style={styles.th}>Decision</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedCandidates.map((candidate) => (
                      <tr key={`${candidate.id}-${candidate.allocated_company_name}`} style={styles.tableRow}>
                        <td style={styles.td}>{candidate.id}</td>
                        <td style={styles.td}>{candidate.name || "-"}</td>
                        <td style={styles.td}>
                          <IntentRow intent={candidate.intent} />
                        </td>
                        <td style={styles.td}>
                          <DecisionRow
                            value={candidate.company_decision}
                            disabled={savingDecisionFor === getDecisionKey(candidate)}
                            onChange={(value) => handleDecisionChange(candidate, value)}
                          />
                        </td>
                        <td style={styles.td}>
                          <button
                            type="button"
                            onClick={() => setSelectedCandidate(candidate)}
                            style={styles.viewMoreBtn}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {filteredCandidates.length > 0 ? (
          <div style={styles.paginationWrap}>
            <button
              className="btn-secondary"
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={styles.paginationBtn}
            >
              Previous
            </button>
            <span style={styles.paginationText}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn-secondary"
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={styles.paginationBtn}
            >
              Next
            </button>
          </div>
        ) : null}

        <ApplyWizzFooter />

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
  const decisionStyle =
    value === "Selected"
      ? styles.decisionSelected
      : value === "Not Selected"
      ? styles.decisionNotSelected
      : value === "No Show"
      ? styles.decisionNoShow
      : undefined;

  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>Company Decision</span>
      <select
        className="input-field"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        style={{ ...styles.decisionSelect, ...decisionStyle }}
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
    padding: "28px 20px",
    background:
      "radial-gradient(circle at top right, rgba(0,26,61,0.05), transparent 40%), #f8faff",
  },
  main: {
    maxWidth: "1280px",
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
    padding: "14px",
    borderRadius: "14px",
    background: "#ffffff",
    border: "1px solid rgba(0,26,61,0.08)",
    boxShadow: "0 8px 22px rgba(2,6,23,0.06)",
  },
  summaryRow: {
    marginBottom: "14px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
  },
  summaryCard: {
    padding: "14px 16px",
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
  viewToggle: {
    display: "flex",
    gap: "8px",
    marginLeft: "auto",
    flexWrap: "nowrap",
    alignItems: "center",
    minWidth: 0,
  },
  searchWrap: {
    position: "relative",
    flex: "1 1 280px",
    minWidth: "220px",
  },
  searchInput: {
    width: "100%",
    padding: "8px 12px",
    paddingRight: "34px",
    borderRadius: "999px",
    fontSize: "0.85rem",
  },
  clearSearchBtn: {
    position: "absolute",
    right: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "22px",
    height: "22px",
    borderRadius: "999px",
    border: "none",
    background: "rgba(100,116,139,0.15)",
    color: "#334155",
    fontSize: "0.75rem",
    fontWeight: 700,
    cursor: "pointer",
    lineHeight: 1,
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
  decisionSelected: {
    borderColor: "rgba(16,185,129,0.45)",
    color: "#047857",
    background: "rgba(16,185,129,0.08)",
  },
  decisionNotSelected: {
    borderColor: "rgba(239,68,68,0.45)",
    color: "#b91c1c",
    background: "rgba(239,68,68,0.08)",
  },
  decisionNoShow: {
    borderColor: "rgba(251,146,60,0.45)",
    color: "#c2410c",
    background: "rgba(251,146,60,0.08)",
  },
  tableWrap: {
    padding: "10px",
    border: "1px solid rgba(0,26,61,0.08)",
    borderRadius: "16px",
    background: "#ffffff",
    boxShadow: "0 8px 24px rgba(2,6,23,0.06)",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "780px",
  },
  tableHeader: {
    borderBottom: "1px solid rgba(0,26,61,0.12)",
  },
  th: {
    textAlign: "left",
    padding: "12px 14px",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#64748b",
    fontWeight: 700,
  },
  tableRow: {
    borderBottom: "1px solid rgba(0,26,61,0.07)",
  },
  td: {
    padding: "12px 14px",
    color: "#0f172a",
    verticalAlign: "top",
  },
  paginationWrap: {
    marginTop: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "10px",
    flexWrap: "wrap",
  },
  paginationBtn: {
    minWidth: "96px",
    padding: "8px 14px",
  },
  paginationText: {
    fontSize: "0.9rem",
    color: "#475569",
    fontWeight: 700,
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
