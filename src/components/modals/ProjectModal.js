// src/components/modals/ProjectModal.jsx
import React, { useState } from "react";
import { X, Loader } from "lucide-react";
import { TextArea, TextInput } from "../ui/TextInput";
import WhiteButton from "../ui/WhiteButton";
import BlueButton from "../ui/BlueButton";
import AssigneeSelect from "../ui/AssignEmployee";
import { authService } from "../../firebase/auth";
import { useUsers, useUser } from "../../hooks/useUser";

const ProjectModal = ({ isOpen, onClose, onSubmit, isProcessing }) => {
  const { users, loading: loadingUsers, error: usersError } = useUsers();
  const { userData } = useUser();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    team: userData ? [userData.id] : [], // Add current user by default
    category: "development",
    startDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    touched: {},
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create a new project object with all required fields
    const newProject = {
      title: formData.title,
      description: formData.description,
      team: formData.team,
      category: formData.category,
      startDate: formData.startDate,
      dueDate: formData.dueDate,
      status: "active",
      progress: 0,
      metrics: {
        totalTasks: 0,
        completedTasks: 0,
      },
    };

    onSubmit(newProject);

    // Reset form data
    setFormData({
      title: "",
      description: "",
      team: [],
      category: "development",
      startDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      touched: {},
    });
  };

  const handleBlur = (field) => {
    setFormData((prev) => ({
      ...prev,
      touched: {
        ...prev.touched,
        [field]: true,
      },
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800">
            Create New Project
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-120px)]">
          {loadingUsers ? (
            <div className="flex justify-center items-center py-8">
              <Loader className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : usersError ? (
            <div className="text-red-500 text-center py-8">
              Error loading team members: {usersError}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <TextInput
                id="project-title"
                label="Project Title"
                placeholder="Enter project title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                onBlur={() => handleBlur("title")}
                error={!formData.title && formData.touched?.title}
                helperText={
                  !formData.title && formData.touched?.title
                    ? "Title is required"
                    : ""
                }
                required
              />

              <TextArea
                id="project-description"
                label="Description"
                placeholder="Enter project description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                onBlur={() => handleBlur("description")}
                error={!formData.description && formData.touched?.description}
                helperText={
                  !formData.description && formData.touched?.description
                    ? "Description is required"
                    : ""
                }
                required
              />

              <div className="flex gap-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category
                  </label>
                  <select
                    id="project-category"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="development">Development</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="research">Research</option>
                  </select>
                </div>
                <div className="flex-1">
                  <TextInput
                    id="project-due-date"
                    label="Due Date"
                    type="date"
                    min={formData.startDate} // Can't be before start date
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <AssigneeSelect
                label="Team Members"
                assigneeOptions={users.map((user) => ({
                  id: user.id,
                  name: user.name,
                  role: user.role,
                  initials: user.initials,
                }))}
                selectedAssignees={formData.team}
                onAssigneeChange={(newTeam) =>
                  setFormData({ ...formData, team: newTeam })
                }
              />

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <WhiteButton
                  text="Cancel"
                  onClick={onClose}
                  type="button"
                  disabled={isProcessing}
                />
                <BlueButton
                  text={isProcessing ? "Creating..." : "Create Project"}
                  type="submit"
                  disabled={isProcessing}
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
