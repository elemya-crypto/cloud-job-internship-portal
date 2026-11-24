import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { LogOut, PlusCircle, Users, Building2 } from "lucide-react";

function PostJob() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    location: "",
    jobType: "Internship",
    skills: "",
    description: "",
    deadline: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Auto-fill company name from Firestore profile
  useEffect(() => {
    const fetchCompanyName = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setFormData(prev => ({ ...prev, companyName: userDoc.data().name || "" }));
        }
      } catch (err) {
        console.error("Failed to fetch company name:", err);
      }
    };
    fetchCompanyName();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  /* SUBMIT JOB */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const user = auth.currentUser;
    if (!user) { navigate("/"); return; }

    if (
      !formData.jobTitle ||
      !formData.companyName ||
      !formData.location ||
      !formData.skills ||
      !formData.description ||
      !formData.deadline
    ) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, "jobs"), {
        jobTitle: formData.jobTitle,
        companyName: formData.companyName,
        location: formData.location,
        jobType: formData.jobType,
        skills: formData.skills,
        description: formData.description,
        deadline: formData.deadline,
        companyId: user.uid,
        createdAt: new Date()
      });
      setSuccess(true);
      setTimeout(() => navigate("/company"), 1500);
    } catch (err) {
      console.error("Error posting job:", err);
      setError("Unable to post job: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-theme">
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
        <div className="post-job-container">
          {/* HEADER */}
          <div className="post-job-header">
            <h1>Post Job / Internship</h1>
            <p>Create a new opportunity and connect with talented students.</p>
          </div>

          {error && <div className="login-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
          {success && (
            <div className="login-error" style={{ background: "#d4edda", color: "#155724", borderLeftColor: "#20bf6b", marginBottom: 16 }}>
              ✅ Job posted successfully! Redirecting...
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="Example: Software Developer Intern"
              />
            </div>

            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Your company name"
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Example: Coimbatore"
              />
            </div>

            <div className="form-group">
              <label>Job Type</label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
              >
                <option value="Internship">Internship</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
              </select>
            </div>

            <div className="form-group">
              <label>Required Skills</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="Example: Java, React, JavaScript, UI/UX"
              />
            </div>

            <div className="form-group">
              <label>Job Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the job responsibilities, requirements and expectations..."
              />
            </div>

            <div className="form-group">
              <label>Application Deadline</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "25px" }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || success}
              >
                {loading ? "Posting..." : "Post Job"}
              </button>
              <button
                type="button"
                className="btn btn-purple"
                onClick={() => navigate("/company")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default PostJob;
