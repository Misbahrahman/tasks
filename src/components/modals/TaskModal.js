import { X } from "lucide-react";
import { useState } from "react";
import { Avatar } from "../ui/Avatar";
import BlueButton from "../ui/BlueButton";
import WhiteButton from "../ui/WhiteButton";
import AssigneeSelect from "../ui/AssignEmployee";
import { TextArea, TextInput } from "../ui/TextInput";

const TaskModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignees: [],
    priority: "medium",
    dueDate: "",
    touched: {}, // Track which fields have been touched
  });

  const handleBlur = (field) => {
    setFormData((prev) => ({
      ...prev,
      touched: {
        ...prev.touched,
        [field]: true,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800">
            Create New Task
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <TextInput
              id="task-title"
              label="Task Title"
              placeholder="Enter task title"
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
            />

            <TextArea
              id="task-description"
              label="Description"
              placeholder="Enter task description"
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
            />

            <div className="flex gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Priority
                </label>
                <select
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>
            </div>

            <AssigneeSelect
              selectedAssignees={formData.assignees}
              onAssigneeChange={(newAssignees) =>
                setFormData({ ...formData, assignees: newAssignees })
              }
            />

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <WhiteButton onClick={onClose} text={"Cancel"} />
              <BlueButton text={"Create Task"} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
