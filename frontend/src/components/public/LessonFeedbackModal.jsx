import React, { useState } from "react";
import { Star, X, MessageSquare, Send, CheckCircle2 } from "lucide-react";

const LessonFeedbackModal = ({ isOpen, onClose, onSubmit, lessonName }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ rating, comment });
      setIsSuccess(true);
      setTimeout(() => {
        onClose(true); // Close with success flag
      }, 1500);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose(false); // Close without success flag
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {isSuccess ? (
          <div className="p-12 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-gray-900">Thank You!</h3>
            <p className="text-gray-500 font-medium">
              Your feedback helps us make Learnesia even better.
            </p>
          </div>
        ) : (
          <>
            <div className="relative p-8 pb-0">
              <button
                onClick={handleSkip}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2">
                <span className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded">
                  Quick Feedback
                </span>
                <h3 className="text-2xl font-black text-gray-900 leading-tight">
                  How was this lesson?
                </h3>
                <p className="text-sm text-gray-500 font-medium italic">
                  "{lessonName}"
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Star Rating */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform active:scale-90"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-200"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Comment field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
                  <MessageSquare className="w-3.5 h-3.5" />
                  What could we improve? (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl text-sm font-medium transition-all outline-none min-h-[100px] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={rating === 0 || isSubmitting}
                  className={`
                    w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all
                    ${
                      rating === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-black text-white hover:bg-gray-800 shadow-xl shadow-gray-200 active:scale-[0.98]"
                    }
                  `}
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Submit Feedback <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default LessonFeedbackModal;
