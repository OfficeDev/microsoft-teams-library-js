import React from 'react';
import './ApiContainer.css';

interface ApiContainerProps {
  title: string;
  children: React.ReactNode;
}

const ApiContainer: React.FC<ApiContainerProps> = ({ title, children }) => {
  return (
    <div className="api-container">
      <div className="api-header">{title}</div>
      {children}
    </div>
  );
};

export default ApiContainer;
