import React, { useState } from "react";
import { X, Calendar } from "lucide-react";
import MoreButton from "./MoreButton";


const TaskCard = ({
    id,
    title,
    description,
    assignees,
    priority,
    dueDate,
    columnId,
    onDelete,
  }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const priorityStyles = {
      high: "bg-rose-50 text-rose-700 ring-rose-600/20",
      medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
      low: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
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
  
    return (
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className="group p-5 rounded-xl border border-slate-100 bg-white 
          transition-all duration-300 ease-in-out cursor-move
          hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] 
          hover:shadow-slate-200/60
          hover:border-slate-200
          hover:translate-y-[-2px]"
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
                  className="flex items-center text-xs text-slate-500 bg-slate-50/80 
                  px-2.5 py-1.5 rounded-md ring-1 ring-inset ring-slate-200/60 shadow-sm"
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  {dueDate}
                </span>
              )}
            </div>
            <div className="group-hover:translate-x-0.5 transition-transform duration-300">
              <h3 className="font-medium text-slate-800 mb-1">{title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {description}
              </p>
            </div>
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
                        onDelete(id, columnId);
                        setIsMenuOpen(false);
                      }}
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
        <div className="mt-5 flex items-center justify-between">
          <div className="flex -space-x-2 hover:space-x-1 transition-all duration-300">
            {assignees.map((initials) => (
              <div
                key={initials}
                className="w-8 h-8 rounded-full border-2 border-white 
                  flex items-center justify-center text-xs font-medium text-white 
                  shadow-md transition-transform duration-300
                  hover:scale-110 hover:z-10
                  bg-gradient-to-br from-blue-500 to-blue-600"
              >
                {initials}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

export default TaskCard;