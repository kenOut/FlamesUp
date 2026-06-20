import { useState, useEffect } from 'react';

interface BackgroundSlideshowProps {
  images: string[];
  interval?: number;
  opacity?: number;
}

export default function BackgroundSlideshow({
  images,
  interval = 5000,
  opacity = 0.3
}: BackgroundSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center ${index === currentIndex ? 'animate-ken-burns' : ''}`}
          style={{
            backgroundImage: `url(${image})`,
            opacity: index === currentIndex ? opacity : 0,
            transition: 'opacity 1.5s ease-in-out',
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/55 to-gray-900/80" />
    </div>
  );
}
