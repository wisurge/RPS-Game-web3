import React from 'react';
import { Label } from '../atoms/Label';

interface FormGroupProps {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  label,
  htmlFor,
  children,
  className = '',
}) => {
  return (
    <div className={`form-group ${className}`}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
};
