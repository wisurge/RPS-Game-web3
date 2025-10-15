import React from 'react';

interface InfoBoxProps {
  children: React.ReactNode;
  className?: string;
}

export const InfoBox: React.FC<InfoBoxProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`info-box ${className}`}>
      {children}
    </div>
  );
};
