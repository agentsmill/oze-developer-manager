import React from "react";

const Card = ({
  children,
  title,
  className = "",
  headerAction = null,
  footer = null,
  ...props
}) => {
  return (
    <div className={`bg-white p-4 rounded shadow ${className}`} {...props}>
      {title && (
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-lg">{title}</h3>
          {headerAction}
        </div>
      )}
      <div className="card-content">{children}</div>
      {footer && (
        <div className="card-footer mt-4 pt-3 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
