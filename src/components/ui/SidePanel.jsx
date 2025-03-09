import React from 'react';
import { X } from 'lucide-react';

const SidePanel = ({ title, isOpen, onClose, children, variant = 'default' }) => {
  if (!isOpen) return null;
  
  const getVariantClasses = () => {
    switch(variant) {
      case 'illegal':
        return 'border-l-red-600 bg-red-50';
      case 'staff':
        return 'border-l-blue-600 bg-blue-50';
      case 'project':
        return 'border-l-green-600 bg-green-50';
      case 'finance':
        return 'border-l-purple-600 bg-purple-50';
      default:
        return 'border-l-gray-600 bg-gray-50';
    }
  };
  
  return (
    <div 
      className={`fixed top-0 right-0 h-full w-96 shadow-lg border-l-4 z-30 transition-all duration-300 ease-in-out ${getVariantClasses()}`}
      style={{ 
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        overflowY: 'auto' 
      }}
    >
      {/* Nagłówek */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold">{title}</h2>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Zawartość */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default SidePanel; 