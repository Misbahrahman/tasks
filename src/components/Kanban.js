import React, { useState } from "react";
import {Plus} from "lucide-react";
import Sidebar from "./Sidebar";
import { Avatar } from "./ui/Avatar";
import TaskModal from "./modals/TaskModal";
import Header from "./ui/Header";
import TaskCard from "./ui/TaskCard";
import TaskDetailModal from "./ui/TaskDetailModal";

// Update the AvatarGroup component to use the color palette
const AvatarGroup = ({ users }) => {
  return (
    <div className="flex -space-x-2">
      {users.map((user, index) => (
        <Avatar
          key={user}
          initials={user}
          gradientFrom={"blue-500"}
          gradientTo={"blue-600"}
        />
      ))}
    </div>
  );
};

// TaskColumn component with drop functionality
const TaskColumn = ({
  title,
  tasks,
  columnId,
  count,
  onDrop,
  onDeleteTask,
  setSelectedTask,
  setIsTaskDetailModalOpen,
}) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isOver) {
      setIsOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      onDrop(data.taskId, data.sourceColumnId, columnId);
    } catch (err) {
      console.error("Error processing drop:", err);
    }
  };

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
            {count}
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
};

// Main Kanban component
const Kanban = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  
  const [selectedtask, setSelectedTask] = useState(null);

  // Initialize tasks with IDs
  const initialTasks = {
    todo: [
      {
        id: "1",
        title: "Homepage Design",
        description: "Create main landing page layout and components",
        assignees: ["JD", "SK"],
        priority: "high",
        dueDate: "2024-12-20",
      },
      // ... other todo tasks with IDs
    ],
    inProgress: [
      {
        id: "4",
        title: "Navigation Menu",
        description: "Implement responsive navigation components",
        assignees: ["AM"],
        priority: "medium",
        dueDate: "2024-12-18",
      },
      // ... other inProgress tasks with IDs
    ],
    done: [
      {
        id: "6",
        title: "User Research",
        description: "Analyze user feedback and requirements",
        assignees: ["SK", "JD"],
        priority: "medium",
        dueDate: "2024-12-10",
      },
      // ... other done tasks with IDs
    ],
  };

  const [tasks, setTasks] = useState(initialTasks);

  const handleDeleteTask = (taskId, columnId) => {
    setTasks((prevTasks) => ({
      ...prevTasks,
      [columnId]: prevTasks[columnId].filter((task) => task.id !== taskId),
    }));
  };

  const handleDrop = (taskId, sourceColumnId, targetColumnId) => {
    if (sourceColumnId === targetColumnId) return;

    setTasks((prevTasks) => {
      // Find the task in the source column
      const task = prevTasks[sourceColumnId].find((t) => t.id === taskId);
      if (!task) return prevTasks;

      // Remove task from source column
      const sourceColumn = prevTasks[sourceColumnId].filter(
        (t) => t.id !== taskId
      );

      // Add task to target column
      const targetColumn = [...prevTasks[targetColumnId], task];

      return {
        ...prevTasks,
        [sourceColumnId]: sourceColumn,
        [targetColumnId]: targetColumn,
      };
    });
  };

  const handleAddTask = (newTask) => {
    const taskWithId = {
      ...newTask,
      id: Date.now().toString(), // Generate unique ID
    };
    setTasks((prevTasks) => ({
      ...prevTasks,
      todo: [...prevTasks.todo, taskWithId],
    }));
  };
  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Project Header */}

        <Header>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Website Redesign
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              A project by Design Team
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </button>
            <AvatarGroup users={["JD", "AM", "SK"]} />
          </div>
        </Header>

        {/* Task Columns with Drag and Drop */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="flex gap-8">
            <TaskColumn
              title="To Do"
              tasks={tasks.todo}
              columnId="todo"
              count={tasks.todo.length}
              onDrop={handleDrop}
              onDeleteTask={handleDeleteTask}
              setSelectedTask={setSelectedTask}
              setIsTaskDetailModalOpen={setIsTaskDetailModalOpen}
            />
            <TaskColumn
              title="In Progress"
              tasks={tasks.inProgress}
              columnId="inProgress"
              count={tasks.inProgress.length}
              onDrop={handleDrop}
              setSelectedTask={setSelectedTask}
              setIsTaskDetailModalOpen={setIsTaskDetailModalOpen}
            />
            <TaskColumn
              title="Done"
              tasks={tasks.done}
              columnId="done" 
              count={tasks.done.length}
              onDrop={handleDrop}
              setSelectedTask={setSelectedTask}
              setIsTaskDetailModalOpen={setIsTaskDetailModalOpen}
            />
          </div>
        </main>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTask}
      />

      <TaskDetailModal
        isOpen={isTaskDetailModalOpen}
        onClose={() => setIsTaskDetailModalOpen(false)}
        task={selectedtask}
      />
    </div>
  );
};

export default Kanban;
