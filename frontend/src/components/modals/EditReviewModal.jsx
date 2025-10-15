import { useState, useEffect } from "react";
// EditReviewModal.js
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";

const EditReviewModal = ({ isOpen, onClose, initialReview, onSave }) => {
  const [review, setReview] = useState("");

  useEffect(() => {
    if (initialReview) {
      setReview(initialReview.review);
    }
  }, [initialReview]);

  const handleSave = () => {
    onSave(review);
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} center>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Edit Review</h2>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="w-full h-44 p-2 border rounded focus:outline-none focus:border-blue-500"
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditReviewModal;
