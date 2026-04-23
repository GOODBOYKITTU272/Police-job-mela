"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminStats, getAllCandidates, Candidate } from "@/lib/supabase";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [s, c] = await Promise.all([getAdminStats(), getAllCandidates()]);
      setStats(s);
      setCandidates(c);
      setLoading(false);
    })();
  }, []);

  const filteredCandidates = candidates.filter(
    (c) =>
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={S.page}>
        <div style={S.container}>
          <div style={{ textAlign: "center", padding: "120px 0" }}>
            <div style={{ fontSize: "3rem", color: "#4f8cff", animation: "pulse 1.5s infinite" }}>◆</div>
            <p style={{ color: "#94a3b8", marginTop: 16 }}>Loading admin dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.container}>
        <header style={S.header} className="animate-fade-in-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Udyogh Mitra Admin</h1>
              <p style={{ color: "#94a3b8" }}>Siddipet Police Recruitment Overview</p>
            </div>
            <button className="btn-secondary" onClick={() => router.push("/")}>
              ← Back to Portal
            </button>
          </div>
        </header>

        {stats && (
          <div className="grid-4 animate-fade-in-up stagger-1" style={{ marginBottom: 32 }}>
            <div className="stat-card blue">
              <span style={{ fontSize: "1.5rem" }}>👥</span>
              <div>
                <div className="stat-value">{stats.totalCandidates}</div>
                <div className="stat-label">Total Candidates</div>
              </div>
            </div>
            <div className="stat-card teal">
              <span style={{ fontSize: "1.5rem" }}>📄</span>
              <div>
                <div className="stat-value">{stats.totalApplications}</div>
                <div className="stat-label">Total Applications</div>
              </div>
            </div>
            <div className="stat-card amber">
              <span style={{ fontSize: "1.5rem" }}>🚦</span>
              <div>
                <div className="stat-value">{stats.multiPipeline}</div>
                <div className="stat-label">Multi-Pipeline</div>
              </div>
            </div>
            <div className="stat-card purple">
              <span style={{ fontSize: "1.5rem" }}>📅</span>
              <div>
                <div className="stat-value">{stats.statusBreakdown["Interview Scheduled"] || 0}</div>
                <div className="stat-label">Interviews</div>
              </div>
            </div>
          </div>
        )}

        <section className="animate-fade-in-up stagger-2">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 className="section-title" style={{ margin: 0 }}>Candidate Directory</h2>
            <input
              type="text"
              className="input-field"
              placeholder="Search by Name, CID, or Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 300, padding: "10px 16px" }}
            />
          </div>

          <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>CID</th>
                  <th style={S.th}>Name</th>
                  <th style={S.th}>Email</th>
                  <th style={S.th}>Joined</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((c) => (
                  <tr key={c.id} style={S.tr}>
                    <td style={{ ...S.td, fontFamily: "'JetBrains Mono', monospace", color: "#2dd4a8" }}>{c.id}</td>
                    <td style={{ ...S.td, fontWeight: 600 }}>{c.name}</td>
                    <td style={S.td}>{c.email}</td>
                    <td style={S.td}>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>
                      <button
                        className="btn-ghost"
                        onClick={() => router.push(`/candidate/${c.id}`)}
                      >
                        View Dashboard →
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCandidates.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#64748b" }}>
                      No candidates found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", padding: "32px 16px" },
  container: { maxWidth: 1080, margin: "0 auto" },
  header: { marginBottom: 32 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "16px 20px", textAlign: "left" as const, color: "#94a3b8", fontSize: "0.8rem", textTransform: "uppercase" as const, borderBottom: "1px solid rgba(255,255,255,0.06)" },
  td: { padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  tr: { transition: "background 0.2s" },
};
