import React from 'react';
import { Avatar, AVATAR_COLOR_MAP } from './Avatar';
import { useUsers } from '../../hooks/useUser';

// Helper function to generate consistent avatar colors
const getAvatarColor = (name = '') => {
  const colors = Object.keys(AVATAR_COLOR_MAP);
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

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
        {users.map((user) => {
          const initials = user.name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return (
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
                  initials={initials}
                  avatarColor={user.avatarColor || getAvatarColor(user.name)}
                  name={user.name}
                  size="sm"
                />
                <div>
                  <div className="font-medium text-slate-700">{user.name}</div>
                  <div className="text-sm text-slate-500">{user.role}</div>
                </div>
              </div>
            </label>
          );
        })}
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

        const initials = user.name
          .split(' ')
          .map(part => part[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return (
          <Avatar
            key={userId}
            initials={initials}
            avatarColor={user.avatarColor || getAvatarColor(user.name)}
            name={user.name}
            size="sm"
            className="hover:z-10"
          />
        );
      })}
    </div>
  );
};

export default AssigneeSelect;