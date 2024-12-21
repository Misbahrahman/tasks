import React from "react";
import { cn } from "../../utils";

const baseInputStyles =
  "w-full px-4 py-3 border border-slate-200 rounded-lg " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
  "placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500";

const labelStyles = "block text-sm font-medium text-slate-700 mb-2";

const errorStyles =
  "border-red-300 focus:ring-red-500 text-red-900 placeholder:text-red-300";
const helperTextStyles = "mt-2 text-sm text-red-600";

export const TextInput = React.forwardRef(
  ({ label, error, helperText, className, type = "text", ...props }, ref) => {
    return (
      <div className={className}>
        {label && (
          <label htmlFor={props.id} className={labelStyles}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(baseInputStyles, error && errorStyles)}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={helperText ? `${props.id}-description` : undefined}
          {...props}
        />
        {helperText && (
          <p className={helperTextStyles} id={`${props.id}-description`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

export const TextArea = React.forwardRef(
  ({ label, error, helperText, className, rows = 4, ...props }, ref) => {
    return (
      <div className={className}>
        {label && (
          <label htmlFor={props.id} className={labelStyles}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={cn(baseInputStyles, "resize-none", error && errorStyles)}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={helperText ? `${props.id}-description` : undefined}
          {...props}
        />
        {helperText && (
          <p className={helperTextStyles} id={`${props.id}-description`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
TextArea.displayName = "TextArea";
