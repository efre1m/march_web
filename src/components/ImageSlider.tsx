import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  onSlideChange,
  autoPlay = true,
  interval = 3000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  useEffect(() => {
    if (!autoPlay || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % slides.length;
        setDirection("right");
        setProgressKey((prev) => prev + 1);
        onSlideChange?.(nextIndex);
        return nextIndex;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, isPaused, onSlideChange]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? "right" : "left");
    setCurrentIndex(index);
    setProgressKey((prev) => prev + 1);
    onSlideChange?.(index);
  };

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <div
      className="image-slider-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="slider-wrapper">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            className="slide"
            custom={direction}
            initial={{
              opacity: 0,
              x: direction === "right" ? "100%" : "-100%",
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === "right" ? "-100%" : "100%" }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
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
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {slides[currentIndex].caption}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
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
