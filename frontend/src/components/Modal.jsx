// Modal.jsx
import React from "react";

const Modal = ({ isOpen, toggleModal, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black opacity-75"
        onClick={toggleModal}
      ></div>
      <div className="bg-gray-900 text-white p-8 rounded-lg shadow-lg z-50 max-w-md w-full border border-gray-700">
        {children}
      </div>
    </div>
  );
};

export default Modal;
