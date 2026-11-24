import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import {
  LayoutDashboard, Users, Building2, Briefcase, FileText,
  CheckCircle, XCircle, LogOut, Shield, TrendingUp, ChevronRight,
  Filter, CheckCircle2, Clock, Download, ExternalLink, X, Phone
} from "lucide-react";

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedAppStatus, setSelectedAppStatus] = useState("All");
  const [selectedCompanyStatus, setSelectedCompanyStatus] = useState("All");
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ students: 0, companies: 0, jobs: 0, applications: 0 });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [usersSnap, jobsSnap, appsSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "jobs")),
        getDocs(collection(db, "applications")),
      ]);

      const allUsers = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const studentList = allUsers.filter(u => u.role === "student");
      const companyList = allUsers.filter(u => u.role === "company");
      const jobList = jobsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const appList = appsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      setStudents(studentList);
      setCompanies(companyList);
      setJobs(jobList);
      setApplications(appList);
      setStats({
        students: studentList.length,
        companies: companyList.length,
        jobs: jobList.length,
        applications: appList.length,
      });
    } catch (err) {
      console.error("Admin data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCompanyApproval = async (companyId, currentApproval) => {
    try {
      await updateDoc(doc(db, "users", companyId), { approved: !currentApproval });
      setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, approved: !currentApproval } : c));
    } catch (err) {
      console.error("Approval update error:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (val) => {
    if (!val) return "N/A";
    try {
      const d = val.toDate ? val.toDate() : new Date(val);
      return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return String(val); }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Shortlisted": return "status status-shortlisted";
      case "Selected": return "status status-selected";
      case "Rejected": return "status status-rejected";
      default: return "status status-applied";
    }
  };

  const handleDownloadResume = (base64Data, fileName) => {
    try {
      const link = document.createElement("a");
      link.href = base64Data;
      link.download = fileName || "Resume.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading resume:", err);
    }
  };

  // Filtered lists
  const filteredApplications = selectedAppStatus === "All"
    ? applications
    : applications.filter(a => (a.status || "Applied").toLowerCase() === selectedAppStatus.toLowerCase());

  const filteredCompanies = selectedCompanyStatus === "All"
    ? companies
    : selectedCompanyStatus === "Approved"
      ? companies.filter(c => c.approved)
      : companies.filter(c => !c.approved);

  return (
    <div className="applicants-page">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-brand">
          <Shield size={20} style={{ marginRight: 6, color: "#ffd700" }} />
          ☁ Cloud <span>Job Portal</span>
          <span style={{ fontSize: 11, background: "rgba(255,215,0,0.2)", color: "#ffd700", padding: "2px 8px", borderRadius: 20, marginLeft: 8, fontWeight: 700 }}>ADMIN</span>
        </div>
        <div className="navbar-links">
          <button onClick={() => { setActiveTab("overview"); }} style={{ background: activeTab === "overview" ? "rgba(255,255,255,0.2)" : "transparent" }}>
            Dashboard
          </button>
          <button onClick={() => setActiveTab("students")} style={{ background: activeTab === "students" ? "rgba(255,255,255,0.2)" : "transparent" }}>
            Students
          </button>
          <button onClick={() => { setActiveTab("companies"); setSelectedCompanyStatus("All"); }} style={{ background: activeTab === "companies" ? "rgba(255,255,255,0.2)" : "transparent" }}>
            Companies
          </button>
          <button onClick={() => setActiveTab("jobs")} style={{ background: activeTab === "jobs" ? "rgba(255,255,255,0.2)" : "transparent" }}>
            Jobs
          </button>
          <button onClick={() => { setActiveTab("applications"); setSelectedAppStatus("All"); }} style={{ background: activeTab === "applications" ? "rgba(255,255,255,0.2)" : "transparent" }}>
            Applications
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={15} style={{ marginRight: 4, verticalAlign: "middle" }} /> Logout
          </button>
        </div>
      </nav>

      <main className="page-container">
        {/* HERO */}
        <section className="dashboard-hero company-dashboard-hero animate-fadeInUp" style={{ marginBottom: 28 }}>
          <div>
            <h1>🛡️ Admin Dashboard</h1>
            <p>Monitor all students, companies, jobs, and applications. Manage the portal from here.</p>
          </div>
        </section>

        {loading ? (
          <div className="loading-screen">
            <div className="loading-spinner-large"></div>
            <p>Loading portal data...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <>
                <h2 className="page-title">Portal Overview</h2>
                <div className="dashboard-grid" style={{ marginBottom: 30 }}>
                  <div className="stat-card" onClick={() => setActiveTab("students")} style={{ cursor: "pointer" }}>
                    <div className="stat-icon"><Users size={22} /></div>
                    <h3>Students</h3>
                    <p style={{ fontSize: 28, fontWeight: 800, color: "#0878f9", margin: "10px 0" }}>{stats.students}</p>
                    <p>Registered students</p>
                  </div>
                  <div className="stat-card" onClick={() => { setActiveTab("companies"); setSelectedCompanyStatus("All"); }} style={{ cursor: "pointer" }}>
                    <div className="stat-icon"><Building2 size={22} /></div>
                    <h3>Companies</h3>
                    <p style={{ fontSize: 28, fontWeight: 800, color: "#20bf6b", margin: "10px 0" }}>{stats.companies}</p>
                    <p>Registered companies</p>
                  </div>
                  <div className="stat-card" onClick={() => setActiveTab("jobs")} style={{ cursor: "pointer" }}>
                    <div className="stat-icon"><Briefcase size={22} /></div>
                    <h3>Jobs Posted</h3>
                    <p style={{ fontSize: 28, fontWeight: 800, color: "#7657e8", margin: "10px 0" }}>{stats.jobs}</p>
                    <p>Active opportunities</p>
                  </div>
                  <div className="stat-card" onClick={() => { setActiveTab("applications"); setSelectedAppStatus("All"); }} style={{ cursor: "pointer" }}>
                    <div className="stat-icon"><FileText size={22} /></div>
                    <h3>Applications</h3>
                    <p style={{ fontSize: 28, fontWeight: 800, color: "#ff9f43", margin: "10px 0" }}>{stats.applications}</p>
                    <p>Total submissions</p>
                  </div>
                </div>

                <div className="card-grid">
                  {/* APPLICATION STATUS CARD (CLICKABLE) */}
                  <div className="glass-card" style={{ padding: "24px 26px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, fontSize: "18px" }}>
                        <TrendingUp size={20} color="#0878f9" /> Application Status
                      </h3>
                      <span style={{ fontSize: "12px", color: "var(--text-light)", fontWeight: "600" }}>Click to view candidates</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {[
                        { name: "Applied", color: "#0878f9", bg: "#eaf5ff", border: "#cbe5ff" },
                        { name: "Shortlisted", color: "#20bf6b", bg: "#e8fbfa", border: "#bdf0eb" },
                        { name: "Selected", color: "#7657e8", bg: "#f0ebff", border: "#dcd0ff" },
                        { name: "Rejected", color: "#ff5c6c", bg: "#ffeef0", border: "#ffccd2" }
                      ].map(s => {
                        const count = applications.filter(a => (a.status || "Applied").toLowerCase() === s.name.toLowerCase()).length;
                        return (
                          <div
                            key={s.name}
                            onClick={() => {
                              setSelectedAppStatus(s.name);
                              setActiveTab("applications");
                            }}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "12px 16px",
                              borderRadius: "14px",
                              background: s.bg,
                              border: `1px solid ${s.border}`,
                              cursor: "pointer",
                              transition: "all 0.25s ease"
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = "translateX(5px)";
                              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = "none";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span className={`status status-${s.name.toLowerCase()}`} style={{ fontWeight: 800, fontSize: "13px" }}>
                                {s.name}
                              </span>
                              <span style={{ fontSize: "12px", color: "var(--text-light)" }}>Candidates</span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: "20px", fontWeight: "800", color: s.color }}>
                                {count}
                              </span>
                              <ChevronRight size={18} color={s.color} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* COMPANY STATUS CARD (CLICKABLE & PROFESSIONAL) */}
                  <div className="glass-card" style={{ padding: "24px 26px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, fontSize: "18px" }}>
                        <Building2 size={20} color="#20bf6b" /> Company Status
                      </h3>
                      <span style={{ fontSize: "12px", color: "var(--text-light)", fontWeight: "600" }}>Click to filter companies</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {/* Approved */}
                      <div
                        onClick={() => {
                          setSelectedCompanyStatus("Approved");
                          setActiveTab("companies");
                        }}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "14px 18px",
                          borderRadius: "14px",
                          background: "#e8fbfa",
                          border: "1px solid #bdf0eb",
                          cursor: "pointer",
                          transition: "all 0.25s ease"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = "translateX(5px)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(32,191,107,0.15)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = "none";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: "#20bf6b",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            <CheckCircle2 size={20} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: "15px", color: "#065f46" }}>
                              Approved Companies
                            </div>
                            <small style={{ color: "#047857", fontSize: "12px" }}>Active & Verified to post jobs</small>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: "22px", fontWeight: "800", color: "#20bf6b" }}>
                            {companies.filter(c => c.approved).length}
                          </span>
                          <ChevronRight size={18} color="#20bf6b" />
                        </div>
                      </div>

                      {/* Pending */}
                      <div
                        onClick={() => {
                          setSelectedCompanyStatus("Pending");
                          setActiveTab("companies");
                        }}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "14px 18px",
                          borderRadius: "14px",
                          background: "#fff9ec",
                          border: "1px solid #ffe2a8",
                          cursor: "pointer",
                          transition: "all 0.25s ease"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = "translateX(5px)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(255,159,67,0.2)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = "none";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: "#ff9f43",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            <Clock size={20} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: "15px", color: "#92400e" }}>
                              Pending Approvals
                            </div>
                            <small style={{ color: "#b45309", fontSize: "12px" }}>Requires administrator review</small>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: "22px", fontWeight: "800", color: "#ff9f43" }}>
                            {companies.filter(c => !c.approved).length}
                          </span>
                          <ChevronRight size={18} color="#ff9f43" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* STUDENTS TAB */}
            {activeTab === "students" && (
              <>
                <h2 className="page-title">👨‍🎓 Registered Students ({students.length})</h2>
                {students.length === 0 ? (
                  <div className="empty-state"><h2>No students registered yet.</h2></div>
                ) : (
                  <div className="table-container animate-fadeInUp">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Applications Submitted</th>
                          <th>Registered On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s, i) => (
                          <tr key={s.id}>
                            <td><strong style={{ color: "#0878f9" }}>#{i + 1}</strong></td>
                            <td><strong>{s.name || "N/A"}</strong></td>
                            <td>{s.email}</td>
                            <td>
                              <span style={{
                                padding: "4px 10px",
                                background: "var(--blue-light)",
                                color: "var(--primary)",
                                borderRadius: "12px",
                                fontWeight: "700",
                                fontSize: "12px"
                              }}>
                                {applications.filter(a => a.studentId === s.id).length} apps
                              </span>
                            </td>
                            <td>{formatDate(s.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* COMPANIES TAB */}
            {activeTab === "companies" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
                  <div>
                    <h2 className="page-title" style={{ marginBottom: 4 }}>
                      🏢 Registered Companies ({filteredCompanies.length})
                    </h2>
                    <p style={{ color: "var(--text-light)", fontSize: "14px" }}>
                      Manage enterprise accounts and grant job posting privileges.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div style={{ display: "flex", gap: "8px", background: "rgba(255,255,255,0.8)", padding: "6px", borderRadius: "12px", border: "1px solid #d7e4ef" }}>
                    {["All", "Approved", "Pending"].map(filterState => (
                      <button
                        key={filterState}
                        onClick={() => setSelectedCompanyStatus(filterState)}
                        style={{
                          border: "none",
                          padding: "7px 16px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: "700",
                          cursor: "pointer",
                          background: selectedCompanyStatus === filterState ? "var(--primary)" : "transparent",
                          color: selectedCompanyStatus === filterState ? "white" : "var(--text)",
                          transition: "0.2s ease"
                        }}
                      >
                        {filterState} ({filterState === "All" ? companies.length : filterState === "Approved" ? companies.filter(c => c.approved).length : companies.filter(c => !c.approved).length})
                      </button>
                    ))}
                  </div>
                </div>

                {filteredCompanies.length === 0 ? (
                  <div className="empty-state">
                    <h2>No companies found for this filter.</h2>
                    <p>Try switching the filter to All Companies.</p>
                  </div>
                ) : (
                  <div className="table-container animate-fadeInUp">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Company Name</th>
                          <th>Official Email</th>
                          <th>Jobs Posted</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCompanies.map((c, i) => (
                          <tr key={c.id}>
                            <td><strong style={{ color: "#0878f9" }}>#{i + 1}</strong></td>
                            <td><strong style={{ fontSize: "14px" }}>{c.name || "N/A"}</strong></td>
                            <td>{c.email}</td>
                            <td>
                              <span style={{ fontWeight: "700", color: "var(--navy)" }}>
                                {jobs.filter(j => j.companyId === c.id).length} jobs
                              </span>
                            </td>
                            <td>
                              <span className={c.approved ? "status status-selected" : "status status-pending"}>
                                {c.approved ? "✅ Approved" : "⏳ Pending Approval"}
                              </span>
                            </td>
                            <td>
                              <button
                                className={c.approved ? "btn-reject" : "btn-shortlist"}
                                style={{
                                  padding: "7px 16px",
                                  borderRadius: 8,
                                  border: "none",
                                  color: "white",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6
                                }}
                                onClick={() => toggleCompanyApproval(c.id, c.approved)}
                              >
                                {c.approved ? <><XCircle size={14} /> Revoke</> : <><CheckCircle2 size={14} /> Approve</>}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* JOBS TAB */}
            {activeTab === "jobs" && (
              <>
                <h2 className="page-title">💼 All Jobs ({jobs.length})</h2>
                {jobs.length === 0 ? (
                  <div className="empty-state"><h2>No jobs posted yet.</h2></div>
                ) : (
                  <div className="table-container animate-fadeInUp">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Job Title</th>
                          <th>Company</th>
                          <th>Location</th>
                          <th>Type</th>
                          <th>Deadline</th>
                          <th>Applicants</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map((j, i) => (
                          <tr key={j.id}>
                            <td><strong style={{ color: "#0878f9" }}>#{i + 1}</strong></td>
                            <td><strong>{j.jobTitle}</strong></td>
                            <td>{j.companyName}</td>
                            <td>{j.location}</td>
                            <td><span className="job-type">{j.jobType}</span></td>
                            <td>{j.deadline}</td>
                            <td>
                              <span style={{ fontWeight: 800, color: "var(--primary)" }}>
                                {applications.filter(a => a.jobId === j.id).length} applicants
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* APPLICATIONS TAB */}
            {activeTab === "applications" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
                  <div>
                    <h2 className="page-title" style={{ marginBottom: 4 }}>
                      📋 {selectedAppStatus === "All" ? "All Applications" : `${selectedAppStatus} Candidates`} ({filteredApplications.length})
                    </h2>
                    <p style={{ color: "var(--text-light)", fontSize: "14px" }}>
                      {selectedAppStatus === "All"
                        ? "Browse every student application submitted across the portal."
                        : `Viewing candidates currently in status: ${selectedAppStatus}`}
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", background: "rgba(255,255,255,0.8)", padding: "6px", borderRadius: "12px", border: "1px solid #d7e4ef" }}>
                    {["All", "Applied", "Shortlisted", "Selected", "Rejected"].map(statusVal => (
                      <button
                        key={statusVal}
                        onClick={() => setSelectedAppStatus(statusVal)}
                        style={{
                          border: "none",
                          padding: "7px 14px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: "700",
                          cursor: "pointer",
                          background: selectedAppStatus === statusVal ? "var(--primary)" : "transparent",
                          color: selectedAppStatus === statusVal ? "white" : "var(--text)",
                          transition: "0.2s ease"
                        }}
                      >
                        {statusVal} ({statusVal === "All" ? applications.length : applications.filter(a => (a.status || "Applied").toLowerCase() === statusVal.toLowerCase()).length})
                      </button>
                    ))}
                  </div>
                </div>

                {filteredApplications.length === 0 ? (
                  <div className="empty-state">
                    <h2>No candidates found in {selectedAppStatus} status.</h2>
                    <p>Select another status or switch back to All Applications.</p>
                  </div>
                ) : (
                  <div className="table-container animate-fadeInUp">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Photo</th>
                          <th>Student Name</th>
                          <th>Email &amp; Contact</th>
                          <th>Job Position</th>
                          <th>Company</th>
                          <th>Resume</th>
                          <th>Applied On</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApplications.map((a, i) => (
                          <tr key={a.id}>
                            <td><strong style={{ color: "#0878f9" }}>#{i + 1}</strong></td>
                            <td>
                              <div
                                onClick={() => setSelectedApplicant(a)}
                                style={{
                                  width: "42px",
                                  height: "48px",
                                  borderRadius: "8px",
                                  background: "#ffffff",
                                  border: "2px solid #e2e8f0",
                                  overflow: "hidden",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                                }}
                                title="Click to view full candidate details"
                              >
                                {a.studentPhoto ? (
                                  <img
                                    src={a.studentPhoto}
                                    alt="Student"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                ) : (
                                  <Users size={18} color="#94a3b8" />
                                )}
                              </div>
                            </td>
                            <td>
                              <button
                                onClick={() => setSelectedApplicant(a)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "var(--navy)",
                                  fontWeight: "800",
                                  cursor: "pointer",
                                  textAlign: "left",
                                  padding: 0,
                                  textDecoration: "underline",
                                  fontSize: "14px"
                                }}
                              >
                                {a.studentName || "N/A"}
                              </button>
                            </td>
                            <td>
                              <div><strong>{a.studentEmail}</strong></div>
                              {a.phone && (
                                <div style={{ fontSize: "12px", color: "var(--text-light)" }}>
                                  📞 {a.phone}
                                </div>
                              )}
                            </td>
                            <td><strong>{a.jobTitle}</strong></td>
                            <td>{a.companyName}</td>
                            <td>
                              {a.resumeData ? (
                                <button
                                  onClick={() => handleDownloadResume(a.resumeData, a.resumeFileName)}
                                  className="btn btn-primary"
                                  style={{ padding: "4px 8px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                >
                                  <Download size={12} /> Resume
                                </button>
                              ) : a.resumeLink ? (
                                <a
                                  href={a.resumeLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-purple"
                                  style={{ padding: "4px 8px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
                                >
                                  <ExternalLink size={12} /> Link
                                </a>
                              ) : (
                                <span style={{ color: "#999", fontSize: "12px" }}>None</span>
                              )}
                            </td>
                            <td>{formatDate(a.appliedAt)}</td>
                            <td>
                              <span className={getStatusClass(a.status)}>
                                {a.status || "Applied"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* CANDIDATE DETAILS MODAL (ADMIN VIEW) */}
        {selectedApplicant && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}>
            <div className="glass-card animate-fadeInUp" style={{
              background: "#ffffff",
              maxWidth: "580px",
              width: "100%",
              borderRadius: "22px",
              padding: "28px",
              boxShadow: "0 25px 70px rgba(0,0,0,0.35)",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative"
            }}>
              <button
                onClick={() => setSelectedApplicant(null)}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "#f0f4f8",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <X size={18} />
              </button>

              <h2 style={{ color: "var(--navy)", marginBottom: "4px" }}>
                👨‍🎓 Candidate Profile
              </h2>
              <p style={{ color: "var(--text-light)", fontSize: "13px", marginBottom: "20px" }}>
                Application for <strong>{selectedApplicant.jobTitle}</strong> at <strong>{selectedApplicant.companyName}</strong>
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* CANDIDATE PHOTO & NAME HEADER */}
                <div style={{
                  background: "#f8fbff",
                  padding: "16px 20px",
                  borderRadius: "14px",
                  border: "1px solid #e2effa",
                  display: "flex",
                  alignItems: "center",
                  gap: "18px"
                }}>
                  <div style={{
                    width: "80px",
                    height: "96px",
                    borderRadius: "10px",
                    background: "#ffffff",
                    border: "2px solid #cbd5e1",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 3px 10px rgba(0,0,0,0.08)"
                  }}>
                    {selectedApplicant.studentPhoto ? (
                      <img
                        src={selectedApplicant.studentPhoto}
                        alt="Candidate Photo"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ textAlign: "center", color: "#94a3b8", fontSize: "11px" }}>
                        <Users size={26} style={{ margin: "0 auto", display: "block", color: "#cbd5e1" }} />
                        No Photo
                      </div>
                    )}
                  </div>

                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-light)", fontWeight: "700" }}>STUDENT FULL NAME</span>
                    <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--navy)" }}>
                      {selectedApplicant.studentName || "N/A"}
                    </div>
                    {selectedApplicant.studentPhoto && (
                      <span style={{
                        display: "inline-block",
                        marginTop: "4px",
                        fontSize: "11px",
                        padding: "2px 8px",
                        background: "#f1f5f9",
                        color: "#475569",
                        borderRadius: "6px",
                        fontWeight: "600"
                      }}>
                        White BG Photo Verified
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ background: "#f8fbff", padding: "14px 18px", borderRadius: "12px", border: "1px solid #e2effa" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-light)", fontWeight: "700" }}>EMAIL</span>
                    <div style={{ fontSize: "13.5px", fontWeight: "700", color: "var(--navy)", wordBreak: "break-all" }}>
                      {selectedApplicant.studentEmail || "N/A"}
                    </div>
                  </div>
                  <div style={{ background: "#f8fbff", padding: "14px 18px", borderRadius: "12px", border: "1px solid #e2effa" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-light)", fontWeight: "700" }}>PHONE NUMBER</span>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--navy)" }}>
                      {selectedApplicant.phone || "N/A"}
                    </div>
                  </div>
                </div>

                <div style={{ background: "#f8fbff", padding: "14px 18px", borderRadius: "12px", border: "1px solid #e2effa" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-light)", fontWeight: "700" }}>SKILLS</span>
                  <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {selectedApplicant.skills ? selectedApplicant.skills.split(",").map((s, i) => (
                      <span key={i} className="skill-chip">{s.trim()}</span>
                    )) : <span>None</span>}
                  </div>
                </div>

                <div style={{ background: "#f8fbff", padding: "14px 18px", borderRadius: "12px", border: "1px solid #e2effa" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-light)", fontWeight: "700" }}>ATTACHED RESUME / CV</span>
                  <div style={{ marginTop: "8px" }}>
                    {selectedApplicant.resumeData ? (
                      <div>
                        <p style={{ fontSize: "13px", color: "var(--text)", marginBottom: "8px" }}>
                          📄 Document: <strong>{selectedApplicant.resumeFileName || "Resume File"}</strong>
                        </p>
                        <button
                          onClick={() => handleDownloadResume(selectedApplicant.resumeData, selectedApplicant.resumeFileName)}
                          className="btn btn-primary"
                          style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px" }}
                        >
                          <Download size={15} /> Download / View Resume
                        </button>
                      </div>
                    ) : selectedApplicant.resumeLink ? (
                      <div>
                        <a
                          href={selectedApplicant.resumeLink}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-purple"
                          style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", textDecoration: "none" }}
                        >
                          <ExternalLink size={15} /> Open External Resume Link
                        </a>
                      </div>
                    ) : (
                      <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>No resume attached.</p>
                    )}
                  </div>
                </div>

                <div style={{ background: "#f8fbff", padding: "14px 18px", borderRadius: "12px", border: "1px solid #e2effa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-light)", fontWeight: "700" }}>APPLICATION STATUS</span>
                  <span className={getStatusClass(selectedApplicant.status)}>
                    {selectedApplicant.status || "Applied"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
