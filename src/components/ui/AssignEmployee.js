import React from 'react';
import { Avatar } from './Avatar';

const AssigneeSelect = ({
  assignees = [],
  onAssigneeChange,
  selectedAssignees = [],
  className = ''
}) => {
  // Default assignee options - you can also pass this as a prop if needed
  const assigneeOptions = [
    { id: 'JD', name: 'John Doe', role: 'Frontend Developer' },
    { id: 'AM', name: 'Alice Moore', role: 'UI Designer' },
    { id: 'SK', name: 'Sam King', role: 'Product Manager' },
    { id: 'RB', name: 'Rachel Brown', role: 'Backend Developer' },
    { id: 'MP', name: 'Mike Parker', role: 'QA Engineer' },
    { id: 'EW', name: 'Emma Wilson', role: 'UX Researcher' }
  ];

  const handleAssigneeChange = (assigneeId) => {
    if (selectedAssignees.includes(assigneeId)) {
      onAssigneeChange(selectedAssignees.filter(id => id !== assigneeId));
    } else {
      onAssigneeChange([...selectedAssignees, assigneeId]);
    }
  };

  return (
    <div className={`border border-slate-200 rounded-lg divide-y divide-slate-100 ${className}`}>
      {assigneeOptions.map((assignee) => (
        <label 
          key={assignee.id}
          className="flex items-center p-3 hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <input
            type="checkbox"
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            checked={selectedAssignees.includes(assignee.id)}
            onChange={() => handleAssigneeChange(assignee.id)}
          />
          <div className="ml-3 flex items-center space-x-3">
            <Avatar 
              initials={assignee.id}
              gradientFrom="blue-500"
              gradientTo="blue-600"
              size="sm"
            />
            <div>
              <div className="font-medium text-slate-700">{assignee.name}</div>
              <div className="text-sm text-slate-500">{assignee.role}</div>
            </div>
          </div>
        </label>
      ))}
    </div>
  );
};

// Selected Assignees display component
export const SelectedAssignees = ({ assignees = [] }) => {
  return (
    <div className="flex -space-x-2 hover:space-x-1 transition-all duration-300">
      {assignees.map((initials) => (
        <Avatar
          key={initials}
          initials={initials}
          gradientFrom="blue-500"
          gradientTo="blue-600"
          className="border-2 border-white hover:scale-110 hover:z-10 transition-transform duration-300"
          size="sm"
        />
      ))}
    </div>
  );
};

export default AssigneeSelect;