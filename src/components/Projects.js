// src/pages/ProjectsPage.jsx
import React, { useState } from "react";
import { Plus, Search, Loader } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "./ui/Header";
import ProjectModal from "./modals/ProjectModal";
import ProjectCard from "./ui/ProjectCards";
import ConfirmationModal from "./modals/ConfirmationModal";
import { useProjects } from "../hooks/useProjects";
import { projectsService } from "../firebase/projectsService";
import { authService } from "../firebase/auth";

const ProjectsPage = () => {
  const { projects, loading, error } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmModal, setConfirmModal] = useState({ 
    open: false, 
    type: null,
    projectId: null 
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Search functionality
  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProject = async (projectData) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) return;

      setIsProcessing(true);
      await projectsService.createProject({
        ...projectData,
        team: [currentUser.uid],
        status: 'active',
      }, currentUser.uid);
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create project:', error);
      // You could add toast notification here
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      setIsProcessing(true);
      await projectsService.deleteProject(id);
      setConfirmModal({ open: false, type: null, projectId: null });
    } catch (error) {
      console.error('Failed to delete project:', error);
      // You could add toast notification here
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseProject = async (id) => {
    try {
      setIsProcessing(true);
      await projectsService.closeProject(id);
      setConfirmModal({ open: false, type: null, projectId: null });
    } catch (error) {
      console.error('Failed to close project:', error);
      // You could add toast notification here
    } finally {
      setIsProcessing(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader className="w-6 h-6 text-blue-500 animate-spin" />
          <span className="text-slate-600">Loading projects...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-red-500">Error loading projects: {error}</div>
      </div>
    );
  }

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
              disabled={isProcessing}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 
                text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed"
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
          isProcessing={isProcessing}
        />

        <ConfirmationModal
          isOpen={confirmModal.open}
          onClose={() => setConfirmModal({ open: false, type: null, projectId: null })}
          onConfirm={handleConfirmAction}
          type={confirmModal.type}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
};

export default ProjectsPage;