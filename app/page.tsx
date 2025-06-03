"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import Image from "next/image";
import { FloatingElements } from "./components/FloatingElements";
import { MusicPlayer } from "./components/MusicPlayer";
import WishRecorder from "./components/WishRecorder";

// Định nghĩa type cơ bản cho SpeechRecognition
type SpeechRecognitionEvent = {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

type SpeechRecognitionErrorEvent = {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

export default function Home() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  const [cardOpened, setCardOpened] = useState(false);
  const [userWish, setUserWish] = useState("");
  const [showWishRecorder, setShowWishRecorder] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognitionError, setRecognitionError] = useState("");
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [magicPhrase, setMagicPhrase] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Thay đổi tên người được chúc mừng ở đây
  const birthdayPerson = "Nhi";
  
  // Cụm từ ma thuật để mở thiệp
  const correctPhrase = `Chúc mừng sinh nhật ${birthdayPerson}`;
  
  // Rotating messages cho phần subtitle
  const birthdayMessages = useMemo(() => [
    "Chúc bạn một ngày đầy niềm vui!",
    "Hạnh phúc, thành công và sức khỏe!",
    "Tuổi mới, thành công mới!",
    "Mọi điều ước của bạn đều thành hiện thực!",
  ], []);

  const [currentMessage, setCurrentMessage] = useState(birthdayMessages[0]);

  useEffect(() => {
    // Khởi tạo Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'vi-VN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setMagicPhrase(transcript);
          
          // Kiểm tra xem người dùng đã nói đúng cụm từ chưa
          if (transcript.toLowerCase().includes(correctPhrase.toLowerCase())) {
            setCardOpened(true);
            setShowConfetti(true);
          }
          
          setIsListening(false);
        };
        
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          setRecognitionError(`Lỗi: ${event.error}`);
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
      } else {
        setRecognitionSupported(false);
        setRecognitionError("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.");
      }
    }

    // Đọc điều ước đã lưu từ localStorage (nếu có)
    const savedWish = localStorage.getItem("userWish");
    if (savedWish) {
      setUserWish(savedWish);
    }

    setWindowWidth(window.innerWidth);
    setWindowHeight(window.innerHeight);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Rotating messages - chỉ khi thiệp đã mở
    let messageInterval: NodeJS.Timeout;
    
    if (cardOpened) {
      let messageIndex = 0;
      messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % birthdayMessages.length;
        setCurrentMessage(birthdayMessages[messageIndex]);
      }, 3000);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (messageInterval) clearInterval(messageInterval);
    };
  }, [birthdayMessages, cardOpened, correctPhrase]);

  // Bắt đầu nhận diện giọng nói
  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setRecognitionError("");
      } catch (err) {
        setRecognitionError("Không thể bắt đầu nhận diện giọng nói. Vui lòng thử lại.");
        console.error(err);
      }
    }
  };

  // Xử lý khi nhận được điều ước mới từ microphone
  const handleWishRecorded = (wish: string) => {
    setUserWish(wish);
    setShowWishRecorder(false);
    // Lưu điều ước vào localStorage
    localStorage.setItem("userWish", wish);
  };

  // Nếu chưa mở thiệp, hiển thị màn hình yêu cầu nói cụm từ ma thuật
  if (!cardOpened) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24 bg-pink-50">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-pink-600 mb-4">
            Có món quà dành cho {birthdayPerson}!
          </h1>
          <p className="text-gray-600 mb-2">
            Nói câu mở khóa ma thuật để mở thiệp:
          </p>
        </div>
        
        <motion.div 
          className="relative cursor-pointer mb-8"
          whileHover={{ scale: 1.05 }}
        >
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            <Image
              src="/images/cake.png"
              alt="Birthday Cake"
              fill
              style={{ objectFit: "contain" }}
              className="rounded-lg shadow-lg"
              priority
            />
          </div>
          
          {/* Hiệu ứng nến */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-2 h-8 bg-yellow-400 rounded-full relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4">
                <div className="w-4 h-6 bg-orange-500 rounded-full animate-flame blur-sm"></div>
                <div className="w-2 h-4 bg-yellow-300 rounded-full animate-flame absolute top-1 left-1"></div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {!recognitionSupported ? (
          <div className="bg-red-100 text-red-600 p-4 rounded-lg max-w-md text-center">
            <p>Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng thử trình duyệt khác như Chrome.</p>
          </div>
        ) : (
          <div className="text-center flex flex-col items-center justify-center w-full">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`rounded-full p-4 ${
                isListening
                  ? "bg-red-500 animate-pulse"
                  : "bg-pink-500 hover:bg-pink-600"
              } text-white w-16 h-16 flex items-center justify-center mb-4`}
              onClick={startListening}
              disabled={isListening}
            >
              {isListening ? (
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 bg-white rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </motion.button>
            
            <p className="text-gray-600 mb-2 w-full text-center">
              {isListening ? "Đang nghe..." : "Nhấn vào nút microphone và nói câu ma thuật"}
            </p>
            
            {magicPhrase && (
              <div className="bg-white p-3 rounded-lg border border-pink-200 max-w-md mx-auto mt-4">
                <p className="text-gray-700">Bạn đã nói: <span className="italic">&ldquo;{magicPhrase}&rdquo;</span></p>
              </div>
            )}
            
            {recognitionError && (
              <p className="text-red-500 mt-2">{recognitionError}</p>
            )}
          </div>
        )}
        
        {/* Thêm tên ở dưới */}
        <p className="mt-8 text-pink-600 font-medium italic">
          From Hữu Danh ❤️
        </p>
      </main>
    );
  }

  // Nếu đã mở thiệp, hiển thị toàn bộ thiệp chúc mừng
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24">
      {showConfetti && (
        <Confetti
          width={windowWidth}
          height={windowHeight}
          recycle={true}
          numberOfPieces={200}
          colors={["#ff69b4", "#ff1493", "#ff9ff3", "#ffd700", "#ffb6c1"]}
        />
      )}

      <FloatingElements />
      <MusicPlayer audioSrc="/music/happy_birthday.mp3" autoPlay={false} />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="birthday-card bg-white rounded-xl p-4 sm:p-6 md:p-10 max-w-4xl w-full mx-auto text-center"
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-4 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-pink-600 mb-2 sm:mb-4">
            Chúc Mừng Sinh Nhật {birthdayPerson}!
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl text-pink-500 min-h-[40px]">
            {currentMessage}
          </h2>
        </motion.div>

        <div className="mb-6 sm:mb-8 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="relative w-full max-w-lg"
          >
            <div className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] rounded-xl overflow-hidden shadow-xl border-4 border-pink-200">
              <Image
                src="/images/nhi.jpg"
                alt={`${birthdayPerson}'s photo`}
                fill
                style={{ objectFit: "cover", objectPosition: "center" }}
                className="hover:scale-105 transition-transform duration-500"
                priority
              />
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col items-center justify-center w-full">
          <motion.div
            className="w-full max-w-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <div className="text-center w-full mx-auto">
              <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-4 sm:mb-6 mx-auto" style={{ textAlign: 'center', width: '100%', maxWidth: '100%' }}>
                Trong ngày sinh nhật tuyệt vời này, chúc {birthdayPerson} luôn tràn đầy niềm vui, 
                hạnh phúc và đạt được mọi ước mơ trong cuộc sống. 
                Mỗi năm trôi qua đều sẽ là một hành trình tuyệt vời mới! 
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-semibold text-pink-500 mx-auto" style={{ textAlign: 'center', width: '100%' }}>
                Chúc {birthdayPerson} một ngày sinh nhật thật đáng nhớ! 🎂
              </p>
            </div>
          </motion.div>
        </div>

        {/* Phần điều ước đơn giản hóa */}
        <div className="flex justify-center w-full">
          <motion.div
            className="w-full max-w-lg mx-auto my-4 sm:my-8 p-3 sm:p-4 bg-pink-50 rounded-xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            style={{ textAlign: "center", margin: "0 auto" }}
          >
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-pink-600 mb-2 sm:mb-3 text-center">
              Điều Ước Sinh Nhật
            </h3>
            
            {userWish ? (
              <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-pink-200 shadow-inner min-h-[80px] flex items-center justify-center">
                <p className="text-gray-700 text-base sm:text-lg italic text-center">{userWish}</p>
              </div>
            ) : (
              <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-pink-200 shadow-inner min-h-[80px] flex items-center justify-center">
                <p className="text-gray-500 text-sm sm:text-base italic text-center">Hãy nhấn vào nút bên dưới để nói điều ước của bạn...</p>
              </div>
            )}
          </motion.div>
        </div>

        {showWishRecorder ? (
          <div className="flex justify-center w-full">
            <div className="w-full max-w-lg mx-auto" style={{ margin: "0 auto" }}>
              <WishRecorder onWishRecorded={handleWishRecorded} />
            </div>
          </div>
        ) : (
          <div className="flex justify-center mt-4 sm:mt-6 mb-2 sm:mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-full text-base sm:text-lg"
              onClick={() => {
                setShowWishRecorder(true);
                setShowConfetti(true);
              }}
            >
              Nói điều ước của bạn 🎤✨
            </motion.button>
          </div>
        )}
      </motion.div>
    </main>
  );
}
