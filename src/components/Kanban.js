import React, { useState, useCallback, memo } from "react";
import { Plus, Loader} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import TaskModal from "./modals/TaskModal";
import Header from "./ui/Header";
import TaskCard from "./ui/TaskCard";
import TaskDetailModal from "./ui/TaskDetailModal";
import { useTasks } from "../hooks/useTasks";
import { taskService } from "../firebase/taskService";
import { useUser } from "../hooks/useUser";



const ProjectHeader = memo(({ project }) => (
  <div>
    <h1 className="text-2xl font-semibold text-slate-800">
      {project.title}
    </h1>
    <p className="text-sm text-slate-500 mt-1">
      {project.description}
    </p>
  </div>
));

ProjectHeader.displayName = "ProjectHeader";

const TaskColumn = memo(
  ({
    title,
    tasks = [],
    columnId,
    onDeleteTask,
    setSelectedTask,
    setIsTaskDetailModalOpen,
  }) => {
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
            await taskService.updateTaskStatus(taskId, columnId);
          }
        } catch (err) {
          console.error("Error updating task status:", err);
        }
      },
      [columnId]
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
                onDelete={onDeleteTask}
                setSelectedTask={setSelectedTask}
                setIsTaskDetailModalOpen={setIsTaskDetailModalOpen}
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
  const { tasks, loading, error, currentProjectId, project } = useTasks(
    projectId,
    viewType === "my-tasks" ? userData?.uid : null
  );

  console.log(tasks, project);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleDeleteTask = useCallback(async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
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

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 
            text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </button>
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
                onDeleteTask={handleDeleteTask}
                setSelectedTask={setSelectedTask}
                setIsTaskDetailModalOpen={setIsTaskDetailModalOpen}
              />
            ))}
          </div>
        </main>

        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          projectId={currentProjectId}
        />

        <TaskDetailModal
          isOpen={isTaskDetailModalOpen}
          onClose={() => setIsTaskDetailModalOpen(false)}
          task={selectedTask}
        />
      </div>
    </div>
  );
};

export default memo(Kanban);
