import React from "react";

const MessagePop = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center"
      tabIndex="-1"
    >
      {/* Background Blur */}
      <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

      {/* Modal Content */}
      <div className="relative p-4 w-full max-w-md max-h-1/2 z-10">
        <div className="relative bg-white rounded-lg shadow dark:bg-white-100">
          <div className="p-4 md:p-5 text-center">
            <svg
              className="mx-auto mb-4 w-12 h-12 text-red-600"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <h3 className="mb-5 text-lg font-normal text-black">
              {message}
            </h3>
            <button
              onClick={onClose}
              type="button"
              className="text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
            >
              Okay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePop;
