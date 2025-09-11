import { useState, useEffect } from "react";
import { motion} from "framer-motion";
import type { Variants } from "framer-motion";
import "./ImageSlider.css";

interface Slide {
  id: number;
  image: string;
  alt: string;
  caption?: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: "/images/hero/slide1.jpg",
    alt: "Technical briefing on the IMNID tracker",
    caption: "Technical briefing on the IMNID tracker",
  },
  {
    id: 2,
    image: "/images/hero/slide2.jpg",
    alt: "Community health training session",
    caption: "Training healthcare professionals",
  },
  {
    id: 3,
    image: "/images/hero/slide3.jpg",
    alt: "Mother and child healthcare",
    caption: "Improving maternal and child health",
  },
  {
    id: 4,
    image: "/images/hero/slide4.jpg",
    alt: "Training NICU and Delivery staff at Abi Adi General Hospital",
    caption: "IMNID tracker training at Abi Adi General Hospital",
  },
];

interface ImageSliderProps {
  onSlideChange?: (index: number) => void;
  autoPlay?: boolean;
  interval?: number;
  transitionDuration?: number;
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  onSlideChange,
  autoPlay = true,
  interval = 5000,
  transitionDuration = 1000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(-1);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down'>('down');

  // Check if device is mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!autoPlay || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % slides.length;
        setPreviousIndex(prevIndex);
        setDirection('down');
        setProgressKey((prev) => prev + 1);
        onSlideChange?.(nextIndex);
        return nextIndex;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, isPaused, onSlideChange]);

  const goToSlide = (index: number) => {
    setPreviousIndex(currentIndex);
    setDirection(index > currentIndex ? 'down' : 'up');
    setCurrentIndex(index);
    setProgressKey((prev) => prev + 1);
    onSlideChange?.(index);
  };

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  // Adjust animation duration for mobile if needed
  const getAnimationDuration = () => {
    if (isMobile) {
      return Math.min(transitionDuration, 800) / 1000; // Max 800ms on mobile
    }
    return transitionDuration / 1000;
  };

  // Animation variants for the falling effect
  const slideVariants: Variants = {
    enter: (direction: 'up' | 'down') => ({
      y: direction === 'down' ? '-100%' : '100%',
      opacity: 0,
      scale: 1.1,
      transition: {
        duration: getAnimationDuration()
      }
    }),
    center: {
      y: "0%",
      opacity: 1,
      scale: 1,
      transition: {
        duration: getAnimationDuration(),
        ease: [0.25, 0.46, 0.45, 0.94] as any // Type assertion to fix the easing type issue
      }
    },
    exit: (direction: 'up' | 'down') => ({
      y: direction === 'down' ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: getAnimationDuration() * 0.8,
        ease: "easeIn"
      }
    })
  };

  const captionVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: getAnimationDuration() * 0.5,
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div
      className="image-slider-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
    >
      <div className="slider-wrapper">
        {/* Previous slide that exits */}
        {previousIndex >= 0 && previousIndex !== currentIndex && (
          <motion.div
            className="slide"
            key={`exit-${previousIndex}`}
            custom={direction}
            variants={slideVariants}
            initial="center"
            animate="exit"
            style={{ zIndex: 1 }}
          >
            <div className="image-container">
              <img
                src={slides[previousIndex].image}
                alt={slides[previousIndex].alt}
                className="slider-image"
                loading="lazy"
              />
            </div>
          </motion.div>
        )}

        {/* Current slide that enters */}
        <motion.div
          className="slide"
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          style={{ zIndex: 2 }}
        >
          <div className="image-container">
            <img
              src={slides[currentIndex].image}
              alt={slides[currentIndex].alt}
              className="slider-image"
              loading={currentIndex === 0 ? "eager" : "lazy"}
            />
          </div>

          {slides[currentIndex].caption && (
            <motion.div
              className="slide-caption"
              variants={captionVariants}
              initial="hidden"
              animate="visible"
            >
              {slides[currentIndex].caption}
            </motion.div>
          )}
        </motion.div>
      </div>

      <div
        className="slider-controls"
        key={progressKey}
        style={{ "--duration": `${interval}ms` } as React.CSSProperties}
      >
        <div className="slider-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;