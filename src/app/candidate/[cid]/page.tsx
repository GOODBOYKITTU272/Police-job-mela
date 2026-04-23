"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getCandidateById,
  computeIntelligence,
  CandidateWithApplications,
  Application,
  IntelligenceSummary,
} from "@/lib/supabase";

/* ── Status → Badge class ─────────────────────────────────── */
function badgeClass(status: string): string {
  const map: Record<string, string> = {
    Applied: "badge badge-applied",
    Shortlisted: "badge badge-shortlisted",
    "Interview Scheduled": "badge badge-interview",
    Rejected: "badge badge-rejected",
    Offer: "badge badge-offer",
    Matched: "badge badge-matched",
    "Under Review": "badge badge-review",
  };
  return map[status] || "badge badge-review";
}

/* ── Match color ──────────────────────────────────────────── */
function matchLevel(pct: number): string {
  if (pct >= 75) return "high";
  if (pct >= 50) return "medium";
  return "low";
}

/* ── Main Component ───────────────────────────────────────── */
export default function CandidateDashboard() {
  const params = useParams();
  const router = useRouter();
  const cidParam = (params.cid as string)?.toUpperCase();

  const [candidate, setCandidate] = useState<CandidateWithApplications | null>(null);
  const [intel, setIntel] = useState<IntelligenceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!cidParam) return;
    (async () => {
      setLoading(true);
      const data = await getCandidateById(cidParam);
      if (!data) {
        setError(`Candidate ${cidParam} not found.`);
      } else {
        setCandidate(data);
        setIntel(computeIntelligence(data.applications));
      }
      setLoading(false);
    })();
  }, [cidParam]);

  /* ── Loading ────────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={S.page}>
        <div style={S.container}>
          <div style={S.loadingWrap}>
            <div style={S.loadingPulse}>◆</div>
            <p style={S.loadingText}>Loading candidate data…</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Not Found ──────────────────────────────────────────── */
  if (error || !candidate || !intel) {
    return (
      <div style={S.page}>
        <div style={S.container}>
          <div style={S.errorCard}>
            <span style={{ fontSize: "3rem" }}>🔍</span>
            <h2 style={{ marginBottom: 8 }}>{error || "Candidate not found"}</h2>
            <p style={{ color: "#94a3b8", marginBottom: 20 }}>
              Please check the Candidate ID and try again.
            </p>
            <button className="btn-primary" onClick={() => router.push("/")}>
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Dashboard ──────────────────────────────────────────── */
  return (
    <div style={S.page}>
      <div style={S.container}>
        {/* Header */}
        <header style={S.header} className="animate-fade-in-up">
          <button className="btn-ghost" onClick={() => router.push("/")} style={S.backBtn}>
            ← Home
          </button>
          <div style={S.headerInfo}>
            <div style={S.avatar}>
              {candidate.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={S.name}>{candidate.name}</h1>
              <div style={S.cidRow}>
                <span style={S.cidBadge}>{candidate.id}</span>
                <span style={S.email}>{candidate.email}</span>
                {candidate.phone && <span style={S.email}>📞 {candidate.phone}</span>}
              </div>
            </div>
          </div>
        </header>

        {/* Priority Suggestion */}
        <div className="alert-card info animate-fade-in-up stagger-1" style={S.priorityCard}>
          <span style={{ fontSize: "1.3rem" }}>🎯</span>
          <div>
            <strong style={{ display: "block", marginBottom: 2 }}>Priority Suggestion</strong>
            <span style={{ color: "#94a3b8", fontSize: "0.95rem" }}>{intel.prioritySuggestion}</span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid-4 animate-fade-in-up stagger-2">
          <StatCard label="Total Applied" value={intel.totalApplied} color="teal" icon="📋" />
          <StatCard label="Active" value={intel.activeProcesses} color="blue" icon="⚡" />
          <StatCard label="Interviews" value={intel.interviewsScheduled} color="purple" icon="📅" />
          <StatCard label="Rejections" value={intel.rejections} color="red" icon="✕" />
        </div>

        {/* Interview Conflicts */}
        {intel.interviewConflicts.length > 0 && (
          <div className="alert-card warning animate-fade-in-up stagger-3" style={{ marginTop: 4 }}>
            <span style={{ fontSize: "1.3rem" }}>⚠️</span>
            <div>
              <strong>Interview Conflict Detected!</strong>
              <p style={{ fontSize: "0.9rem", color: "#94a3b8", marginTop: 4 }}>
                You have multiple interviews scheduled on the same day:
              </p>
              {intel.interviewConflicts.map((group, gi) => (
                <div key={gi} style={{ marginTop: 8 }}>
                  {group.map((a) => (
                    <div key={a.id} style={{ fontSize: "0.85rem" }}>
                      • {a.company_name} — {a.role} ({new Date(a.interview_date!).toLocaleDateString()})
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applications List */}
        <section style={S.section}>
          <h2 className="section-title">All Applications</h2>
          <div style={S.appList}>
            {candidate.applications.map((app, i) => (
              <ApplicationCard key={app.id} app={app} index={i} />
            ))}
          </div>
        </section>

        {/* Success Predictions */}
        {intel.successPredictions.length > 0 && (
          <section style={S.section}>
            <h2 className="section-title">Success Predictions</h2>
            <div className="glass-card" style={S.predictCard}>
              {intel.successPredictions.slice(0, 5).map(({ application, probability }) => (
                <div key={application.id} style={S.predictRow}>
                  <div style={S.predictInfo}>
                    <strong>{application.role}</strong>
                    <span style={S.predictCompany}>{application.company_name}</span>
                  </div>
                  <div style={S.predictRight}>
                    <div className="match-meter">
                      <div className="match-bar" style={{ width: 120 }}>
                        <div
                          className={`match-fill ${matchLevel(probability)}`}
                          style={{ width: `${probability}%` }}
                        />
                      </div>
                      <span className="match-value" style={{ color: probability >= 50 ? "#2dd4a8" : probability >= 30 ? "#f59e0b" : "#ef4444" }}>
                        {probability}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* ── Stat Card Component ──────────────────────────────────── */
function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div className={`stat-card ${color}`}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: "1.3rem" }}>{icon}</span>
        <div>
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      </div>
    </div>
  );
}

/* ── Application Card Component ───────────────────────────── */
function ApplicationCard({ app, index }: { app: Application; index: number }) {
  const level = matchLevel(app.match_percent);

  return (
    <div
      className="glass-card animate-fade-in-up"
      style={{ ...S.appCard, animationDelay: `${index * 0.06}s` }}
    >
      <div style={S.appHeader}>
        <div>
          <h3 style={S.appRole}>{app.role}</h3>
          <p style={S.appCompany}>{app.company_name}</p>
        </div>
        <span className={badgeClass(app.status)}>{app.status}</span>
      </div>

      <div style={S.appDetails}>
        <div style={S.appDetail}>
          <span style={S.detailLabel}>Category</span>
          <span style={S.detailValue}>{app.category}</span>
        </div>
        <div style={S.appDetail}>
          <span style={S.detailLabel}>Match</span>
          <div className="match-meter">
            <div className="match-bar" style={{ width: 80 }}>
              <div className={`match-fill ${level}`} style={{ width: `${app.match_percent}%` }} />
            </div>
            <span className="match-value" style={{ color: level === "high" ? "#2dd4a8" : level === "medium" ? "#f59e0b" : "#ef4444" }}>
              {app.match_percent}%
            </span>
          </div>
        </div>
        <div style={S.appDetail}>
          <span style={S.detailLabel}>Success</span>
          <span style={{ ...S.detailValue, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
            {app.success_probability}%
          </span>
        </div>
        {app.interview_date && (
          <div style={S.appDetail}>
            <span style={S.detailLabel}>Interview</span>
            <span style={S.detailValue}>
              📅 {new Date(app.interview_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        )}
      </div>

      {app.next_step && (
        <div style={S.nextStep}>
          <span style={S.nextStepIcon}>→</span>
          <span style={S.nextStepText}>{app.next_step}</span>
        </div>
      )}

      {app.reason && (
        <p style={S.reason}>{app.reason}</p>
      )}
    </div>
  );
}

/* ── Styles ────────────────────────────────────────────────── */
const S: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", padding: "32px 16px" },
  container: { maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 },

  loadingWrap: { textAlign: "center", padding: "120px 0" },
  loadingPulse: { fontSize: "3rem", color: "#2dd4a8", animation: "pulse 1.5s infinite" },
  loadingText: { color: "#94a3b8", marginTop: 16 },

  errorCard: { textAlign: "center", padding: "80px 0" },

  header: { display: "flex", flexDirection: "column", gap: 16 },
  backBtn: { alignSelf: "flex-start" },
  headerInfo: { display: "flex", alignItems: "center", gap: 16 },
  avatar: {
    width: 56, height: 56, borderRadius: "50%",
    background: "linear-gradient(135deg, #2dd4a8, #4f8cff)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.5rem", fontWeight: 800, color: "#06080f",
  },
  name: { fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em" },
  cidRow: { display: "flex", alignItems: "center", gap: 12, marginTop: 4, flexWrap: "wrap" },
  cidBadge: {
    padding: "2px 10px", background: "rgba(45,212,168,0.1)", border: "1px solid rgba(45,212,168,0.25)",
    borderRadius: 9999, fontSize: "0.75rem", fontWeight: 700, color: "#2dd4a8",
    fontFamily: "'JetBrains Mono', monospace",
  },
  email: { fontSize: "0.85rem", color: "#64748b" },

  priorityCard: { padding: "16px 20px" },

  section: { marginTop: 8 },
  appList: { display: "flex", flexDirection: "column", gap: 12 },
  appCard: { padding: "20px 24px", opacity: 0 },
  appHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 16 },
  appRole: { fontSize: "1.05rem", fontWeight: 700, marginBottom: 2 },
  appCompany: { fontSize: "0.9rem", color: "#94a3b8" },
  appDetails: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px 20px", marginBottom: 14 },
  appDetail: { display: "flex", flexDirection: "column", gap: 4 },
  detailLabel: { fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 },
  detailValue: { fontSize: "0.9rem", color: "#f1f5f9" },

  nextStep: {
    display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
    background: "rgba(79, 140, 255, 0.06)", borderRadius: 8, marginBottom: 8,
  },
  nextStepIcon: { color: "#4f8cff", fontWeight: 700 },
  nextStepText: { fontSize: "0.85rem", color: "#94a3b8" },

  reason: { fontSize: "0.82rem", color: "#64748b", fontStyle: "italic", lineHeight: 1.5, marginTop: 4 },

  predictCard: { padding: "8px 0" },
  predictRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" },
  predictInfo: { display: "flex", flexDirection: "column" },
  predictCompany: { fontSize: "0.82rem", color: "#64748b" },
  predictRight: { display: "flex", alignItems: "center" },
};
