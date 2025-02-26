import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

const FilterDropdown = ({ elements = [], onChange, selectedValue }) => {
  const [selectedElement, setSelectedElement] = useState(selectedValue || "");

  useEffect(() => {
    setSelectedElement(selectedValue);
  }, [selectedValue]); // Update if prop changes

  const handleChange = (e) => {
    const value = e.target.value;
    setSelectedElement(value);
    onChange && onChange(value);
  };

  return (
    <div className="flex space-x-4 items-center">
      <div className="relative w-64">
        <select
          value={selectedElement}
          onChange={handleChange}
          className="w-full pl-4 pr-10 py-2 bg-gradient-to-r from-blue-50 to-blue-100 
                     border border-blue-200 rounded-lg text-slate-600 
                     placeholder-slate-400 focus:outline-none focus:ring-2 
                     focus:ring-blue-500 focus:border-transparent appearance-none"
        >
          {elements.map((element) => (
            <option key={element.id} value={element.id}>
              {element.name || element.title}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none" />
      </div>
    </div>
  );
};


export default FilterDropdown;
