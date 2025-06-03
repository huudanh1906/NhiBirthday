"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface WishRecorderProps {
  onWishRecorded: (wish: string) => void;
}

const WishRecorder = ({ onWishRecorded }: WishRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedWish, setRecordedWish] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [error, setError] = useState("");
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    // Kiểm tra xem trình duyệt có hỗ trợ Web Speech API không
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.lang = 'vi-VN';
        recognitionInstance.interimResults = false;
        recognitionInstance.maxAlternatives = 1;
        
        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setRecordedWish(transcript);
          setIsListening(false);
          setIsRecording(false);
        };
        
        recognitionInstance.onerror = (event: any) => {
          setError(`Lỗi: ${event.error}`);
          setIsListening(false);
          setIsRecording(false);
        };
        
        recognitionInstance.onend = () => {
          setIsListening(false);
          setIsRecording(false);
        };
        
        setRecognition(recognitionInstance);
      } else {
        setSupported(false);
        setError("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.");
      }
    }
  }, []);

  const startRecording = () => {
    if (recognition) {
      try {
        recognition.start();
        setIsListening(true);
        setIsRecording(true);
        setError("");
      } catch (err) {
        setError("Không thể bắt đầu ghi âm. Vui lòng thử lại.");
        console.error(err);
      }
    }
  };

  const stopRecording = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  const handleSaveWish = () => {
    if (recordedWish.trim()) {
      onWishRecorded(recordedWish);
      setRecordedWish("");
    }
  };

  return (
    <div className="w-full mx-auto mt-2 sm:mt-4 mb-4 sm:mb-8 p-3 sm:p-4 bg-pink-50 rounded-xl text-center">
      <h3 className="text-lg sm:text-xl text-pink-600 font-bold text-center mb-2 sm:mb-3">
        Nói điều ước của bạn
      </h3>
      
      {!supported ? (
        <p className="text-red-500 text-center text-sm sm:text-base">
          Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng thử trình duyệt khác như Chrome.
        </p>
      ) : (
        <>
          <div className="flex justify-center mb-3 sm:mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`rounded-full p-3 sm:p-4 ${
                isRecording
                  ? "bg-red-500 animate-pulse"
                  : "bg-pink-500 hover:bg-pink-600"
              } text-white w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!supported}
            >
              {isRecording ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 sm:h-8 w-6 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="6" y="6" width="12" height="12" strokeWidth="2" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 sm:h-8 w-6 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </motion.button>
          </div>

          <div className="relative mb-3 sm:mb-4 mx-auto" style={{ maxWidth: "100%", margin: "0 auto" }}>
            <textarea
              className="w-full p-2 sm:p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 min-h-[60px] sm:min-h-[80px] text-sm sm:text-base"
              placeholder="Điều ước của bạn sẽ hiện ở đây..."
              value={recordedWish}
              onChange={(e) => setRecordedWish(e.target.value)}
            />
            <p className="text-gray-500 text-xs mt-1 text-center">Bạn có thể chỉnh sửa điều ước sau khi nhận dạng nếu không chính xác</p>
            {isListening && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="h-2 sm:h-3 w-2 sm:w-3 bg-red-500 rounded-full animate-bounce"></div>
                  <div className="h-2 sm:h-3 w-2 sm:w-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="h-2 sm:h-3 w-2 sm:w-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  <span className="text-pink-600 font-medium ml-1 sm:ml-2 text-sm sm:text-base">Đang nghe...</span>
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-xs sm:text-sm mb-3 sm:mb-4 text-center">{error}</p>}

          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-1.5 sm:py-2 px-4 sm:px-6 rounded-full text-sm sm:text-base disabled:opacity-50"
              onClick={handleSaveWish}
              disabled={!recordedWish.trim() || isRecording}
            >
              Lưu điều ước
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
};

export default WishRecorder; 