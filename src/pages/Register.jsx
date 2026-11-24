import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Cloud, User, Mail, Lock, Briefcase, GraduationCap, ArrowLeft, UserPlus, Eye, EyeOff } from "lucide-react";
import { auth, db } from "../firebase";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (trimmedName.length < 2) {
      setError("Please enter a valid full name.");
      return;
    }
    try {
      setLoading(true);
      // 1. Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;
      // 2. Create Firestore user document
      await setDoc(doc(db, "users", user.uid), {
        name: trimmedName,
        email: trimmedEmail,
        role: role,
        approved: role === "student" ? true : false,
        createdAt: serverTimestamp()
      });
      // 3. Navigate appropriately
      if (role === "company") {
        navigate("/", { state: { message: "Company account created! Please wait for admin approval before logging in." } });
      } else {
        navigate("/student");
      }
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please login instead.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Registration failed: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page register-page">
      <div className="login-blob login-blob-1"></div>
      <div className="login-blob login-blob-2"></div>
      <div className="login-blob login-blob-3"></div>

      <div className="login-card register-card animate-fadeInUp">
        <div className="login-logo-wrap">
          <div className="login-logo-icon">
            <Cloud size={32} strokeWidth={2} />
          </div>
        </div>

        <h1 className="login-title">Join Cloud Portal</h1>
        <p className="login-subtitle">🚀 Create your account and start your journey</p>

        {error && <div className="login-error">⚠️ {error}</div>}

        <form onSubmit={handleRegister} className="login-form">
          <div className="form-group">
            <label>👤 Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>📧 Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>🔒 Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" className="input-eye" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>🎭 I am a...</label>
            <div className="role-selector">
              <div
                className={`role-option ${role === "student" ? "role-active" : ""}`}
                onClick={() => setRole("student")}
              >
                <GraduationCap size={24} />
                <span>Student</span>
                <small>Looking for jobs &amp; internships</small>
              </div>
              <div
                className={`role-option ${role === "company" ? "role-active" : ""}`}
                onClick={() => setRole("company")}
              >
                <Briefcase size={24} />
                <span>Company</span>
                <small>Hiring talent &amp; posting jobs</small>
              </div>
            </div>
          </div>

          {role === "company" && (
            <div className="login-error" style={{ background: "#fff3d6", color: "#a16b00", borderLeftColor: "#ff9f43" }}>
              ℹ️ Company accounts require admin approval before access is granted.
            </div>
          )}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? (
              <><span className="spinner"></span> Creating Account...</>
            ) : (
              <><UserPlus size={18} /> Create Account</>
            )}
          </button>
        </form>

        <div className="login-divider">
          <span>Already have an account?</span>
        </div>

        <button className="btn-register" onClick={() => navigate("/")}>
          <ArrowLeft size={18} />
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default Register;
