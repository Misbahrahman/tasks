// src/components/AssigneeSelect.jsx
import React from 'react';
import { Avatar } from './Avatar';
import { useUsers } from '../../hooks/useUser';

const AssigneeSelect = ({
  label,
  onAssigneeChange,
  selectedAssignees = [],
  className = ''
}) => {
  const { users, loading, error } = useUsers();

  const handleAssigneeChange = (assigneeId) => {
    if (selectedAssignees.includes(assigneeId)) {
      onAssigneeChange(selectedAssignees.filter(id => id !== assigneeId));
    } else {
      onAssigneeChange([...selectedAssignees, assigneeId]);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-slate-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        Error loading team members: {error}
      </div>
    );
  }

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}
      <div className={`border border-slate-200 rounded-lg divide-y divide-slate-100 ${className}`}>
        {users.map((user) => (
          <label 
            key={user.id}
            className="flex items-center p-3 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              checked={selectedAssignees.includes(user.id)}
              onChange={() => handleAssigneeChange(user.id)}
            />
            <div className="ml-3 flex items-center space-x-3">
              <Avatar 
                initials={user.initials || user.name.charAt(0)}
                gradientFrom="blue-500"
                gradientTo="blue-600"
                size="sm"
              />
              <div>
                <div className="font-medium text-slate-700">{user.name}</div>
                <div className="text-sm text-slate-500">{user.role}</div>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

// Selected Assignees display component
export const SelectedAssignees = ({ assignees = [] }) => {
  const { users, loading } = useUsers();

  if (loading) {
    return (
      <div className="flex -space-x-2">
        {[1, 2].map((n) => (
          <div 
            key={n}
            className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex -space-x-2 hover:space-x-1 transition-all duration-300">
      {assignees.map((userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return null;
        
        return (
          <Avatar
            key={userId}
            initials={user.initials || user.name.charAt(0)}
            gradientFrom="blue-500"
            gradientTo="blue-600"
            className="border-2 border-white hover:scale-110 hover:z-10 transition-transform duration-300"
            size="sm"
          />
        );
      })}
    </div>
  );
};

export default AssigneeSelect;