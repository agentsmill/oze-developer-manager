import React, { useEffect } from "react";

const Notification = ({ text, type = "info", onClose, autoClose = true, duration = 5000 }) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getNotificationClasses = () => {
    const baseClasses = "notification flex items-center";
    
    switch (type) {
      case "win":
        return `${baseClasses} bg-green-500 text-white`;
      case "error":
        return `${baseClasses} bg-red-500 text-white`;
      case "success":
        return `${baseClasses} bg-green-500 text-white`;
      case "warning":
        return `${baseClasses} bg-yellow-500 text-black`;
      default:
        return `${baseClasses} bg-blue-500 text-white`;
    }
  };

  return (
    <div className={getNotificationClasses()}>
      <div className="mr-4">{text}</div>
      <button 
        className="ml-4 px-2 py-1 rounded bg-opacity-20 bg-black hover:bg-opacity-30 transition-all"
        onClick={onClose}
      >
        ✕
      </button>
    </div>
  );
};

export default Notification;
