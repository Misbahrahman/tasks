// src/components/ui/TaskCard.jsx
import React, { useState, useRef } from "react";
import { X, Calendar } from "lucide-react";
import MoreButton from "./MoreButton";
import { AvatarGroup } from "./Avatar";
import { useUserDetails } from "../../hooks/useUserDetails";

const TaskCard = ({
  id,
  title,
  description,
  assignees = [],
  priority,
  dueDate,
  status,
  comments = [],
  history = [],
  columnId,
  onDelete,
  onClick
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isDraggingRef = useRef(false);
  const isClickingMenuRef = useRef(false);
  const { users: assigneeUsers, loading: loadingUsers } = useUserDetails(assignees);
  
  const priorityStyles = {
    high: "bg-rose-50 text-rose-700 ring-rose-600/20",
    medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
    low: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  };

  // Check if task is overdue
  const isOverdue = () => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDueDate = new Date(dueDate);
    taskDueDate.setHours(0, 0, 0, 0);
    return taskDueDate < today;
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.task-menu-button')) {
      isClickingMenuRef.current = true;
      return;
    }
    isDraggingRef.current = false;
  };

  const handleMouseMove = () => {
    if (!isClickingMenuRef.current) {
      isDraggingRef.current = true;
    }
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current && !isClickingMenuRef.current) {
      onClick?.({
        id,
        title,
        description,
        assignees,
        priority,
        dueDate,
        status,
        comments,
        history
      });
    }
    isDraggingRef.current = false;
    isClickingMenuRef.current = false;
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        taskId: id,
        sourceColumnId: columnId,
      })
    );
    e.target.classList.add("opacity-50");
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove("opacity-50");
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(id, columnId);
    setIsMenuOpen(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`p-5 rounded-xl border transition-all duration-300 ease-in-out cursor-pointer
        ${isOverdue() 
          ? "border-rose-200 bg-gradient-to-br from-rose-50 to-white hover:shadow-rose-100/60 hover:border-rose-300" 
          : "border-slate-100 bg-white hover:shadow-slate-200/60 hover:border-slate-200"}
        hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] 
        hover:translate-y-[-2px]`}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-md inline-flex items-center
              ring-1 ring-inset ${priorityStyles[priority]} shadow-sm`}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
            {dueDate && (
              <span
                className={`flex items-center text-xs ${
                  isOverdue() 
                    ? 'text-rose-500 bg-rose-50/80 ring-rose-200/60' 
                    : 'text-slate-500 bg-slate-50/80 ring-slate-200/60'
                } px-2.5 py-1.5 rounded-md ring-1 ring-inset shadow-sm`}
              >
                <Calendar className="w-3 h-3 mr-1" />
                {dueDate}
              </span>
            )}
            {comments?.length > 0 && (
              <span className="text-xs text-slate-500 bg-slate-50/80 px-2.5 py-1.5 rounded-md ring-1 ring-inset ring-slate-200/60 shadow-sm">
                {comments.length} comment{comments.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="group-hover:translate-x-0.5 transition-transform duration-300">
            <h3 className={`font-medium mb-1 ${isOverdue() ? 'text-rose-900' : 'text-slate-800'}`}>
              {title}
            </h3>
            {description && (
              <p className={`text-sm leading-relaxed line-clamp-2 ${isOverdue() ? 'text-rose-600' : 'text-slate-600'}`}>
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="relative task-menu-button">
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
                    onClick={handleDelete}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Delete Task
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-5">
        {!loadingUsers && assigneeUsers.length > 0 && (
          <AvatarGroup 
            users={assigneeUsers}
            max={5}
          />
        )}
      </div>
    </div>
  );
};

export default TaskCard;