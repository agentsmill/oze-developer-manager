import React from 'react';
import '../../styles/indicators.css';

/**
 * Komponent etykiety statusu
 * @param {Object} props - Właściwości komponentu
 * @param {string} props.status - Status (active, warning, danger, paused, completed)
 * @param {string} props.text - Tekst wyświetlany w etykiecie
 * @param {React.ReactNode} props.icon - Opcjonalna ikona
 * @param {string} props.className - Dodatkowe klasy CSS
 * @returns {JSX.Element} Element JSX
 */
const StatusBadge = ({ 
  status = 'active', 
  text, 
  icon, 
  className = '',
  ...props 
}) => {
  const statusClass = `status-${status}`;
  
  return (
    <span 
      className={`status-indicator ${statusClass} ${className}`} 
      {...props}
    >
      {icon && (
        <span className="mr-1">{icon}</span>
      )}
      {text}
    </span>
  );
};

export default StatusBadge; 