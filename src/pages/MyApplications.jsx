import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { FileText, LogOut } from "lucide-react";

function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const user = auth.currentUser;
        if (!user) { navigate("/"); return; }
        const q = query(
          collection(db, "applications"),
          where("studentId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setApplications(data);
      } catch (error) {
        console.error("Error loading applications:", error);
      } finally {
        setLoading(false);
      }
    };
    loadApplications();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Shortlisted": return "status status-shortlisted";
      case "Selected": return "status status-selected";
      case "Rejected": return "status status-rejected";
      default: return "status status-applied";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Shortlisted": return "⭐";
      case "Selected": return "✅";
      case "Rejected": return "❌";
      default: return "📋";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const d = dateStr.toDate ? dateStr.toDate() : new Date(dateStr);
      return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return dateStr; }
  };

  return (
    <div className="application-page">
      <nav className="navbar">
        <div className="navbar-brand">☁ Cloud <span>Job Portal</span></div>
        <div className="navbar-links">
          <button onClick={() => navigate("/student")}>🏠 Dashboard</button>
          <button onClick={() => navigate("/jobs")}>💼 View Jobs</button>
          <button onClick={() => navigate("/my-applications")}>📋 My Applications</button>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={15} style={{ verticalAlign: "middle", marginRight: 4 }} />Logout
          </button>
        </div>
      </nav>

      <main className="page-container">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">📋 My Applications</h1>
            <p style={{ color: "#6b7c93", marginBottom: "25px" }}>
              Track all your job and internship applications in one place.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/jobs")}>
            + Browse More Jobs
          </button>
        </div>

        {loading && (
          <div className="loading-screen">
            <div className="loading-spinner-large"></div>
            <p>Loading your applications...</p>
          </div>
        )}

        {!loading && applications.length === 0 && (
          <div className="empty-state animate-fadeInUp">
            <div style={{ fontSize: "70px", marginBottom: "15px" }}>📭</div>
            <h2>No Applications Yet</h2>
            <p>You haven&apos;t applied to any jobs yet. Start exploring opportunities!</p>
            <br />
            <button className="btn btn-primary" onClick={() => navigate("/jobs")}>
              🔍 Browse Jobs
            </button>
          </div>
        )}

        {!loading && applications.length > 0 && (
          <>
            {/* Stats Row */}
            <div className="app-stats-row">
              <div className="app-stat-mini">
                <span className="app-stat-num">{applications.length}</span>
                <span>Total</span>
              </div>
              <div className="app-stat-mini">
                <span className="app-stat-num" style={{ color: "#0878f9" }}>{applications.filter(a => (a.status || "Applied") === "Applied").length}</span>
                <span>Applied</span>
              </div>
              <div className="app-stat-mini">
                <span className="app-stat-num" style={{ color: "#20bf6b" }}>{applications.filter(a => a.status === "Shortlisted").length}</span>
                <span>Shortlisted</span>
              </div>
              <div className="app-stat-mini">
                <span className="app-stat-num" style={{ color: "#7657e8" }}>{applications.filter(a => a.status === "Selected").length}</span>
                <span>Selected</span>
              </div>
            </div>

            <div className="table-container animate-fadeInUp">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>💼 Job Title</th>
                    <th>🏢 Company</th>
                    <th>📄 Resume</th>
                    <th>📅 Applied On</th>
                    <th>🔖 Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, index) => (
                    <tr key={app.id} className="animate-fadeIn">
                      <td><strong style={{ color: "#0878f9" }}>#{index + 1}</strong></td>
                      <td><strong>{app.jobTitle || "Job"}</strong></td>
                      <td>{app.companyName || "Company"}</td>
                      <td>
                        {app.resumeData ? (
                          <span style={{ fontSize: "12px", color: "#0878f9", fontWeight: "600" }}>
                            📎 {app.resumeFileName || "Uploaded Document"}
                          </span>
                        ) : app.resumeLink ? (
                          <a
                            href={app.resumeLink}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "600" }}
                          >
                            🔗 Link Attached
                          </a>
                        ) : (
                          <span style={{ color: "#999", fontSize: "12px" }}>None</span>
                        )}
                      </td>
                      <td>{formatDate(app.appliedAt)}</td>
                      <td>
                        <span className={getStatusClass(app.status)}>
                          {getStatusIcon(app.status)} {app.status || "Applied"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default MyApplications;
