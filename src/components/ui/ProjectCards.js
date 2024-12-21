// components/ProjectCard.jsx
import React, { useState } from 'react';
import { Calendar, CheckCircle, Trash2 } from 'lucide-react';
import MoreButton from './MoreButton';
import { SelectedAssignees } from './AssignEmployee';

const ProjectCard = ({ 
  project, 
  onEdit, 
  onDelete,
  onClose,
  onClick 
}) => {
  const { 
    id,
    title, 
    description, 
    progress, 
    team,
    daysLeft,
    metricsDescription,
    category
  } = project;

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getCategoryColor = (category) => {
    const colors = {
      development: 'bg-blue-50 text-blue-600',
      design: 'bg-purple-50 text-purple-600',
      marketing: 'bg-green-50 text-green-600',
      research: 'bg-amber-50 text-amber-600'
    };
    return colors[category] || 'bg-slate-50 text-slate-600';
  };

  return (
    <div 
      onClick={onClick}
      className="w-[380px] bg-white rounded-[32px] p-6 
        hover:shadow-lg transition-all duration-300 ease-in-out 
        hover:translate-y-[-2px] cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1 
            group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <span className={`text-xs px-2.5 py-1 rounded-full ${getCategoryColor(category)}`}>
            {category}
          </span>
        </div>
        <div className="relative">
          <MoreButton isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 mt-1 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(id);
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Project
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose(id);
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Close Project
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-500 mb-6 line-clamp-2">
        {description}
      </p>

      {/* Progress Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">{metricsDescription}</span>
            <span className="text-sm font-medium text-slate-800">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(progress)} rounded-full 
                transition-all duration-300 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between">
        {team && <SelectedAssignees assignees={team} />}
        <div className="flex items-center">
          <Calendar className="w-3 h-3 text-pink-500 mr-1" />
          <span className="text-xs text-pink-600">{daysLeft} left</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;