import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Briefcase, FileText, LogOut, Search, TrendingUp, GraduationCap } from "lucide-react";

function StudentDashboard() {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState("Student");
  const [stats, setStats] = useState({ total: 0, applied: 0, shortlisted: 0, selected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const user = auth.currentUser;
      if (!user) { navigate("/"); return; }
      try {
        // Load student profile
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setStudentName(userDoc.data().name || "Student");
        }
        // Load application stats for THIS student only
        const q = query(collection(db, "applications"), where("studentId", "==", user.uid));
        const snap = await getDocs(q);
        const apps = snap.docs.map(d => d.data());
        setStats({
          total: apps.length,
          applied: apps.filter(a => (a.status || "Applied") === "Applied").length,
          shortlisted: apps.filter(a => a.status === "Shortlisted").length,
          selected: apps.filter(a => a.status === "Selected").length,
        });
      } catch (err) {
        console.error("Student dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="student-theme">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-brand">☁ Cloud <span>Job Portal</span></div>
        <div className="navbar-links">
          <button onClick={() => navigate("/student")}>
            <GraduationCap size={15} style={{ verticalAlign: "middle", marginRight: 4 }} />Dashboard
          </button>
          <button onClick={() => navigate("/jobs")}>
            <Briefcase size={15} style={{ verticalAlign: "middle", marginRight: 4 }} />View Jobs
          </button>
          <button onClick={() => navigate("/my-applications")}>
            <FileText size={15} style={{ verticalAlign: "middle", marginRight: 4 }} />My Applications
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={15} style={{ verticalAlign: "middle", marginRight: 4 }} />Logout
          </button>
        </div>
      </nav>

      <main className="page-container">
        {/* HERO */}
        <section className="dashboard-hero animate-fadeInUp">
          <div>
            <h1>Welcome, {studentName}! 🎓</h1>
            <p>
              Explore job and internship opportunities, apply for suitable positions
              and track your application progress.
            </p>
          </div>
        </section>

        {/* STATS ROW */}
        {!loading && (
          <div className="app-stats-row" style={{ marginBottom: 28 }}>
            <div className="app-stat-mini">
              <span className="app-stat-num">{stats.total}</span>
              <span>Total Applied</span>
            </div>
            <div className="app-stat-mini">
              <span className="app-stat-num" style={{ color: "#0878f9" }}>{stats.applied}</span>
              <span>In Review</span>
            </div>
            <div className="app-stat-mini">
              <span className="app-stat-num" style={{ color: "#20bf6b" }}>{stats.shortlisted}</span>
              <span>Shortlisted</span>
            </div>
            <div className="app-stat-mini">
              <span className="app-stat-num" style={{ color: "#7657e8" }}>{stats.selected}</span>
              <span>Selected</span>
            </div>
          </div>
        )}

        <h2 className="page-title">Student Dashboard</h2>

        {/* DASHBOARD CARDS */}
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-icon"><Briefcase size={22} /></div>
            <h3>View Jobs &amp; Internships</h3>
            <p>Explore available jobs and internship opportunities from companies.</p>
            <br />
            <button className="btn btn-primary" onClick={() => navigate("/jobs")}>
              Explore Jobs
            </button>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><FileText size={22} /></div>
            <h3>My Applications</h3>
            <p>Track the jobs and internships you have applied for.</p>
            <br />
            <button className="btn btn-success" onClick={() => navigate("/my-applications")}>
              View Applications
            </button>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><TrendingUp size={22} /></div>
            <h3>Application Status</h3>
            <p>
              {stats.total === 0
                ? "You haven't applied to any jobs yet."
                : `${stats.shortlisted} shortlisted · ${stats.selected} selected out of ${stats.total} applications.`}
            </p>
            <br />
            <button className="btn btn-purple" onClick={() => navigate("/my-applications")}>
              Track Status
            </button>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <section style={{ marginTop: "35px" }}>
          <h2 className="page-title">Quick Actions</h2>
          <div className="card-grid">
            <div className="glass-card" style={{ padding: "25px" }}>
              <h3><Search size={18} style={{ verticalAlign: "middle", marginRight: 6, color: "#0878f9" }} />Find Opportunities</h3>
              <p>Search for internships and jobs matching your skills.</p>
              <br />
              <button className="btn btn-primary" onClick={() => navigate("/jobs")}>Find Jobs</button>
            </div>
            <div className="glass-card" style={{ padding: "25px" }}>
              <h3><TrendingUp size={18} style={{ verticalAlign: "middle", marginRight: 6, color: "#20bf6b" }} />Track Applications</h3>
              <p>Check whether your applications are Applied, Shortlisted, Selected or Rejected.</p>
              <br />
              <button className="btn btn-success" onClick={() => navigate("/my-applications")}>Track Status</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default StudentDashboard;
