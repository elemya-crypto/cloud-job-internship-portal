import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, addDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { MapPin, Calendar, Phone, Code2, Send, ArrowLeft, Building2, LogOut, FileUp, Link as LinkIcon, CheckCircle2, User, Camera, AlertCircle, X } from "lucide-react";

function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState("");

  // Student Photo state
  const [photoBase64, setPhotoBase64] = useState("");
  const [photoFileName, setPhotoFileName] = useState("");

  // Resume state
  const [resumeType, setResumeType] = useState("file"); // "file" or "link"
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeBase64, setResumeBase64] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [resumeLink, setResumeLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchJobAndUser = async () => {
      try {
        const jobRef = doc(db, "jobs", jobId);
        const jobSnap = await getDoc(jobRef);
        if (jobSnap.exists()) {
          setJob({ id: jobSnap.id, ...jobSnap.data() });
        }

        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().name) {
            setFullName(userDoc.data().name);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setPageLoading(false);
      }
    };
    fetchJobAndUser();
  }, [jobId]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, WEBP) for your profile picture.");
      return;
    }

    // Limit photo to 1MB
    if (file.size > 1 * 1024 * 1024) {
      setError("Photo size must be under 1 MB. Please compress or select a smaller photo.");
      return;
    }

    setError("");
    setPhotoFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoBase64(reader.result);
    };
    reader.onerror = () => {
      setError("Failed to read the photo. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 1.5MB max for base64 storage in Firestore document
    if (file.size > 1.5 * 1024 * 1024) {
      setError("Resume file must be under 1.5 MB. Alternatively, you can use the Google Drive / Portfolio Link option.");
      setResumeFile(null);
      setResumeBase64("");
      setResumeFileName("");
      return;
    }

    setError("");
    setResumeFile(file);
    setResumeFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setResumeBase64(reader.result);
    };
    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setError("");
    const user = auth.currentUser;
    if (!user) {
      navigate("/");
      return;
    }

    if (!fullName.trim()) {
      setError("Please provide your full name.");
      return;
    }

    if (!photoBase64) {
      setError("Please upload your passport-size photo with a white background as required by employers.");
      return;
    }

    if (!phone.trim()) {
      setError("Please provide your phone number.");
      return;
    }
    if (!skills.trim()) {
      setError("Please provide your skills.");
      return;
    }

    if (resumeType === "file" && !resumeBase64) {
      setError("Please upload your resume file (PDF/Word document) or choose to provide a link.");
      return;
    }
    if (resumeType === "link" && !resumeLink.trim()) {
      setError("Please provide your resume URL (e.g., Google Drive link).");
      return;
    }

    try {
      setLoading(true);
      // Check for duplicate application
      const dupQ = query(
        collection(db, "applications"),
        where("jobId", "==", job.id),
        where("studentId", "==", user.uid)
      );
      const dupSnap = await getDocs(dupQ);
      if (!dupSnap.empty) {
        setError("You have already applied for this position.");
        setLoading(false);
        return;
      }

      const applicantName = fullName.trim() || user.displayName || user.email;

      await addDoc(collection(db, "applications"), {
        jobId: job.id,
        jobTitle: job.jobTitle,
        companyName: job.companyName,
        companyId: job.companyId || "",
        studentId: user.uid,
        studentName: applicantName,
        studentEmail: user.email,
        phone: phone.trim(),
        skills: skills.trim(),
        studentPhoto: photoBase64,
        resumeType: resumeType,
        resumeData: resumeType === "file" ? resumeBase64 : "",
        resumeFileName: resumeType === "file" ? resumeFileName : "",
        resumeLink: resumeType === "link" ? resumeLink.trim() : "",
        status: "Applied",
        appliedAt: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => navigate("/my-applications"), 1500);
    } catch (error) {
      console.error(error);
      setError("Error submitting application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="student-theme">
        <nav className="navbar">
          <div className="navbar-brand">☁ Cloud <span>Job Portal</span></div>
          <div className="navbar-links">
            <button onClick={() => navigate("/student")}>Dashboard</button>
            <button onClick={() => navigate("/jobs")}>View Jobs</button>
            <button className="logout-btn" onClick={handleLogout}><LogOut size={15} style={{ verticalAlign: "middle", marginRight: 4 }} />Logout</button>
          </div>
        </nav>
        <main className="page-container">
          <div className="loading-screen">
            <div className="loading-spinner-large"></div>
            <p>Loading job details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="student-theme">
        <nav className="navbar">
          <div className="navbar-brand">☁ Cloud <span>Job Portal</span></div>
          <div className="navbar-links">
            <button onClick={() => navigate("/jobs")}>← Back to Jobs</button>
          </div>
        </nav>
        <main className="page-container">
          <div className="empty-state">
            <div style={{ fontSize: "60px", marginBottom: "15px" }}>😕</div>
            <h2>Job Not Found</h2>
            <p>This job listing may have been removed.</p>
            <br />
            <button className="btn btn-primary" onClick={() => navigate("/jobs")}>Browse Jobs</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="student-theme">
      <nav className="navbar">
        <div className="navbar-brand">☁ Cloud <span>Job Portal</span></div>
        <div className="navbar-links">
          <button onClick={() => navigate("/student")}>🏠 Dashboard</button>
          <button onClick={() => navigate("/jobs")}>💼 View Jobs</button>
          <button onClick={() => navigate("/my-applications")}>📋 My Applications</button>
          <button className="logout-btn" onClick={handleLogout}><LogOut size={15} style={{ verticalAlign: "middle", marginRight: 4 }} />Logout</button>
        </div>
      </nav>

      <main className="page-container">
        <div className="apply-container animate-fadeInUp">
          {/* Job Details Card */}
          <div className="apply-job-header">
            <button className="back-btn" onClick={() => navigate("/jobs")}>
              <ArrowLeft size={16} /> Back to Jobs
            </button>

            <div className="apply-job-type-badge">
              {job.jobType === "Internship" ? "🎓" : "💼"} {job.jobType}
            </div>

            <h1 className="apply-job-title">{job.jobTitle}</h1>

            <div className="apply-company-row">
              <Building2 size={18} />
              <strong>{job.companyName}</strong>
            </div>

            <div className="apply-job-meta">
              <div className="apply-meta-item">
                <MapPin size={15} />
                <span>{job.location}</span>
              </div>
              <div className="apply-meta-item">
                <Calendar size={15} />
                <span>Deadline: {job.deadline}</span>
              </div>
            </div>

            {job.skills && (
              <div className="apply-skills-wrap">
                <h4>🛠️ Required Skills</h4>
                <div className="apply-skills">
                  {job.skills.split(",").map((s, i) => (
                    <span key={i} className="skill-chip">{s.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {job.description && (
              <div className="apply-description">
                <h4>📝 Job Description</h4>
                <p>{job.description}</p>
              </div>
            )}
          </div>

          {/* Application Form */}
          <div className="apply-form-card">
            <h2>✍️ Submit Your Application</h2>
            <p className="apply-form-subtitle">Fill in your professional details below to apply for this position</p>

            {error && <div className="login-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
            {success && (
              <div className="login-error" style={{ background: "#d4edda", color: "#155724", borderLeftColor: "#20bf6b", marginBottom: 16 }}>
                ✅ Application submitted successfully! Redirecting...
              </div>
            )}

            <form onSubmit={handleApply}>
              {/* STUDENT PHOTO UPLOAD WITH WHITE BACKGROUND DISCLAIMER */}
              <div className="form-group" style={{ marginBottom: "22px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Camera size={16} color="var(--primary)" />
                  Candidate Photo *
                </label>

                {/* White Background Disclaimer Notice */}
                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "10px 14px",
                  background: "#fff9ec",
                  border: "1px solid #ffe2a8",
                  borderRadius: "10px",
                  marginBottom: "12px",
                  fontSize: "12.5px",
                  color: "#92400e"
                }}>
                  <AlertCircle size={17} style={{ flexShrink: 0, marginTop: "2px", color: "#f59e0b" }} />
                  <div>
                    <strong>Photo Guideline / Disclaimer:</strong> Please upload a clear, front-facing passport-style photograph with a <strong>plain white background</strong>. Ensure good lighting and formal attire.
                  </div>
                </div>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "18px",
                  padding: "14px",
                  background: "#f8fbff",
                  borderRadius: "14px",
                  border: "1px solid #e1effa"
                }}>
                  {/* Photo Preview Box */}
                  <div style={{
                    width: "84px",
                    height: "96px",
                    borderRadius: "10px",
                    background: "#ffffff",
                    border: "2px solid #cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    flexShrink: 0,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                  }}>
                    {photoBase64 ? (
                      <img
                        src={photoBase64}
                        alt="Candidate Preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ textAlign: "center", color: "#94a3b8", fontSize: "11px", padding: "4px" }}>
                        <Camera size={26} style={{ margin: "0 auto 4px", display: "block", color: "#cbd5e1" }} />
                        White BG
                      </div>
                    )}
                  </div>

                  {/* Upload button & filename */}
                  <div style={{ flex: 1 }}>
                    <input
                      type="file"
                      id="student-photo-input"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handlePhotoChange}
                      style={{ display: "none" }}
                    />
                    <label
                      htmlFor="student-photo-input"
                      className="btn btn-primary"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                        padding: "8px 16px",
                        fontSize: "13px",
                        marginBottom: "6px"
                      }}
                    >
                      <Camera size={15} /> {photoBase64 ? "Change Photo" : "Upload Picture"}
                    </label>

                    {photoFileName ? (
                      <div style={{ fontSize: "12px", color: "#087d63", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                        <CheckCircle2 size={14} /> {photoFileName}
                      </div>
                    ) : (
                      <div style={{ fontSize: "11.5px", color: "var(--text-light)" }}>
                        PNG, JPG or WEBP (Max 1 MB)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>👤 Full Name</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>📱 Phone Number</label>
                <div className="input-wrapper">
                  <Phone className="input-icon" size={18} />
                  <input
                    type="tel"
                    placeholder="Enter your phone number (e.g. +91 9876543210)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>💻 Your Skills</label>
                <div className="input-wrapper">
                  <Code2 className="input-icon" size={18} />
                  <input
                    type="text"
                    placeholder="e.g. React, Java, Python, UI/UX, Cloud"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* RESUME UPLOAD SECTION */}
              <div className="form-group">
                <label>📄 Resume / CV</label>
                
                <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                  <button
                    type="button"
                    onClick={() => { setResumeType("file"); setError(""); }}
                    style={{
                      flex: 1,
                      padding: "9px 14px",
                      borderRadius: "10px",
                      border: resumeType === "file" ? "2px solid var(--primary)" : "1px solid #d7e4ef",
                      background: resumeType === "file" ? "var(--blue-light)" : "#fff",
                      color: resumeType === "file" ? "var(--primary)" : "var(--text)",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    <FileUp size={16} /> Upload Resume Document
                  </button>

                  <button
                    type="button"
                    onClick={() => { setResumeType("link"); setError(""); }}
                    style={{
                      flex: 1,
                      padding: "9px 14px",
                      borderRadius: "10px",
                      border: resumeType === "link" ? "2px solid var(--primary)" : "1px solid #d7e4ef",
                      background: resumeType === "link" ? "var(--blue-light)" : "#fff",
                      color: resumeType === "link" ? "var(--primary)" : "var(--text)",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    <LinkIcon size={16} /> Google Drive / Link
                  </button>
                </div>

                {resumeType === "file" ? (
                  <div style={{
                    border: "2px dashed #b8d4ee",
                    borderRadius: "14px",
                    padding: "20px",
                    textAlign: "center",
                    background: "#f9fcff",
                    transition: "0.2s ease"
                  }}>
                    <input
                      type="file"
                      id="resume-file-input"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    <label
                      htmlFor="resume-file-input"
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                        margin: 0
                      }}
                    >
                      <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: "var(--blue-light)",
                        color: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px"
                      }}>
                        <FileUp size={24} />
                      </div>
                      <span style={{ fontWeight: "700", color: "var(--navy)", fontSize: "14px" }}>
                        {resumeFileName ? "Replace Selected Resume" : "Click to select Resume (PDF or Word)"}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--text-light)" }}>
                        Max file size: 1.5 MB
                      </span>
                    </label>

                    {resumeFileName && (
                      <div style={{
                        marginTop: "12px",
                        padding: "8px 14px",
                        background: "#e8fbfa",
                        color: "#087d63",
                        borderRadius: "8px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: "600",
                        fontSize: "13px"
                      }}>
                        <CheckCircle2 size={16} /> Selected: {resumeFileName}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="input-wrapper">
                    <LinkIcon className="input-icon" size={18} />
                    <input
                      type="url"
                      placeholder="Paste your Google Drive, LinkedIn, or Portfolio link"
                      value={resumeLink}
                      onChange={(e) => setResumeLink(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="apply-btn-row">
                <button type="submit" className="btn btn-primary apply-submit-btn" disabled={loading || success}>
                  {loading ? (
                    <><span className="spinner"></span> Submitting...</>
                  ) : (
                    <><Send size={16} /> Submit Application</>
                  )}
                </button>
                <button type="button" className="btn btn-purple" onClick={() => navigate("/jobs")}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ApplyJob;
