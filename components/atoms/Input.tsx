import React from "react";

interface InputProps {
  type?: "text" | "number" | "email" | "password";
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  min?: number | string;
  step?: number | string;
  className?: string;
  id?: string;
}

export const Input: React.FC<InputProps> = ({
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  min,
  step,
  className = "",
  id,
}) => {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      min={min}
      step={step}
      className={`form-input ${className}`}
    />
  );
};
