"use client";

import { useEffect, useState } from "react";
import { animated, useSpring } from "react-spring";

interface FloatingElementProps {
  emoji: string;
  size?: number;
  duration?: number;
  delay?: number;
}

const FloatingElement = ({ 
  emoji, 
  size = 30, 
  duration = 15, 
  delay = 0 
}: FloatingElementProps) => {
  const startPosition = Math.random() * 100;
  const [props] = useSpring(() => ({
    from: {
      transform: `translate(${startPosition}vw, 100vh) rotate(0deg)`,
      opacity: 1,
    },
    to: {
      transform: `translate(${startPosition + (Math.random() * 20 - 10)}vw, -20vh) rotate(${Math.random() * 360}deg)`,
      opacity: 0,
    },
    delay,
    config: {
      duration: duration * 1000,
    },
  }));

  return (
    <animated.div 
      style={{
        ...props,
        position: "fixed",
        fontSize: `${size}px`,
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      {emoji}
    </animated.div>
  );
};

export const FloatingElements = () => {
  const [elements, setElements] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const emojis = ["🌸", "🎂", "🎁", "✨", "🎈", "🎊", "🍰", "💝", "💖"];
    const newElements = [];

    for (let i = 0; i < 20; i++) {
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      const randomSize = Math.floor(Math.random() * 30) + 20;
      const randomDuration = Math.floor(Math.random() * 10) + 10;
      const randomDelay = Math.floor(Math.random() * 15) * 1000;

      newElements.push(
        <FloatingElement
          key={i}
          emoji={randomEmoji}
          size={randomSize}
          duration={randomDuration}
          delay={randomDelay}
        />
      );
    }

    setElements(newElements);

    // Add new elements periodically
    const interval = setInterval(() => {
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      const randomSize = Math.floor(Math.random() * 30) + 20;
      const randomDuration = Math.floor(Math.random() * 10) + 10;

      setElements(prev => [
        ...prev,
        <FloatingElement
          key={prev.length + 1}
          emoji={randomEmoji}
          size={randomSize}
          duration={randomDuration}
          delay={0}
        />
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return <>{elements}</>;
}; 