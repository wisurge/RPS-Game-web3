import React from 'react';

interface ResultBoxProps {
  children: React.ReactNode;
  className?: string;
}

export const ResultBox: React.FC<ResultBoxProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`result-box ${className}`}>
      {children}
    </div>
  );
};
