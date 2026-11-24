import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { db, auth } from "../firebase";
import { LogOut } from "lucide-react";

function Jobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const snapshot = await getDocs(collection(db, "jobs"));
        const jobData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setJobs(jobData);
      } catch (error) {
        console.error("Jobs loading error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

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
        <div
          className="navbar-brand"
          onClick={() => navigate("/student")}
        >
          ☁️ Cloud Job Portal
        </div>
        <div className="navbar-links">
          <button onClick={() => navigate("/student")}>
            🏠 Dashboard
          </button>
          <button onClick={() => navigate("/jobs")}>
            💼 View Jobs
          </button>
          <button onClick={() => navigate("/my-applications")}>
            📋 My Applications
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={15} style={{ verticalAlign: "middle", marginRight: 4 }} />Logout
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="page-container">
        <div className="jobs-header">
          <div className="jobs-header-icon">
            💼
          </div>
          <div>
            <h1 className="page-title">
              Available Jobs &amp; Internships
            </h1>
            <p className="jobs-subtitle">
              Find your next career opportunity.
            </p>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="jobs-status-card">
            <div className="loading-icon">🔄</div>
            <h2>Loading Jobs...</h2>
          </div>
        )}

        {/* JOBS */}
        {!loading && jobs.length > 0 && (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div
                className="job-card professional-job-card"
                key={job.id}
              >
                <div className="job-card-top">
                  <div className="job-main-icon">
                    {job.jobType === "Internship" ? "🎓" : "💼"}
                  </div>
                  <span className="job-type">
                    {job.jobType || "Job"}
                  </span>
                </div>

                <h2 className="job-title">{job.jobTitle}</h2>

                <div className="job-company">
                  🏢<strong>{job.companyName}</strong>
                </div>

                <div className="job-information">
                  <div className="job-info-box">
                    <div className="info-icon">📍</div>
                    <div>
                      <span className="info-label">Location</span>
                      <strong>{job.location}</strong>
                    </div>
                  </div>
                  <div className="job-info-box">
                    <div className="info-icon">📅</div>
                    <div>
                      <span className="info-label">Deadline</span>
                      <strong>{job.deadline}</strong>
                    </div>
                  </div>
                </div>

                <div className="job-section">
                  <h3>🛠️ Required Skills</h3>
                  <div className="job-skills">
                    {job.skills
                      ?.split(",")
                      .map((skill, index) => (
                        <span className="skill-chip" key={index}>
                          {skill.trim()}
                        </span>
                      ))}
                  </div>
                </div>

                <div className="job-section">
                  <h3>📝 Description</h3>
                  <p className="job-description">{job.description}</p>
                </div>

                <div className="job-card-footer">
                  <span>🚀 Start your career journey</span>
                  <button
                    className="btn-apply"
                    onClick={() => navigate(`/apply/${job.id}`)}
                  >
                    Apply Now →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NO JOBS */}
        {!loading && jobs.length === 0 && (
          <div className="jobs-status-card">
            <div className="loading-icon">🔍</div>
            <h2>No Jobs Found</h2>
            <p>There are currently no jobs or internships available.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Jobs;
