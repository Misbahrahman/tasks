// pages/ProjectsPage.jsx
import React, { useState } from "react";
import { Plus, Search,} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "./ui/Header";
import ProjectModal from "./modals/ProjectModal";
import ProjectCard from "./ui/ProjectCards";
import ConfirmationModal from "./modals/ConfirmationModal";


const ProjectsPage = () => {
  let dummyProjects = [
    {
      id: 1,
      title: "Website Redesign",
      description:
        "Complete overhaul of the company's main website with modern design principles and improved user experience",
      progress: 75,
      metricsDescription: "15/20 tasks",
      daysLeft: "7 days",
      category: "design",
      team: ["JD", "AM", "SK"],
    },
    {
      id: 2,
      title: "Mobile App Development",
      description:
        "Building a cross-platform mobile application for customer engagement and service delivery",
      progress: 45,
      metricsDescription: "9/20 tasks",
      daysLeft: "14 days",
      category: "development",
      team: ["RB", "JD", "MP"],
    },
    {
      id: 3,
      title: "Brand Campaign",
      description:
        "Q4 marketing campaign focusing on brand awareness and market penetration strategies",
      progress: 90,
      metricsDescription: "18/20 tasks",
      daysLeft: "3 days",
      category: "marketing",
      team: ["EW", "AM"],
    },
    {
      id: 4,
      title: "User Research",
      description:
        "Conducting comprehensive user research to identify pain points and opportunities in current product",
      progress: 30,
      metricsDescription: "6/20 tasks",
      daysLeft: "21 days",
      category: "research",
      team: ["SK", "EW", "MP"],
    },
    {
      id: 5,
      title: "Payment Integration",
      description:
        "Implementing new payment gateway and improving checkout process for better conversion",
      progress: 60,
      metricsDescription: "12/20 tasks",
      daysLeft: "10 days",
      category: "development",
      team: ["RB", "JD"],
    },
    {
      id: 6,
      title: "Product Analytics",
      description:
        "Setting up advanced analytics and tracking for better understanding of user behavior",
      progress: 85,
      metricsDescription: "17/20 tasks",
      daysLeft: "5 days",
      category: "research",
      team: ["MP", "SK", "AM"],
    },
    {
      id: 7,
      title: "Email Templates",
      description:
        "Designing and developing responsive email templates for marketing campaigns",
      progress: 40,
      metricsDescription: "8/20 tasks",
      daysLeft: "12 days",
      category: "design",
      team: ["AM", "EW"],
    },
    {
      id: 8,
      title: "SEO Optimization",
      description:
        "Implementing SEO best practices and improving search engine rankings",
      progress: 70,
      metricsDescription: "14/20 tasks",
      daysLeft: "8 days",
      category: "marketing",
      team: ["JD", "SK", "MP"],
    },
  ];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState(dummyProjects);
  const [confirmModal, setConfirmModal] = useState({ 
    open: false, 
    type: null,
    projectId: null 
  });

  // Search functionality
  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProject = (newProject) => {
    const projectWithId = {
      ...newProject,
      id: Date.now()
    };
    setProjects((prevProjects) => [...prevProjects, projectWithId]);
    setIsModalOpen(false);
  };

  const handleDeleteProject = (id) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  const handleCloseProject = (id) => {
    // Implement close project logic here
    console.log('Closing project:', id);
  };

  const handleProjectAction = (id, type) => {
    setConfirmModal({ 
      open: true, 
      type, 
      projectId: id 
    });
  };

  const handleConfirmAction = () => {
    if (confirmModal.type === 'delete') {
      handleDeleteProject(confirmModal.projectId);
    } else if (confirmModal.type === 'close') {
      handleCloseProject(confirmModal.projectId);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0">
        <Header>
          <h1 className="text-2xl font-semibold text-slate-800">Projects</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 
                  border border-blue-200 rounded-lg text-slate-600 placeholder-slate-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="w-5 h-5 text-blue-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 
                text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </button>
          </div>
        </Header>

        <main className="p-8">
          <div className="flex flex-wrap gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id} 
                project={project}
                onDelete={(id) => handleProjectAction(id, 'delete')}
                onClose={(id) => handleProjectAction(id, 'close')}
              />
            ))}
            {filteredProjects.length === 0 && (
              <div className="w-full text-center py-8">
                <p className="text-slate-500">
                  {searchTerm 
                    ? `No projects found matching "${searchTerm}"`
                    : "No projects yet. Click 'Add Project' to create your first project."
                  }
                </p>
              </div>
            )}
          </div>
        </main>

        <ProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddProject}
        />

        <ConfirmationModal
          isOpen={confirmModal.open}
          onClose={() => setConfirmModal({ open: false, type: null, projectId: null })}
          onConfirm={handleConfirmAction}
          type={confirmModal.type}
        />
      </div>
    </div>
  );
};

export default ProjectsPage;