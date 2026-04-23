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

  const [candidates, setCandidates] = useState<CandidateWithApplications[] | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithApplications | null>(null);
  const [intel, setIntel] = useState<IntelligenceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!cidParam) return;
    (async () => {
      setLoading(true);
      const data = await getCandidateById(cidParam);
      if (!data || data.length === 0) {
        setError(`No candidate found for "${cidParam}".`);
      } else {
        setCandidates(data);
        if (data.length === 1) {
          setSelectedCandidate(data[0]);
          setIntel(computeIntelligence(data[0].applications));
        }
      }
      setLoading(false);
    })();
  }, [cidParam]);

  const handleSelect = (c: CandidateWithApplications) => {
    setSelectedCandidate(c);
    setIntel(computeIntelligence(c.applications));
  };

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

  if (error || !candidates) {
    return (
      <div style={S.page}>
        <div style={S.container}>
          <div style={S.errorCard}>
            <span style={{ fontSize: "3rem" }}>🔍</span>
            <h2 style={{ marginBottom: 8 }}>{error || "Candidate not found"}</h2>
            <p style={{ color: "#94a3b8", marginBottom: 20 }}>
              Please check the ID or Phone and try again.
            </p>
            <button className="btn-primary" onClick={() => router.push("/")}>
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Selection Screen ──────────────────────────────────── */
  if (!selectedCandidate && candidates.length > 1) {
    return (
      <div style={S.page}>
        <div style={S.container}>
          <header style={S.header}>
            <button className="btn-ghost" onClick={() => router.push("/")} style={S.backBtn}>← Home</button>
            <h1 style={S.name}>Multiple Candidates Found</h1>
            <p style={S.email}>Choose the candidate associated with phone {cidParam}:</p>
          </header>
          <div style={S.appList}>
            {candidates.map((c, i) => (
              <div 
                key={c.id} 
                className="glass-card animate-fade-in-up" 
                style={{ ...S.appCard, cursor: "pointer", animationDelay: `${i * 0.1}s` }}
                onClick={() => handleSelect(c)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={S.appRole}>{c.name}</h3>
                    <p style={S.appCompany}>Father: {c.father_name || 'N/A'} • Village: {c.village || 'N/A'}</p>
                  </div>
                  <span style={S.cidBadge}>{c.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Dashboard (for selected candidate) ─────────────────── */
  if (!selectedCandidate || !intel) return null;

  return (
    <div style={S.page}>
      <div style={S.container}>
        {/* Header */}
        <header style={S.header}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button className="btn-ghost" onClick={() => candidates.length > 1 ? setSelectedCandidate(null) : router.push("/")} style={S.backBtn}>
              {candidates.length > 1 ? "← Back to List" : "← Home"}
            </button>
          </div>
          <div style={S.headerInfo}>
            <div style={S.avatar}>
              {selectedCandidate.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={S.name}>{selectedCandidate.name}</h1>
              <div style={S.cidRow}>
                <span style={S.cidBadge}>{selectedCandidate.id}</span>
                <span style={S.email}>{selectedCandidate.email}</span>
                {selectedCandidate.phone && <span style={S.email}>📞 {selectedCandidate.phone}</span>}
              </div>
            </div>
          </div>
        </header>

        {/* Detailed Profile Card */}
        <div className="glass-card animate-fade-in-up" style={S.profileCard}>
          <h3 style={S.profileTitle}>📋 Detailed Profile</h3>
          <div style={S.profileGrid}>
            <ProfileItem label="Father's Name" value={selectedCandidate.father_name} />
            <ProfileItem label="Gender / Age" value={`${selectedCandidate.gender || '-'} / ${selectedCandidate.age || '-'}`} />
            <ProfileItem label="Aadhar Number" value={selectedCandidate.aadhar_number} />
            <ProfileItem label="PS Jurisdiction" value={selectedCandidate.ps_jurisdiction} />
            <ProfileItem label="Education" value={selectedCandidate.education_qualification} />
            <ProfileItem label="Village" value={selectedCandidate.village} />
            <ProfileItem label="Mandal" value={selectedCandidate.mandal} />
            <ProfileItem label="District" value={selectedCandidate.district} />
            <ProfileItem label="Languages" value={selectedCandidate.languages} />
            <ProfileItem label="Driving License" value={selectedCandidate.driving_license} />
            <ProfileItem label="Experience" value={selectedCandidate.experience} />
            <ProfileItem label="Preferred Location" value={selectedCandidate.preferred_location} />
            <ProfileItem label="Preferred Sector" value={selectedCandidate.preferred_sector} />
          </div>
          {selectedCandidate.remarks && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={S.detailLabel}>Remarks</span>
              <p style={{ fontSize: "0.9rem", color: "#94a3b8", marginTop: 4 }}>{selectedCandidate.remarks}</p>
            </div>
          )}
        </div>

        {/* Applications List */}
        <section style={S.section}>
          <h2 className="section-title">Job Applications</h2>
          <div style={S.appList}>
            {selectedCandidate.applications.map((app, i) => (
              <ApplicationCard key={app.id} app={app} index={i} />
            ))}
            {selectedCandidate.applications.length === 0 && (
              <div className="glass-card" style={{ padding: "30px", textAlign: "center", color: "#64748b", border: "1px dashed rgba(255,255,255,0.1)" }}>
                No active job applications found.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ProfileItem({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div style={S.appDetail}>
      <span style={S.detailLabel}>{label}</span>
      <span style={S.detailValue}>{value}</span>
    </div>
  );
}

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

function ApplicationCard({ app, index }: { app: Application; index: number }) {
  const level = matchLevel(app.match_percent);
  return (
    <div className="glass-card animate-fade-in-up" style={{ ...S.appCard, animationDelay: `${index * 0.06}s` }}>
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
            <span className="match-value">{app.match_percent}%</span>
          </div>
        </div>
        <div style={S.appDetail}>
          <span style={S.detailLabel}>Success</span>
          <span style={S.detailValue}>{app.success_probability}%</span>
        </div>
      </div>
      {app.next_step && (
        <div style={S.nextStep}>
          <span style={S.nextStepIcon}>→</span>
          <span style={S.nextStepText}>{app.next_step}</span>
        </div>
      )}
    </div>
  );
}

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
  avatar: { width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #2dd4a8, #4f8cff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 800, color: "#06080f" },
  name: { fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em" },
  cidRow: { display: "flex", alignItems: "center", gap: 12, marginTop: 4, flexWrap: "wrap" },
  cidBadge: { padding: "2px 10px", background: "rgba(45,212,168,0.1)", border: "1px solid rgba(45,212,168,0.25)", borderRadius: 9999, fontSize: "0.75rem", fontWeight: 700, color: "#2dd4a8", fontFamily: "'JetBrains Mono', monospace" },
  email: { fontSize: "0.85rem", color: "#64748b" },
  profileCard: { padding: "24px", marginTop: 4 },
  profileTitle: { fontSize: "1.1rem", fontWeight: 700, marginBottom: 20, color: "#2dd4a8" },
  profileGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" },
  priorityCard: { padding: "16px 20px" },
  section: { marginTop: 8 },
  appList: { display: "flex", flexDirection: "column", gap: 12 },
  appCard: { padding: "20px 24px", opacity: 1 },
  appHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 16 },
  appRole: { fontSize: "1.05rem", fontWeight: 700, marginBottom: 2 },
  appCompany: { fontSize: "0.9rem", color: "#94a3b8" },
  appDetails: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px 20px", marginBottom: 14 },
  appDetail: { display: "flex", flexDirection: "column", gap: 4 },
  detailLabel: { fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 },
  detailValue: { fontSize: "0.9rem", color: "#f1f5f9" },
  nextStep: { display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(79, 140, 255, 0.06)", borderRadius: 8, marginBottom: 8 },
  nextStepIcon: { color: "#4f8cff", fontWeight: 700 },
  nextStepText: { fontSize: "0.85rem", color: "#94a3b8" },
};
