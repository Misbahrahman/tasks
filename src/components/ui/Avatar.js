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
  className = '',
  name  // Add name prop
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-10 h-10 text-sm'
  };

  const colorConfig = AVATAR_COLOR_MAP[avatarColor] || AVATAR_COLOR_MAP.blue;

  return (
    <div className="group relative">
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
      >
        {initials}
      </div>
      
      {/* Tooltip */}
      {name && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 
          text-xs font-medium text-white bg-gray-900 rounded-md opacity-0 invisible
          group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
          {name}
          {/* Tooltip Arrow */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 
            border-4 border-transparent border-t-gray-900" />
        </div>
      )}
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
          name={user.name}  // Pass name to Avatar
          className="hover:z-10 transition-transform hover:scale-110"
        />
      ))}
      {remaining > 0 && (
        <div className="group relative">
          <div className="w-7 h-7 flex items-center justify-center text-xs font-medium 
            text-white bg-gray-400 rounded-full border-2 border-white 
            hover:z-10 transition-transform hover:scale-110">
            +{remaining}
          </div>
          {/* Tooltip for remaining count */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 
            text-xs font-medium text-white bg-gray-900 rounded-md opacity-0 invisible
            group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
            {remaining} more {remaining === 1 ? 'user' : 'users'}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 
              border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Avatar;