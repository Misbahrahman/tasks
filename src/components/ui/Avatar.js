// src/components/ui/Avatar.jsx
import React from 'react';

export const AVATAR_COLOR_MAP = {
  teal: {
    fromColor: "from-teal-500",
    toColor: "to-teal-600"
  },
  cyan: {
    fromColor: "from-cyan-500",
    toColor: "to-cyan-600"
  },
  indigo: {
    fromColor: "from-indigo-500",
    toColor: "to-indigo-600"
  },
  fuchsia: {
    fromColor: "from-fuchsia-500",
    toColor: "to-fuchsia-600"
  },
  lime: {
    fromColor: "from-lime-500",
    toColor: "to-lime-600"
  },
  yellow: {
    fromColor: "from-yellow-500",
    toColor: "to-yellow-600"
  },
  blue: {
    fromColor: "from-blue-500",
    toColor: "to-blue-600"
  }
};

export const Avatar = ({ 
  initials, 
  avatarColor = 'blue',
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-10 h-10 text-sm'
  };

  const colorConfig = AVATAR_COLOR_MAP[avatarColor] || AVATAR_COLOR_MAP.blue;

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        border-2 
        border-white 
        flex 
        items-center 
        justify-center 
        font-medium 
        text-white 
        shadow-sm 
        bg-gradient-to-br 
        ${colorConfig.fromColor} 
        ${colorConfig.toColor}
        ${className}
      `}
      title={initials}
    >
      {initials}
    </div>
  );
};

export const AvatarGroup = ({ users = [], max = 3 }) => {
  const displayUsers = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex -space-x-2 hover:space-x-1 transition-all duration-300">
      {displayUsers.map((user) => (
        <Avatar
          key={user.id}
          initials={user.initials}
          avatarColor={user.avatarColor}
          size="sm"
          className="hover:z-10 transition-transform hover:scale-110"
        />
      ))}
      {remaining > 0 && (
        <div className="w-7 h-7 flex items-center justify-center text-xs font-medium 
          text-white bg-gray-400 rounded-full border-2 border-white 
          hover:z-10 transition-transform hover:scale-110">
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default Avatar;