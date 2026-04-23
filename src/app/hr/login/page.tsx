"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { validateCompanyLogin } from "@/lib/supabase";

export default function HrLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    const result = await validateCompanyLogin(email, password);
    if (!result.ok) {
      if (result.reason === "no_visible_company_rows") {
        setError(
          "Login table is not readable right now. Check Company_details table data or Supabase RLS select policy."
        );
      } else {
      setError("Invalid email or password");
      }
      setLoading(false);
      return;
    }

    sessionStorage.setItem("hr-authenticated", "true");
    sessionStorage.setItem("hr-email", email.trim().toLowerCase());
    router.push("/hr/candidates");
  };

  return (
    <div style={styles.page}>
      <main style={styles.main} className="glass-card">
        <div style={styles.topActions}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => router.push("/")}
            style={styles.homeBtn}
          >
            ← Go Home
          </button>
        </div>

        <h1 style={styles.heading}>HR Login</h1>
        <p style={styles.subheading}>
          Enter your company account details to continue.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label htmlFor="hr-email" style={styles.label}>
            Email
          </label>
          <input
            id="hr-email"
            type="email"
            className="input-field"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="hr-password" style={styles.label}>
            Password
          </label>
          <div style={styles.passwordWrap}>
            <input
              id="hr-password"
              type={showPassword ? "text" : "password"}
              className="input-field"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              style={styles.passwordInput}
              required
            />
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setShowPassword((prev) => !prev)}
              style={styles.toggleBtn}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error ? <p style={styles.errorText}>{error}</p> : null}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={styles.submitBtn}
          >
            {loading ? "Checking..." : "Login"}
          </button>
        </form>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
  },
  main: {
    width: "100%",
    maxWidth: "460px",
    padding: "32px",
    borderRadius: "16px",
    background: "#ffffff",
    border: "1px solid rgba(0, 26, 61, 0.12)",
  },
  topActions: {
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "12px",
  },
  homeBtn: {
    padding: "8px 14px",
    fontWeight: 700,
  },
  heading: {
    fontSize: "1.9rem",
    marginBottom: "8px",
  },
  subheading: {
    color: "#64748b",
    marginBottom: "22px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  passwordWrap: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: "86px",
  },
  toggleBtn: {
    position: "absolute",
    right: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    height: "34px",
    padding: "0 12px",
    borderRadius: "999px",
    fontWeight: 700,
    color: "#001A3D",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#001A3D",
  },
  errorText: {
    marginTop: "4px",
    color: "#dc2626",
    fontSize: "0.9rem",
    fontWeight: 600,
  },
  submitBtn: {
    marginTop: "10px",
    width: "100%",
  },
};
