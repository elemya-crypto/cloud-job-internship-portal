import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { LogOut, Users, PlusCircle, Building2, FileText, Phone, Code, Eye, ExternalLink, Download, X, User } from "lucide-react";

function Applicants() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  /* LOAD APPLICATIONS - only for this company's jobs */
  useEffect(() => {
    const loadApplications = async () => {
      try {
        const user = auth.currentUser;
        if (!user) { navigate("/"); return; }

        // First get all jobs owned by this company
        const jobsSnap = await getDocs(
          query(collection(db, "jobs"), where("companyId", "==", user.uid))
        );
        const jobIds = jobsSnap.docs.map(d => d.id);

        if (jobIds.length === 0) {
          setApplications([]);
          setLoading(false);
          return;
        }

        // Fetch applications for those jobs in chunks of 30
        const allApps = [];
        for (let i = 0; i < jobIds.length; i += 30) {
          const chunk = jobIds.slice(i, i + 30);
          const appsSnap = await getDocs(
            query(collection(db, "applications"), where("jobId", "in", chunk))
          );
          appsSnap.docs.forEach(d => allApps.push({ id: d.id, ...d.data() }));
        }
        setApplications(allApps);
      } catch (error) {
        console.error("Error loading applicants:", error);
      } finally {
        setLoading(false);
      }
    };
    loadApplications();
  }, [navigate]);

  /* UPDATE STATUS */
  const updateStatus = async (applicationId, newStatus) => {
    try {
      await updateDoc(doc(db, "applications", applicationId), { status: newStatus });
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      if (selectedApplicant && selectedApplicant.id === applicationId) {
        setSelectedApplicant(prev => ({ ...prev, status: newStatus }));
      }
      setStatusMsg(`Marked as ${newStatus}`);
      setTimeout(() => setStatusMsg(""), 2500);
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

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

  const handleDownloadResume = (base64Data, fileName) => {
    try {
      const link = document.createElement("a");
      link.href = base64Data;
      link.download = fileName || "Resume.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error opening resume download:", err);
    }
  };

  return (
    <div className="applicants-page">
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

      {/* MAIN */}
      <main className="page-container">
        <h1 className="page-title">Student Applicants</h1>
        <p style={{ marginBottom: "25px", color: "#6b7c93" }}>
          Review student applications, candidate photos, inspect resumes, and manage recruitment status.
        </p>

        {statusMsg && (
          <div className="login-error" style={{ background: "#d4edda", color: "#155724", borderLeftColor: "#20bf6b", marginBottom: 16 }}>
            ✅ {statusMsg}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="loading-screen">
            <div className="loading-spinner-large"></div>
            <p>Loading applicants...</p>
          </div>
        )}

        {/* NO APPLICATIONS */}
        {!loading && applications.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: "60px", marginBottom: "15px" }}>📭</div>
            <h2>No Applications Yet</h2>
            <p>Students who apply for your jobs will appear here.</p>
          </div>
        )}

        {/* APPLICATION TABLE */}
        {!loading && applications.length > 0 && (
          <div className="table-container animate-fadeInUp">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Candidate</th>
                  <th>Student Name</th>
                  <th>Contact Info</th>
                  <th>Job Title</th>
                  <th>Skills</th>
                  <th>Resume</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application, i) => (
                  <tr key={application.id}>
                    <td><strong style={{ color: "#0878f9" }}>#{i + 1}</strong></td>
                    <td>
                      {/* Candidate Photo Preview Thumbnail */}
                      <div
                        onClick={() => setSelectedApplicant(application)}
                        style={{
                          width: "44px",
                          height: "50px",
                          borderRadius: "8px",
                          background: "#ffffff",
                          border: "2px solid #e2e8f0",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.06)"
                        }}
                        title="Click to view candidate details"
                      >
                        {application.studentPhoto ? (
                          <img
                            src={application.studentPhoto}
                            alt="Candidate"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <User size={20} color="#94a3b8" />
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedApplicant(application)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--navy)",
                          fontWeight: "700",
                          cursor: "pointer",
                          textAlign: "left",
                          padding: 0,
                          textDecoration: "underline"
                        }}
                      >
                        {application.studentName || "Student"}
                      </button>
                    </td>
                    <td>
                      <div><strong>{application.studentEmail || "No Email"}</strong></div>
                      {application.phone && (
                        <div style={{ fontSize: "12px", color: "var(--text-light)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Phone size={11} /> {application.phone}
                        </div>
                      )}
                    </td>
                    <td><strong>{application.jobTitle || "Job"}</strong></td>
                    <td>
                      <div style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={application.skills}>
                        {application.skills || "N/A"}
                      </div>
                    </td>
                    <td>
                      {application.resumeData ? (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => handleDownloadResume(application.resumeData, application.resumeFileName)}
                            className="btn btn-primary"
                            style={{ padding: "5px 10px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                            title="Download/Open Resume File"
                          >
                            <Download size={13} /> View File
                          </button>
                        </div>
                      ) : application.resumeLink ? (
                        <a
                          href={application.resumeLink}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-purple"
                          style={{ padding: "5px 10px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
                          title="Open Resume Link"
                        >
                          <ExternalLink size={13} /> Open Link
                        </a>
                      ) : (
                        <span style={{ color: "#999", fontSize: "12px" }}>Not provided</span>
                      )}
                    </td>
                    <td>
                      <span className={getStatusClass(application.status)}>
                        {application.status || "Applied"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-shortlist"
                          onClick={() => updateStatus(application.id, "Shortlisted")}
                          title="Shortlist Applicant"
                        >
                          Shortlist
                        </button>
                        <button
                          className="btn-select"
                          onClick={() => updateStatus(application.id, "Selected")}
                          title="Select Applicant"
                        >
                          Select
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => updateStatus(application.id, "Rejected")}
                          title="Reject Applicant"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL / DRAWER FOR APPLICANT DETAILS */}
        {selectedApplicant && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}>
            <div className="glass-card animate-fadeInUp" style={{
              background: "#ffffff",
              maxWidth: "600px",
              width: "100%",
              borderRadius: "22px",
              padding: "30px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
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
                👨‍🎓 Applicant Details
              </h2>
              <p style={{ color: "var(--text-light)", fontSize: "13px", marginBottom: "20px" }}>
                Application for <strong>{selectedApplicant.jobTitle}</strong>
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* CANDIDATE PHOTO & NAME CARD */}
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
                        <User size={28} style={{ margin: "0 auto", display: "block", color: "#cbd5e1" }} />
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
                    <span style={{ fontSize: "12px", color: "var(--text-light)", fontWeight: "600" }}>EMAIL</span>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--navy)", wordBreak: "break-all" }}>
                      {selectedApplicant.studentEmail || "N/A"}
                    </div>
                  </div>
                  <div style={{ background: "#f8fbff", padding: "14px 18px", borderRadius: "12px", border: "1px solid #e2effa" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-light)", fontWeight: "600" }}>PHONE NUMBER</span>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--navy)" }}>
                      {selectedApplicant.phone || "N/A"}
                    </div>
                  </div>
                </div>

                <div style={{ background: "#f8fbff", padding: "14px 18px", borderRadius: "12px", border: "1px solid #e2effa" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-light)", fontWeight: "600" }}>SKILLS</span>
                  <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {selectedApplicant.skills ? selectedApplicant.skills.split(",").map((s, i) => (
                      <span key={i} className="skill-chip">{s.trim()}</span>
                    )) : <span>None</span>}
                  </div>
                </div>

                <div style={{ background: "#f8fbff", padding: "14px 18px", borderRadius: "12px", border: "1px solid #e2effa" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-light)", fontWeight: "600" }}>RESUME / CV</span>
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
                          <Download size={15} /> Download / Open Resume Document
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
                          <ExternalLink size={15} /> Open Resume Link
                        </a>
                      </div>
                    ) : (
                      <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>No resume uploaded.</p>
                    )}
                  </div>
                </div>

                <div style={{ background: "#f8fbff", padding: "14px 18px", borderRadius: "12px", border: "1px solid #e2effa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--text-light)", fontWeight: "600" }}>APPLICATION STATUS</span>
                    <div>
                      <span className={getStatusClass(selectedApplicant.status)}>
                        {selectedApplicant.status || "Applied"}
                      </span>
                    </div>
                  </div>
                  <div className="action-buttons">
                    <button className="btn-shortlist" onClick={() => updateStatus(selectedApplicant.id, "Shortlisted")}>Shortlist</button>
                    <button className="btn-select" onClick={() => updateStatus(selectedApplicant.id, "Selected")}>Select</button>
                    <button className="btn-reject" onClick={() => updateStatus(selectedApplicant.id, "Rejected")}>Reject</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Applicants;
