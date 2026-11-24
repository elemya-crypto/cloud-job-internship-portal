import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cloud, Mail, Lock, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      setError("Please enter email and password.");
      return;
    }
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      const uid = userCredential.user.uid;
      const userDoc = await getDoc(doc(db, "users", uid));
      if (!userDoc.exists()) {
        setError("User profile not found. Please register first.");
        return;
      }
      const userData = userDoc.data();
      if (userData.role === "company" && !userData.approved) {
        setError("Your company account is pending admin approval. Please wait.");
        return;
      }
      if (userData.role === "student") navigate("/student");
      else if (userData.role === "company") navigate("/company");
      else if (userData.role === "admin") navigate("/admin");
      else setError("Invalid user role. Please contact support.");
    } catch (err) {
      console.error(err);
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError("Login failed: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-blob login-blob-1"></div>
      <div className="login-blob login-blob-2"></div>
      <div className="login-blob login-blob-3"></div>

      <div className="login-card animate-fadeInUp">
        <div className="login-logo-wrap">
          <div className="login-logo-icon">
            <Cloud size={34} strokeWidth={2} />
          </div>
        </div>

        <h1 className="login-title">Cloud Job Portal</h1>
        <p className="login-subtitle">
          🎯 Find opportunities. Connect with companies. Build your career.
        </p>

        {error && <div className="login-error">⚠️ {error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>📧 Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label>🔒 Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? (
              <><span className="spinner"></span> Logging in...</>
            ) : (
              <><LogIn size={18} /> Login</>
            )}
          </button>
        </form>

        <div className="login-divider">
          <span>Don&apos;t have an account?</span>
        </div>

        <button className="btn-register" onClick={() => navigate("/register")}>
          <UserPlus size={18} />
          Create New Account
        </button>

        <p className="login-footer-text">
          ☁️ Cloud Job &amp; Internship Portal &nbsp;|&nbsp; 2026
        </p>
      </div>
    </div>
  );
}

export default Login;
