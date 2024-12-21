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
