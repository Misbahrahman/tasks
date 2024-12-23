// import logo from './logo.svg';
import "./App.css";
import Kanban from "./components/Kanban";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProjectsPage from "./components/Projects";
import ProfilePage from "./components/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProjectsPage />} />
          <Route path="/tasks" element={<Kanban />} />
          <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


// import "./App.css";
// import Kanban from "./components/Kanban";
// import ProjectsPage from "./components/Projects";
// import ProfilePage from "./components/Profile";
// import LoginPage from "./components/Login"; // Add a login component
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { useState } from "react";

// function ProtectedRoute({ children, isAuthenticated }) {
//   return isAuthenticated ? children : <Navigate to="/login" replace />;
// }

// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   // Mock login function for demo purposes
//   const handleLogin = () => setIsAuthenticated(true);

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
//         <Route
//           path="/"
//           element={
//             <ProtectedRoute isAuthenticated={isAuthenticated}>
//               <ProjectsPage />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/tasks"
//           element={
//             <ProtectedRoute isAuthenticated={isAuthenticated}>
//               <Kanban />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/profile"
//           element={
//             <ProtectedRoute isAuthenticated={isAuthenticated}>
//               <ProfilePage />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
