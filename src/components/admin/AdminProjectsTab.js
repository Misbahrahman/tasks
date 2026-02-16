import React, { useState } from 'react';
import { CheckCircle, RefreshCw, Trash2 } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { projectsService } from '../../firebase/projectsService';
import ConfirmationModal from '../modals/ConfirmationModal';
import AppModal from '../ui/AppModal';
import useModal from '../../hooks/useModal';

const AdminProjectsTab = () => {
  const { projects, loading } = useProjects();
  const { modalState, showModal, hideModal } = useModal();
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, projectId: null });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async () => {
    const { type, projectId } = confirmModal;
    try {
      setIsProcessing(true);
      if (type === 'delete') await projectsService.deleteProject(projectId);
      else if (type === 'close') await projectsService.closeProject(projectId);
      else if (type === 'reopen') await projectsService.reopenProject(projectId);
      setConfirmModal({ open: false, type: null, projectId: null });
    } catch (err) {
      showModal({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const getProgress = (p) => {
    const total = p.metrics?.totalTasks || 0;
    const done = p.metrics?.completedTasks || 0;
    if (!total) return 0;
    return Math.round((done / total) * 100);
  };

  const getProgressColor = (pct) => {
    if (pct >= 75) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-blue-500';
    if (pct >= 25) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[32px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Project</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Tasks</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Progress</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {projects.map(project => {
                const progress = getProgress(project);
                const total = project.metrics?.totalTasks || 0;
                const done = project.metrics?.completedTasks || 0;
                const isCompleted = project.status === 'completed';
                return (
                  <tr key={project.id} className={`hover:bg-slate-50 transition-colors ${isCompleted ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-sm font-medium text-slate-700">{project.title}</span>
                        {project.description && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{project.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                        ${isCompleted ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {project.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{done}/{total}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getProgressColor(progress)} transition-all duration-300`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {!isCompleted && (
                          <button
                            onClick={() => setConfirmModal({ open: true, type: 'close', projectId: project.id })}
                            disabled={isProcessing}
                            title="Complete project"
                            className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {isCompleted && (
                          <button
                            onClick={() => setConfirmModal({ open: true, type: 'reopen', projectId: project.id })}
                            disabled={isProcessing}
                            title="Reopen project"
                            className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmModal({ open: true, type: 'delete', projectId: project.id })}
                          disabled={isProcessing}
                          title="Delete project"
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {projects.length === 0 && (
          <div className="text-center py-8 text-slate-400">No projects found</div>
        )}
      </div>

      <ConfirmationModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: null, projectId: null })}
        onConfirm={handleAction}
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
    </div>
  );
};

export default AdminProjectsTab;
