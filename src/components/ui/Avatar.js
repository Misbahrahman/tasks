
export const Avatar = ({ initials, gradientFrom, gradientTo, size = 'md' }) => {
    const sizeClasses = {
      sm: 'w-7 h-7 text-xs',
      md: 'w-9 h-9 text-sm',
      lg: 'w-10 h-10 text-sm'
    };
  
    return (
      <div 
        className={`${sizeClasses[size]} rounded-full border-2 border-white flex items-center justify-center font-medium text-white shadow-sm bg-gradient-to-br from-${gradientFrom} to-${gradientTo}`}
      >
        {initials}
      </div>
    );
  };