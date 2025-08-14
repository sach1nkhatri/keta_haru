import React from 'react';
import '../css/LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', color = 'primary' }) => {
  return (
    <div className={`loading-spinner ${size} ${color}`}>
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingSpinner; 