import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Jobs from "./pages/Jobs";
import PostJob from "./pages/PostJob";
import Applicants from "./pages/Applicants";
import MyApplications from "./pages/MyApplications";
import ApplyJob from "./pages/ApplyJob";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* STUDENT ONLY */}
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/jobs" element={
          <ProtectedRoute allowedRoles={["student"]}>
            <Jobs />
          </ProtectedRoute>
        } />
        <Route path="/apply/:jobId" element={
          <ProtectedRoute allowedRoles={["student"]}>
            <ApplyJob />
          </ProtectedRoute>
        } />
        <Route path="/my-applications" element={
          <ProtectedRoute allowedRoles={["student"]}>
            <MyApplications />
          </ProtectedRoute>
        } />

        {/* COMPANY ONLY */}
        <Route path="/company" element={
          <ProtectedRoute allowedRoles={["company"]}>
            <CompanyDashboard />
          </ProtectedRoute>
        } />
        <Route path="/post-job" element={
          <ProtectedRoute allowedRoles={["company"]}>
            <PostJob />
          </ProtectedRoute>
        } />
        <Route path="/applicants" element={
          <ProtectedRoute allowedRoles={["company"]}>
            <Applicants />
          </ProtectedRoute>
        } />

        {/* ADMIN ONLY */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
