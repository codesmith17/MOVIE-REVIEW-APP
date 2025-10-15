import { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const Modal = ({ isOpen, toggleModal, children, maxWidth = "5xl", showCloseButton = true }) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        toggleModal();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, toggleModal]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 overflow-y-auto">
      {/* Animated Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={toggleModal}
        style={{ animation: "fadeIn 0.3s ease-out" }}
      />

      {/* Modal Content Container */}
      <div
        className={`relative z-[1051] w-full ${maxWidthClasses[maxWidth] || maxWidthClasses["5xl"]} my-8`}
        style={{ animation: "slideUp 0.3s ease-out" }}
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={toggleModal}
            className="absolute -top-12 right-0 glass p-3 rounded-xl hover:bg-white/20 transition-all text-white z-10"
            aria-label="Close modal"
          >
            <FaTimes className="text-xl" />
          </button>
        )}

        {/* Children Container */}
        <div className="relative">{children}</div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Modal;
