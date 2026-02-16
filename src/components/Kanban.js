import React, { useState, useCallback, memo, useMemo } from "react";
import { Plus, Loader, Search, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import TaskModal from "./modals/TaskModal";
import Header from "./ui/Header";
import TaskCard from "./ui/TaskCard";
import TaskDetailModal from "./ui/TaskDetailModal";
import AppModal from "./ui/AppModal";
import { useTasks } from "../hooks/useTasks";
import { taskService } from "../firebase/taskService";
import { useAuth } from "../context/AuthContext";
import { useAllUsers } from "../context/UsersContext";
import projectsService from "../firebase/projectsService";
import { authService } from "../firebase/auth";
import FilterDropdown from "./ui/DropdownFilter";
import useProjects from "../hooks/useProjects";
import useModal from "../hooks/useModal";
import useDebounce from "../hooks/useDebounce";

const ProjectHeader = memo(({ project }) => (
  <div>
    <h1 className="text-2xl font-semibold text-slate-800">{project.title}</h1>
    <p className="text-sm text-slate-500 mt-1">{project.description}</p>
  </div>
));

ProjectHeader.displayName = "ProjectHeader";

const TaskColumn = memo(
  ({ title, tasks = [], columnId, projectId, onDeleteTask, onTaskSelect, searchActive }) => {
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
            {tasks.length === 0 && searchActive && (
              <div className="flex flex-col items-center py-8 text-center">
                <Search className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm text-slate-400">No matching tasks</p>
              </div>
            )}
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
  const { userData, isAdmin } = useAuth();
  const { projects } = useProjects();
  const currentUser = authService.getCurrentUser();
  const { modalState, showModal, hideModal } = useModal();
  const { users } = useAllUsers();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId);
  const [selectedUserId, setSelectedUserId] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 200);
  const {
    tasks,
    loading,
    error,
    currentProjectId,
    project,
    userDetails: user,
  } = useTasks(selectedProjectId, viewType, selectedUserId);

  const filteredTasks = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return tasks;
    const match = (t) =>
      t.title?.toLowerCase().includes(term) ||
      t.description?.toLowerCase().includes(term);
    return {
      todo: tasks.todo.filter(match),
      inProgress: tasks.inProgress.filter(match),
      done: tasks.done.filter(match),
    };
  }, [tasks, debouncedSearch]);

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

  const handleProjectChange = useCallback((changedProject) => {
    setSelectedProjectId(changedProject);
  }, []);

  const handleUserChange = useCallback((changedUser) => {
    setSelectedUserId(changedUser);
  }, []);

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
        const oldStatus = await taskService.updateTaskStatus(taskId, newStatus, currentUser.uid);
        // Update project metrics if a real project is selected
        const pid = selectedProjectId;
        if (pid && pid !== 0 && pid !== '0') {
          if (newStatus === 'done') {
            await projectsService.updateProjectMetrics(pid, 'STATUS_CHANGE', 'done');
          } else if (oldStatus === 'done') {
            await projectsService.updateProjectMetrics(pid, 'STATUS_CHANGE', 'from_done');
          }
        }
      } catch (error) {
        console.error("Failed to update status:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser?.uid, selectedProjectId]
  );

  const handleDeleteTask = useCallback(
    async (taskId, currentStatus) => {
      if (!currentUser?.uid) return;
      if (!isAdmin) {
        showModal({
          type: 'error',
          title: 'Access Denied',
          message: 'Only admins can delete tasks. Contact your administrator if this needs to be removed.',
        });
        return;
      }
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
    [selectedProjectId, currentUser?.uid, isAdmin, showModal]
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
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-52 pl-9 pr-8 py-2 bg-gradient-to-r from-blue-50 to-blue-100
                  border border-blue-200 rounded-lg text-sm text-slate-600 placeholder-slate-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <FilterDropdown
              text={project ? project.title : "Select Project"}
              elements={[{ name: "All Projects", id: 0 }, ...projects]}
              onChange={handleProjectChange}
              selectedValue={selectedProjectId}
            />

            {viewType === "all" && (
              <FilterDropdown
                text={user ? user.name : "Select User"}
                elements={[{ name: "All Users", id: 0 }, ...users]}
                onChange={handleUserChange}
                selectedValue={selectedUserId}
              />
            )}

            <button
              onClick={() => {
                if (!isAdmin) {
                  showModal({
                    type: 'error',
                    title: 'Access Denied',
                    message: 'Only admins can create tasks. Contact your administrator to have a task created.',
                  });
                  return;
                }
                setIsCreateModalOpen(true);
              }}
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
                tasks={filteredTasks[status]}
                columnId={status}
                projectId={selectedProjectId}
                onDeleteTask={handleDeleteTask}
                onTaskSelect={handleTaskSelect}
                searchActive={debouncedSearch.trim().length > 0}
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
          taskId={selectedTask?.id}
          onTaskUpdate={handleUpdateTask}
          onNoteAdd={handleAddComment}
          onStatusChange={handleStatusChange}
        />

        <AppModal
          isOpen={modalState.isOpen}
          onClose={hideModal}
          type={modalState.type}
          title={modalState.title}
          message={modalState.message}
        />
      </div>
    </div>
  );
};

export default memo(Kanban);
