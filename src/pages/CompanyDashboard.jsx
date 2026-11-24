import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Briefcase, Users, Star, LogOut, PlusCircle, Building2 } from "lucide-react";

function CompanyDashboard() {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("Company");
  const [stats, setStats] = useState({ jobsPosted: 0, totalApplicants: 0, shortlisted: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const user = auth.currentUser;
      if (!user) { navigate("/"); return; }
      try {
        // Load company profile
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setCompanyName(userDoc.data().name || "Company");
        }
        // Load jobs for this company
        const jobsSnap = await getDocs(
          query(collection(db, "jobs"), where("companyId", "==", user.uid))
        );
        const jobIds = jobsSnap.docs.map(d => d.id);
        let totalApplicants = 0;
        let shortlisted = 0;
        if (jobIds.length > 0) {
          // Firestore 'in' operator supports up to 30 items
          const chunks = [];
          for (let i = 0; i < jobIds.length; i += 30) chunks.push(jobIds.slice(i, i + 30));
          for (const chunk of chunks) {
            const appsSnap = await getDocs(
              query(collection(db, "applications"), where("jobId", "in", chunk))
            );
            const apps = appsSnap.docs.map(d => d.data());
            totalApplicants += apps.length;
            shortlisted += apps.filter(a => a.status === "Shortlisted").length;
          }
        }
        setStats({ jobsPosted: jobIds.length, totalApplicants, shortlisted });
      } catch (err) {
        console.error("Company dashboard load error:", err);
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
    <div className="company-theme">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-brand">☁ Cloud <span>Job Portal</span></div>
        <div className="navbar-links">
          <button onClick={() => navigate("/company")}>
            <Building2 size={15} style={{ verticalAlign: "middle", marginRight: 4 }} />Dashboard
          </button>
          <button onClick={() => navigate("/post-job")}>
            <PlusCircle size={15} style={{ verticalAlign: "middle", marginRight: 4 }} />Post Job
          </button>
          <button onClick={() => navigate("/applicants")}>
            <Users size={15} style={{ verticalAlign: "middle", marginRight: 4 }} />Applicants
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={15} style={{ verticalAlign: "middle", marginRight: 4 }} />Logout
          </button>
        </div>
      </nav>

      <main className="page-container">
        {/* HERO */}
        <section className="dashboard-hero company-dashboard-hero animate-fadeInUp">
          <div>
            <h1>Welcome, {companyName}! 🏢</h1>
            <p>
              Manage your job and internship opportunities, review student applications
              and find talented candidates.
            </p>
          </div>
        </section>

        <h2 className="page-title">Company Dashboard</h2>

        {/* STAT CARDS */}
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-icon"><Briefcase size={22} /></div>
            <h3>Jobs Posted</h3>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#0878f9", margin: "10px 0" }}>
              {loading ? "..." : stats.jobsPosted}
            </p>
            <p>Create and manage your job and internship opportunities.</p>
            <br />
            <button className="btn btn-primary" onClick={() => navigate("/post-job")}>
              Post New Job
            </button>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><Users size={22} /></div>
            <h3>Applicants</h3>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#20bf6b", margin: "10px 0" }}>
              {loading ? "..." : stats.totalApplicants}
            </p>
            <p>View students who have applied for your opportunities.</p>
            <br />
            <button className="btn btn-success" onClick={() => navigate("/applicants")}>
              View Applicants
            </button>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><Star size={22} /></div>
            <h3>Shortlisted</h3>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#7657e8", margin: "10px 0" }}>
              {loading ? "..." : stats.shortlisted}
            </p>
            <p>Manage students selected for the next stage of recruitment.</p>
            <br />
            <button className="btn btn-purple" onClick={() => navigate("/applicants")}>
              View Shortlisted
            </button>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <section style={{ marginTop: "35px" }}>
          <h2 className="page-title">Company Quick Actions</h2>
          <div className="card-grid">
            <div className="glass-card" style={{ padding: "25px" }}>
              <h3>
                <PlusCircle size={18} style={{ verticalAlign: "middle", marginRight: 6, color: "#0878f9" }} />
                Create Opportunity
              </h3>
              <p>Post a new job or internship and reach talented students.</p>
              <br />
              <button className="btn btn-primary" onClick={() => navigate("/post-job")}>Post Job</button>
            </div>
            <div className="glass-card" style={{ padding: "25px" }}>
              <h3>
                <Users size={18} style={{ verticalAlign: "middle", marginRight: 6, color: "#20bf6b" }} />
                Manage Applicants
              </h3>
              <p>Review, shortlist, select or reject student applications.</p>
              <br />
              <button className="btn btn-success" onClick={() => navigate("/applicants")}>View Applicants</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default CompanyDashboard;
