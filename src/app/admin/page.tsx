"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import {
  getAdminStats,
  getAllCandidates,
  getAllCompanies,
  Candidate,
  CompanyDirectoryRow,
} from "@/lib/supabase";

function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<{
    totalCandidates: number;
    totalApplications: number;
    statusBreakdown: Record<string, number>;
    categoryBreakdown: Record<string, number>;
    multiPipeline: number;
  } | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [companies, setCompanies] = useState<CompanyDirectoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [search, setSearch] = useState("");
  const [directoryView, setDirectoryView] = useState<"companies" | "candidates">(
    "companies"
  );
  const [companySort, setCompanySort] = useState<{
    key:
      | "company_name"
      | "sector"
      | "education"
      | "vacancy"
      | "assigned_count"
      | "no_show_count"
      | "not_selected_count"
      | "selected_count";
    direction: "asc" | "desc";
  }>({ key: "company_name", direction: "asc" });
  const [candidateSort, setCandidateSort] = useState<{
    key: "id" | "name" | "email" | "created_at";
    direction: "asc" | "desc";
  }>({ key: "created_at", direction: "desc" });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("admin-authenticated") === "true";
    if (!isAuthenticated) {
      router.replace("/admin/login");
      return;
    }

    (async () => {
      setLoading(true);
      const [s, c, companyRows] = await Promise.all([
        getAdminStats(),
        getAllCandidates(),
        getAllCompanies(),
      ]);
      setStats(s);
      setCandidates(c);
      setCompanies(companyRows);
      setLoading(false);
      setAuthChecked(true);
    })();
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("admin-authenticated");
    sessionStorage.removeItem("admin-email");
    router.push("/admin/login");
  };

  const filteredCandidates = candidates.filter(
    (c) =>
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCompanies = companies.filter((company) => {
    const query = search.toLowerCase();
    return (
      (company.company_name || "").toLowerCase().includes(query) ||
      (company.sector || "").toLowerCase().includes(query) ||
      (company.education || "").toLowerCase().includes(query) ||
      String(company.vacancy ?? "").includes(query) ||
      String(company.assigned_count ?? "").includes(query) ||
      String(company.no_show_count ?? "").includes(query) ||
      String(company.not_selected_count ?? "").includes(query) ||
      String(company.selected_count ?? "").includes(query)
    );
  });

  const activeRowsCount =
    directoryView === "companies" ? filteredCompanies.length : filteredCandidates.length;

  const sortedCompanies = useMemo(() => {
    const rows = [...filteredCompanies];
    rows.sort((a, b) => compareValues(a[companySort.key], b[companySort.key], companySort.direction));
    return rows;
  }, [filteredCompanies, companySort]);

  const sortedCandidates = useMemo(() => {
    const rows = [...filteredCandidates];
    rows.sort((a, b) => compareValues(a[candidateSort.key], b[candidateSort.key], candidateSort.direction));
    return rows;
  }, [filteredCandidates, candidateSort]);

  const totalPages = Math.max(1, Math.ceil(activeRowsCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedCandidates = sortedCandidates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const pagedCompanies = sortedCompanies.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getDecisionTotal = (key: "No Show" | "Not Selected" | "Selected") =>
    stats?.categoryBreakdown?.[key] ||
    stats?.categoryBreakdown?.[key.toLowerCase()] ||
    0;
  const pendingDecisionTotal =
    stats?.categoryBreakdown?.Pending ||
    stats?.categoryBreakdown?.pending ||
    0;

  const toggleCompanySort = (
    key:
      | "company_name"
      | "sector"
      | "education"
      | "vacancy"
      | "assigned_count"
      | "no_show_count"
      | "not_selected_count"
      | "selected_count"
  ) => {
    setCompanySort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };

  const toggleCandidateSort = (key: "id" | "name" | "email" | "created_at") => {
    setCandidateSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };

  if (!authChecked || loading) {
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
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-secondary" onClick={() => router.push("/")}>
                ← Back to Portal
              </button>
              <button className="btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </header>

        {stats && (
          <div className="animate-fade-in-up stagger-1" style={S.statsRow}>
            <div className="stat-card blue" style={S.statTile}>
              <span style={{ fontSize: "1.5rem" }}>👥</span>
              <div>
                <div className="stat-value">{stats.totalCandidates}</div>
                <div className="stat-label">Total Candidates</div>
              </div>
            </div>
            <div className="stat-card teal" style={S.statTile}>
              <span style={{ fontSize: "1.5rem" }}>❓</span>
              <div>
                <div className="stat-value">{pendingDecisionTotal}</div>
                <div className="stat-label">Pending</div>
              </div>
            </div>
            <div className="stat-card amber" style={S.statTile}>
              <span style={{ fontSize: "1.5rem" }}>🚫</span>
              <div>
                <div className="stat-value">{getDecisionTotal("No Show")}</div>
                <div className="stat-label">No Show</div>
              </div>
            </div>
            <div className="stat-card purple" style={S.statTile}>
              <span style={{ fontSize: "1.5rem" }}>❌</span>
              <div>
                <div className="stat-value">{getDecisionTotal("Not Selected")}</div>
                <div className="stat-label">Not Selected</div>
              </div>
            </div>
            <div className="stat-card green" style={S.statTile}>
              <span style={{ fontSize: "1.5rem" }}>✅</span>
              <div>
                <div className="stat-value">{getDecisionTotal("Selected")}</div>
                <div className="stat-label">Selected</div>
              </div>
            </div>
          </div>
        )}

        <section className="animate-fade-in-up stagger-2">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={S.directoryHeaderWrap}>
              <h2 className="section-title" style={{ margin: 0 }}>
                {directoryView === "companies"
                  ? "Company Directory"
                  : "Candidate Directory"}
              </h2>
              <div style={S.toggleWrap}>
                <button
                  type="button"
                  onClick={() => {
                    setDirectoryView("companies");
                    setPage(1);
                    setSearch("");
                  }}
                  style={{
                    ...S.toggleBtn,
                    ...(directoryView === "companies"
                      ? S.toggleBtnActive
                      : S.toggleBtnInactive),
                  }}
                >
                  Company Directory
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDirectoryView("candidates");
                    setPage(1);
                    setSearch("");
                  }}
                  style={{
                    ...S.toggleBtn,
                    ...(directoryView === "candidates"
                      ? S.toggleBtnActive
                      : S.toggleBtnInactive),
                  }}
                >
                  Candidate Directory
                </button>
              </div>
            </div>
            <input
              type="text"
              className="input-field"
              placeholder={
                directoryView === "companies"
                  ? "Search by Company, Sector, Education, Vacancy, or Counts..."
                  : "Search by Name, CID, or Email..."
              }
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ maxWidth: 300, padding: "10px 16px" }}
            />
          </div>

          <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
            <table style={S.table}>
              {directoryView === "companies" ? (
                <>
                  <thead>
                    <tr>
                      <th style={S.th}>
                        <button type="button" style={S.sortBtn} onClick={() => toggleCompanySort("company_name")}>
                          Company {getSortIndicator(companySort, "company_name")}
                        </button>
                      </th>
                      <th style={S.th}>
                        <button type="button" style={S.sortBtn} onClick={() => toggleCompanySort("sector")}>
                          Sector {getSortIndicator(companySort, "sector")}
                        </button>
                      </th>
                      <th style={S.th}>
                        <button type="button" style={S.sortBtn} onClick={() => toggleCompanySort("education")}>
                          Education {getSortIndicator(companySort, "education")}
                        </button>
                      </th>
                      <th style={S.th}>
                        <button type="button" style={S.sortBtn} onClick={() => toggleCompanySort("vacancy")}>
                          Vacancy {getSortIndicator(companySort, "vacancy")}
                        </button>
                      </th>
                      <th style={S.th}>
                        <button type="button" style={S.sortBtn} onClick={() => toggleCompanySort("assigned_count")}>
                          Assigned {getSortIndicator(companySort, "assigned_count")}
                        </button>
                      </th>
                      <th style={S.th}>
                        <button type="button" style={S.sortBtn} onClick={() => toggleCompanySort("no_show_count")}>
                          No Show {getSortIndicator(companySort, "no_show_count")}
                        </button>
                      </th>
                      <th style={S.th}>
                        <button type="button" style={S.sortBtn} onClick={() => toggleCompanySort("not_selected_count")}>
                          Not Selected {getSortIndicator(companySort, "not_selected_count")}
                        </button>
                      </th>
                      <th style={S.th}>
                        <button type="button" style={S.sortBtn} onClick={() => toggleCompanySort("selected_count")}>
                          Selected {getSortIndicator(companySort, "selected_count")}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedCompanies.map((company) => (
                      <tr key={company.company_name} style={S.tr}>
                        <td style={{ ...S.td, fontWeight: 700 }}>
                          {company.company_name || "-"}
                        </td>
                        <td style={S.td}>{company.sector || "-"}</td>
                        <td style={S.td}>{company.education || "-"}</td>
                        <td style={S.td}>{company.vacancy ?? "-"}</td>
                        <td style={S.td}>{company.assigned_count ?? "-"}</td>
                        <td style={S.td}>{company.no_show_count ?? 0}</td>
                        <td style={S.td}>{company.not_selected_count ?? 0}</td>
                        <td style={S.td}>{company.selected_count ?? 0}</td>
                      </tr>
                    ))}
                    {filteredCompanies.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          style={{ padding: 32, textAlign: "center", color: "#64748b" }}
                        >
                          No companies found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </>
              ) : (
                <>
                  <thead>
                    <tr>
                      <th style={S.th}>
                        <button type="button" style={S.sortBtn} onClick={() => toggleCandidateSort("id")}>
                          CID {getSortIndicator(candidateSort, "id")}
                        </button>
                      </th>
                      <th style={S.th}>
                        <button type="button" style={S.sortBtn} onClick={() => toggleCandidateSort("name")}>
                          Name {getSortIndicator(candidateSort, "name")}
                        </button>
                      </th>
                      <th style={S.th}>
                        <button type="button" style={S.sortBtn} onClick={() => toggleCandidateSort("email")}>
                          Email {getSortIndicator(candidateSort, "email")}
                        </button>
                      </th>
                      <th style={S.th}>
                        <button type="button" style={S.sortBtn} onClick={() => toggleCandidateSort("created_at")}>
                          Joined {getSortIndicator(candidateSort, "created_at")}
                        </button>
                      </th>
                      <th style={{ ...S.th, textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedCandidates.map((c) => (
                      <tr key={c.id} style={S.tr}>
                        <td
                          style={{
                            ...S.td,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "#2dd4a8",
                          }}
                        >
                          {c.id}
                        </td>
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
                        <td
                          colSpan={5}
                          style={{ padding: 32, textAlign: "center", color: "#64748b" }}
                        >
                          No candidates found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </>
              )}
            </table>
          </div>

          {activeRowsCount > 0 && (
            <div style={S.paginationWrap}>
              <button
                className="btn-secondary"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={S.paginationBtn}
              >
                Previous
              </button>
              <span style={S.paginationText}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn-secondary"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={S.paginationBtn}
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", padding: "32px 16px" },
  container: { maxWidth: 1080, margin: "0 auto" },
  header: { marginBottom: 32 },
  directoryHeaderWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  toggleWrap: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  toggleBtn: {
    borderRadius: "999px",
    padding: "7px 14px",
    fontSize: "0.8rem",
    fontWeight: 700,
    border: "1px solid transparent",
    cursor: "pointer",
  },
  toggleBtnInactive: {
    background: "#ffffff",
    color: "#475569",
    borderColor: "rgba(100,116,139,0.25)",
  },
  toggleBtnActive: {
    background: "#001A3D",
    color: "#ffffff",
    borderColor: "#001A3D",
  },
  statsRow: {
    marginBottom: 32,
    display: "flex",
    gap: 16,
    flexWrap: "nowrap",
    width: "100%",
  },
  statTile: {
    flex: "1 1 0",
    minWidth: 0,
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "16px 20px", textAlign: "left" as const, color: "#94a3b8", fontSize: "0.8rem", textTransform: "uppercase" as const, borderBottom: "1px solid rgba(255,255,255,0.06)" },
  sortBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "inherit",
    font: "inherit",
    textTransform: "inherit",
    letterSpacing: "inherit",
    padding: 0,
  },
  td: { padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  tr: { transition: "background 0.2s" },
  paginationWrap: {
    marginTop: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },
  paginationBtn: {
    padding: "8px 14px",
    minWidth: "96px",
  },
  paginationText: {
    fontSize: "0.9rem",
    color: "#64748b",
    fontWeight: 600,
  },
};

function compareValues(
  a: string | number | null | undefined,
  b: string | number | null | undefined,
  direction: "asc" | "desc"
): number {
  const aValue = normalizeSortValue(a);
  const bValue = normalizeSortValue(b);

  if (aValue < bValue) return direction === "asc" ? -1 : 1;
  if (aValue > bValue) return direction === "asc" ? 1 : -1;
  return 0;
}

function normalizeSortValue(value: string | number | null | undefined): string | number {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return value;

  const asDate = Date.parse(value);
  if (!Number.isNaN(asDate) && /\d{4}-\d{2}-\d{2}/.test(value)) {
    return asDate;
  }

  const asNumber = Number(value);
  if (!Number.isNaN(asNumber) && value.trim() !== "") {
    return asNumber;
  }

  return value.toLowerCase();
}

function getSortIndicator<
  T extends { key: string; direction: "asc" | "desc" }
>(sortState: T, key: T["key"]): string {
  if (sortState.key !== key) return "↕";
  return sortState.direction === "asc" ? "↑" : "↓";
}

export default AdminDashboard;
