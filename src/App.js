import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Kanban from "./components/Kanban";
import ProjectsPage from "./components/Projects";
import ProfilePage from "./components/Profile";
import LoginPage from "./components/Login";
import RegisterPage from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPanel from "./components/AdminPanel";

import { AuthProvider } from "./context/AuthContext";
import { UsersProvider } from "./context/UsersContext";
import { authService } from "./firebase/auth";

// 🔥 Firestore imports for TEMP admin setter
import { db } from "./firebase/config";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // =========================================================
  // 🔴 TEMPORARY ADMIN ROLE SETTER — DELETE AFTER RUNNING ONCE
  // =========================================================
  useEffect(() => {
    if (!user) return; // wait until login finishes

    const setAdminRole = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", "mrahman7749@gmail.com"));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0];
          await updateDoc(doc(db, "users", userDoc.id), {
            ROLE: "Admin",
            role: "Admin",
          });
          console.log("✅ Admin role set for mrahman7749@gmail.com");
        } else {
          console.log("❌ User not found in Firestore");
        }
      } catch (err) {
        console.error("Failed to set admin role:", err);
      }
    };

    setAdminRole();
  }, [user]);
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <AuthProvider>
      <UsersProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
            <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />

            <Route path="/" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
            <Route path="/tasks/:projectId/all" element={<ProtectedRoute><Kanban viewType="all" /></ProtectedRoute>} />
            <Route path="/tasks/:projectId/my-tasks" element={<ProtectedRoute><Kanban viewType="my-tasks" /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </UsersProvider>
    </AuthProvider>
  );
}

export default App;
