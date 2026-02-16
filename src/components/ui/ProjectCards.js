// src/components/ProjectCard.jsx
import React, { useState } from "react";
import { Calendar, CheckCircle, Trash2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAllUsers } from "../../context/UsersContext";
import MoreButton from "./MoreButton";
import { AvatarGroup } from "./Avatar";

const ProjectCard = ({
  project,
  onDelete,
  onClose,
  onReopen,
  isProcessing,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}) => {
  const navigate = useNavigate();
  const { setCurrentProject } = useAuth();
  const { getUsersByIds } = useAllUsers();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  const {
    id,
    title,
    description,
    team = [],
    metrics = { completedTasks: 0, totalTasks: 0 },
    category = "development",
    dueDate,
    status,
  } = project;

  const teamMembers = getUsersByIds(team);

  // Calculate real progress based on tasks
  const calculateProgress = () => {
    if (!metrics.totalTasks) return 0;
    return Math.round((metrics.completedTasks / metrics.totalTasks) * 100) || 0;
  };

  const handleProjectSelect = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Don't navigate into completed projects — use the menu to reopen first
    if (status === "completed") return;

    try {
      if (isSelecting) return;
      setIsSelecting(true);

      await setCurrentProject(id);
      navigate(`/tasks/${id}/all`);
    } catch (error) {
      console.error("Failed to select project:", error);
    } finally {
      setIsSelecting(false);
    }
  };

  const handleMenuAction = (actionFn, projectId) => async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsMenuOpen(false);
      await actionFn(projectId);
    } catch (error) {
      console.error("Failed to perform action:", error);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getCategoryColor = (category) => {
    const colors = {
      development: "bg-blue-50 text-blue-600",
      design: "bg-purple-50 text-purple-600",
      marketing: "bg-green-50 text-green-600",
      research: "bg-amber-50 text-amber-600",
    };
    return colors[category] || "bg-slate-50 text-slate-600";
  };

  const getStatusColor = () => {
    const colors = {
      active: "bg-green-50 text-green-600",
      completed: "bg-blue-50 text-blue-600",
      archived: "bg-slate-50 text-slate-600",
    };
    return colors[status] || colors.active;
  };

  // Get task metrics description
  const getMetricsDescription = () => {
    if (!metrics.totalTasks) return "No tasks yet";
    return `${metrics.completedTasks}/${metrics.totalTasks} tasks`;
  };

  // Calculate days left
  const getDaysLeft = () => {
    if (!dueDate) return "No deadline";
    const due = new Date(dueDate);
    const today = new Date();
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `${diff} days left` : "Overdue";
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(e);
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        onDrop?.();
      }}
      onDragEnd={onDragEnd}
      onClick={handleProjectSelect}
      className={`w-full bg-white rounded-[32px] p-6
    ${status !== "completed" ? "hover:shadow-lg hover:translate-y-[-2px]" : ""}
    transition-all duration-300 ease-in-out
    ${status === "completed" ? "cursor-default" : "cursor-grab active:cursor-grabbing"} group relative
    ${isDragging ? "opacity-40 scale-95" : ""}
    ${isDragOver ? "ring-2 ring-blue-400 ring-offset-2 scale-[1.02] shadow-lg" : ""}
    ${isSelecting || isProcessing ? "opacity-75 pointer-events-none" : ""}
    ${status === "completed" ? "bg-slate-50 opacity-75" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3
            className="text-lg font-semibold text-slate-800 mb-1 
            group-hover:text-blue-600 transition-colors"
          >
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full ${getCategoryColor(
                category
              )}`}
            >
              {category}
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor()}`}
            >
              {status}
            </span>
          </div>
        </div>
        <div className="relative">
          <MoreButton isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMenuOpen(false);
                }}
              />
              <div className="absolute right-0 mt-1 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  {status !== "completed" && (
                    <button
                      onClick={handleMenuAction(onClose, id)}
                      className="flex w-full items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
                      disabled={isProcessing}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Project
                    </button>
                  )}
                  {status === "completed" && (
                    <button
                      onClick={handleMenuAction(onReopen, id)}
                      className="flex w-full items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                      disabled={isProcessing}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reopen Project
                    </button>
                  )}
                  <button
                    onClick={handleMenuAction(onDelete, id)}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    disabled={isProcessing}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Project
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-500 mb-6 line-clamp-2">{description}</p>

      {/* Progress Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">
              {getMetricsDescription()}
            </span>
            <span className="text-sm font-medium text-slate-800">
              {calculateProgress()}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(
                calculateProgress()
              )} rounded-full 
                transition-all duration-300 ease-out`}
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between">
        {teamMembers.length > 0 && (
          <AvatarGroup users={teamMembers} max={5} />
        )}
        <div className="flex items-center">
          <Calendar className="w-3 h-3 text-pink-500 mr-1" />
          <span className="text-xs text-pink-600">{getDaysLeft()}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
