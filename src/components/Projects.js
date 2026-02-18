// src/pages/ProjectsPage.jsx
import React, { useState, useEffect } from "react";
import { Plus, Search, Loader } from "lucide-react";
import Layout from "./ui/Layout";
import Header from "./ui/Header";
import ProjectModal from "./modals/ProjectModal";
import ProjectCard from "./ui/ProjectCards";
import ConfirmationModal from "./modals/ConfirmationModal";
import AppModal from "./ui/AppModal";
import { useProjects } from "../hooks/useProjects";
import { projectsService } from "../firebase/projectsService";
import { authService } from "../firebase/auth";
import { useAuth } from "../context/AuthContext";
import useModal from "../hooks/useModal";

const ProjectsPage = () => {
  const { projects, loading, error } = useProjects();
  const { isAdmin } = useAuth();
  const { modalState, showModal, hideModal } = useModal();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: null,
    projectId: null
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Drag-and-drop order state ---
  const [orderedIds, setOrderedIds] = useState([]);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  // Sync Firestore updates into local order (preserves manual order,
  // appends new projects, removes deleted ones)
  useEffect(() => {
    if (!projects.length) return;
    const incomingIds = projects.map((p) => p.id);
    setOrderedIds((prev) => {
      if (!prev.length) return incomingIds;
      const kept = prev.filter((id) => incomingIds.includes(id));
      const added = incomingIds.filter((id) => !prev.includes(id));
      return [...kept, ...added];
    });
  }, [projects]);

  // Build display list: apply manual order first, then search filter
  const orderedProjects = orderedIds
    .map((id) => projects.find((p) => p.id === id))
    .filter(Boolean);

  const filteredProjects = orderedProjects.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Drag handlers ---
  const handleDragStart = (id) => setDraggedId(id);

  const handleDragOver = (e, id) => {
    e.preventDefault();
    if (id !== draggedId) setDragOverId(id);
  };

  const handleDragLeave = () => setDragOverId(null);

  const handleDrop = (targetId) => {
    setDragOverId(null);
    if (!draggedId || draggedId === targetId) return;
    setOrderedIds((prev) => {
      const next = [...prev];
      const from = next.indexOf(draggedId);
      const to = next.indexOf(targetId);
      next.splice(from, 1);
      next.splice(to, 0, draggedId);
      return next;
    });
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleAddProject = async (projectData) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) return;

      setIsProcessing(true);
      // Ensure current user is always in the team even if deselected in form
      const team = projectData.team?.length
        ? projectData.team
        : [currentUser.uid];
      await projectsService.createProject({
        ...projectData,
        team,
        status: 'active',
      }, currentUser.uid);

      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create project:', error);
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReopenProject = async (id) => {
    try {
      setIsProcessing(true);
      await projectsService.reopenProject(id);
      setConfirmModal({ open: false, type: null, projectId: null });
    } catch (error) {
      console.error('Failed to reopen project:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProjectAction = (id, type) => {
    if (!isAdmin) {
      const actionName = type === 'delete' ? 'delete' : type === 'reopen' ? 'reopen' : 'close';
      showModal({
        type: 'error',
        title: 'Access Denied',
        message: `Only admins can ${actionName} projects. Contact your administrator.`,
      });
      return;
    }
    setConfirmModal({ open: true, type, projectId: id });
  };

  const handleConfirmAction = () => {
    if (confirmModal.type === 'delete') {
      handleDeleteProject(confirmModal.projectId);
    } else if (confirmModal.type === 'close') {
      handleCloseProject(confirmModal.projectId);
    } else if (confirmModal.type === 'reopen') {
      handleReopenProject(confirmModal.projectId);
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
    <Layout>
      {({ toggleSidebar }) => (
        <>
          <Header onToggleSidebar={toggleSidebar}>
            <h1 className="text-2xl font-semibold text-slate-800">Projects</h1>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100
                    border border-blue-200 rounded-lg text-slate-600 placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="w-5 h-5 text-blue-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              <button
                onClick={() => {
                  if (!isAdmin) {
                    showModal({
                      type: 'error',
                      title: 'Access Denied',
                      message: 'Only admins can create projects. Contact your administrator to have a project created.',
                    });
                    return;
                  }
                  setIsModalOpen(true);
                }}
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

          <main className="p-4 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={(id) => handleProjectAction(id, 'delete')}
                  onClose={(id) => handleProjectAction(id, 'close')}
                  onReopen={(id) => handleProjectAction(id, 'reopen')}
                  isDragging={draggedId === project.id}
                  isDragOver={dragOverId === project.id}
                  onDragStart={() => handleDragStart(project.id)}
                  onDragOver={(e) => handleDragOver(e, project.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDrop(project.id)}
                  onDragEnd={handleDragEnd}
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

          <AppModal
            isOpen={modalState.isOpen}
            onClose={hideModal}
            type={modalState.type}
            title={modalState.title}
            message={modalState.message}
          />
        </>
      )}
    </Layout>
  );
};

export default ProjectsPage;