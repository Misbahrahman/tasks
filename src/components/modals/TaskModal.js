// src/components/modals/TaskModal.jsx
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import BlueButton from "../ui/BlueButton";
import WhiteButton from "../ui/WhiteButton";
import AssigneeSelect from "../ui/AssignEmployee";
import { TextArea, TextInput } from "../ui/TextInput";
import { taskService } from "../../firebase/taskService";
import { projectsService } from "../../firebase/projectsService";
import { authService } from "../../firebase/auth";

const EMPTY_FORM = {
  title: "",
  description: "",
  assignees: [],
  priority: "medium",
  dueDate: "",
};

const TaskModal = ({ isOpen, onClose, projectId, firestoreProjectId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});

  // Reset form every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(EMPTY_FORM);
      setTouched({});
    }
  }, [isOpen]);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !projectId) return;

      await taskService.createTask(projectId, {
        title: formData.title,
        description: formData.description,
        assignees: formData.assignees,
        priority: formData.priority,
        dueDate: formData.dueDate,
      }, currentUser.uid);

      // Use the Firestore doc ID for metrics (not the legacy stored id)
      await projectsService.updateProjectMetrics(firestoreProjectId || projectId, 'CREATE_TASK');
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center sm:justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800">
            Create New Task
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="overflow-y-auto p-4 sm:p-6 sm:max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <TextInput
              id="task-title"
              label="Task Title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              onBlur={() => handleBlur('title')}
              error={!formData.title && touched.title}
              helperText={!formData.title && touched.title ? "Title is required" : ""}
              required
              disabled={isSubmitting}
            />

            <TextArea
              id="task-description"
              label="Description"
              placeholder="Enter task description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              onBlur={() => handleBlur('description')}
              error={!formData.description && touched.description}
              helperText={!formData.description && touched.description ? "Description is required" : ""}
              required
              disabled={isSubmitting}
            />

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Priority
                </label>
                <select
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  disabled={isSubmitting}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div className="flex-1">
                <TextInput
                  id="task-due-date"
                  label="Due Date"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <AssigneeSelect
              selectedAssignees={formData.assignees}
              onAssigneeChange={(newAssignees) => setFormData({ ...formData, assignees: newAssignees })}
            />

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <WhiteButton
                onClick={onClose}
                text="Cancel"
                disabled={isSubmitting}
              />
              <BlueButton
                type="submit"
                text={isSubmitting ? "Creating..." : "Create Task"}
                disabled={isSubmitting}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
