import React from 'react';
import '../../styles/indicators.css';

/**
 * Komponent paska postępu
 * @param {Object} props - Właściwości komponentu
 * @param {number} props.value - Wartość postępu (0-100)
 * @param {string} props.status - Status projektu (low, medium, high, paused, blocked)
 * @param {boolean} props.showPercent - Czy pokazywać procent
 * @param {string} props.className - Dodatkowe klasy CSS
 * @returns {JSX.Element} - Element JSX
 */
const ProgressBar = ({ 
  value = 0, 
  status = 'medium', 
  showPercent = false, 
  className = '', 
  ...props 
}) => {
  // Upewniamy się, że wartość jest między 0 a 100
  const normalizedValue = Math.min(100, Math.max(0, value));
  
  // Określamy klasę koloru w zależności od statusu
  const colorClass = `progress-${status}`;
  
  return (
    <div className={`relative ${className}`} {...props}>
      <div className="progress-bar-container">
        <div 
          className={`progress-bar-fill ${colorClass}`} 
          style={{ width: `${normalizedValue}%` }}
        ></div>
      </div>
      
      {showPercent && (
        <div className="text-xs font-medium text-gray-700 text-right mt-1">
          {normalizedValue}%
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
