import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

function ProtectedRoute({ children, allowedRoles }) {
  const [authState, setAuthState] = useState("loading"); // "loading" | "authorized" | "unauthorized" | "wrongRole"
  const [redirectTo, setRedirectTo] = useState("/");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthState("unauthorized");
        setRedirectTo("/");
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
          setAuthState("unauthorized");
          setRedirectTo("/");
          return;
        }
        const role = userDoc.data().role;
        if (!allowedRoles || allowedRoles.includes(role)) {
          setAuthState("authorized");
        } else {
          // Redirect to correct dashboard
          if (role === "student") setRedirectTo("/student");
          else if (role === "company") setRedirectTo("/company");
          else if (role === "admin") setRedirectTo("/admin");
          else setRedirectTo("/");
          setAuthState("wrongRole");
        }
      } catch (err) {
        console.error(err);
        setAuthState("unauthorized");
        setRedirectTo("/");
      }
    });
    return () => unsubscribe();
  }, [allowedRoles]);

  if (authState === "loading") {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #eef8ff 0%, #f8fbff 45%, #eefcfb 100%)"
      }}>
        <div style={{ textAlign: "center" }}>
          <div className="loading-spinner-large" style={{ margin: "0 auto 16px" }}></div>
          <p style={{ color: "#0878f9", fontWeight: 700, fontSize: "16px" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (authState === "unauthorized") return <Navigate to="/" replace />;
  if (authState === "wrongRole") return <Navigate to={redirectTo} replace />;

  return children;
}

export default ProtectedRoute;

