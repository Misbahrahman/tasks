import React, { useState, useCallback, memo } from "react";
import { Plus, Loader } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import TaskModal from "./modals/TaskModal";
import Header from "./ui/Header";
import TaskCard from "./ui/TaskCard";
import TaskDetailModal from "./ui/TaskDetailModal";
import { useTasks } from "../hooks/useTasks";
import { taskService } from "../firebase/taskService";
import { useUser, useUsers } from "../hooks/useUser";
import projectsService from "../firebase/projectsService";
import { authService } from "../firebase/auth";
import FilterDropdown from "./ui/DropdownFilter";
import useProjects from "../hooks/useProjects";

const ProjectHeader = memo(({ project }) => (
  <div>
    <h1 className="text-2xl font-semibold text-slate-800">{project.title}</h1>
    <p className="text-sm text-slate-500 mt-1">{project.description}</p>
  </div>
));

ProjectHeader.displayName = "ProjectHeader";

const TaskColumn = memo(
  ({ title, tasks = [], columnId, projectId, onDeleteTask, onTaskSelect }) => {
    const [isOver, setIsOver] = useState(false);

    const handleDragOver = useCallback((e) => {
      e.preventDefault();
      setIsOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
      setIsOver(false);
    }, []);

    const handleDrop = useCallback(
      async (e) => {
        e.preventDefault();
        setIsOver(false);

        try {
          const { taskId, sourceColumnId } = JSON.parse(
            e.dataTransfer.getData("text/plain")
          );

          if (sourceColumnId !== columnId) {
            const currentUser = authService.getCurrentUser();
            await taskService.updateTaskStatus(
              taskId,
              columnId,
              currentUser?.uid
            );

            if (columnId === "done") {
              await projectsService.updateProjectMetrics(
                projectId,
                "STATUS_CHANGE",
                "done"
              );
            } else if (sourceColumnId === "done") {
              await projectsService.updateProjectMetrics(
                projectId,
                "STATUS_CHANGE",
                "from_done"
              );
            }
          }
        } catch (err) {
          console.error("Error updating task status:", err);
        }
      },
      [columnId, projectId]
    );

    return (
      <div
        className={`flex-1 flex flex-col bg-white rounded-2xl shadow-sm
          ${isOver ? "ring-2 ring-blue-400 ring-opacity-50" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-slate-800">{title}</h2>
            <span
              className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 
              px-2.5 py-1 rounded-lg text-sm font-medium"
            >
              {tasks.length}
            </span>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                {...task}
                columnId={columnId}
                onDelete={() => onDeleteTask(task.id, columnId)}
                onClick={() => onTaskSelect(task)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);

TaskColumn.displayName = "TaskColumn";

const Kanban = ({ viewType }) => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { userData } = useUser();
  const { projects, projectsLoading, projectsError } = useProjects();
  const currentUser = authService.getCurrentUser();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId);
  const [selectedUserId, setSelectedUserId] = useState(currentUser?.id);

  const { users, loadingUsers, usersError } = useUsers();
  const {
    tasks,
    loading,
    error,
    currentProjectId,
    project,
    userDetails: user,
  } = useTasks(selectedProjectId, viewType, selectedUserId);

  const handleTaskSelect = useCallback((task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  }, []);

  const handleUpdateTask = useCallback(
    async (taskId, updates) => {
      if (!currentUser?.uid) return;
      try {
        setIsLoading(true);
        await taskService.updateTask(taskId, updates, currentUser.uid);
      } catch (error) {
        console.error("Failed to update task:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser?.uid]
  );

  const handleProjectChange = (changedProject) => {
    setSelectedProjectId(changedProject);
  };

  const handleUserChange = (changedUser) => {
    setSelectedUserId(changedUser);
  };

  const handleAddComment = useCallback(
    async (taskId, commentData) => {
      if (!currentUser?.uid) return;
      try {
        setIsLoading(true);
        await taskService.addComment(taskId, commentData, currentUser.uid);
      } catch (error) {
        console.error("Failed to add comment:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser?.uid]
  );

  const handleStatusChange = useCallback(
    async (taskId, newStatus) => {
      if (!currentUser?.uid) return;
      try {
        setIsLoading(true);
        await taskService.updateTaskStatus(taskId, newStatus, currentUser.uid);
      } catch (error) {
        console.error("Failed to update status:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser?.uid]
  );

  const handleDeleteTask = useCallback(
    async (taskId, currentStatus) => {
      if (!currentUser?.uid) return;
      try {
        setIsLoading(true);
        await taskService.deleteTask(taskId, currentUser.uid);
        await projectsService.updateProjectMetrics(
          selectedProjectId,
          "DELETE_TASK",
          currentStatus
        );
      } catch (error) {
        console.error("Failed to delete task:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedProjectId, currentUser?.uid]
  );

  const handleDetailModalClose = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedTask(null);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader className="w-6 h-6 text-blue-500 animate-spin" />
          <span className="text-slate-600">Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!currentProjectId) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Please select a project first</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0">
        <Header>
          <div>
            {project ? (
              <ProjectHeader project={project} />
            ) : (
              <>
                <h1 className="text-2xl font-semibold text-slate-800">
                  {viewType === "my-tasks" ? "My Tasks" : "All Tasks"}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  {viewType === "my-tasks"
                    ? "View and manage your assigned tasks"
                    : "View all project tasks"}
                </p>
              </>
            )}
          </div>
          {/* Top-right controls */}
          <div className="flex items-center space-x-4">
            <FilterDropdown
              text={project ? project.title : "Select Project"}
              elements={[{ name: "All Projects", id: 0 }, ...projects]}
              onChange={handleProjectChange}
              selectedValue={selectedProjectId} // Ensure correct default selection
            />

            {viewType === "all" && (
              <FilterDropdown
                text={user ? user.name : "Select User"}
                elements={[{ name: "All Users", id: 0 }, ...users]}
                onChange={handleUserChange}
                selectedValue={selectedUserId} // Ensure correct default selection
              />
            )}

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </button>
          </div>
        </Header>

        <main className="flex-1 p-8 overflow-auto">
          <div className="flex gap-8">
            {["todo", "inProgress", "done"].map((status) => (
              <TaskColumn
                key={status}
                title={
                  status === "todo"
                    ? "To Do"
                    : status === "inProgress"
                    ? "In Progress"
                    : "Done"
                }
                tasks={tasks[status]}
                columnId={status}
                projectId={selectedProjectId}
                onDeleteTask={handleDeleteTask}
                onTaskSelect={handleTaskSelect}
              />
            ))}
          </div>
        </main>

        {/* Create Task Modal */}
        <TaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          projectId={selectedProjectId}
        />

        <TaskDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleDetailModalClose}
          taskId={selectedTask?.id} // Changed from passing full task object
          onTaskUpdate={handleUpdateTask}
          onNoteAdd={handleAddComment}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
};

export default memo(Kanban);
