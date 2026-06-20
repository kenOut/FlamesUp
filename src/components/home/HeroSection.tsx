import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import Container from '../ui/Container';
import Button from '../ui/Button';

interface Slide {
  id: number;
  image: string;
  badge: string;
  title: string;
  highlight: string;
  description: string;
  cta1Text: string;
  cta1Link: string;
  cta2Text: string;
  cta2Link: string;
}

// Defined outside component so the array reference is stable across renders
const slides: Slide[] = [
  {
    id: 1,
    image: ' /chat1.png',
    badge: 'Premium Professional Equipment',
    title: 'Where Excellence',
    highlight: 'Meets Innovation',
    description:
      'Experience the perfect blend of cutting-edge technology and traditional craftsmanship. Our premium kitchen solutions elevate every culinary creation.',
    cta1Text: 'Explore Products',
    cta1Link: '/products',
    cta2Text: 'Get Free Quote',
    cta2Link: '/contact',
  },
  {
    id: 2,
    image: '/chat5.png',
    badge: 'Commercial Kitchen Excellence',
    title: 'Built for',
    highlight: 'Performance',
    description:
      'State-of-the-art commercial kitchens designed for efficiency and durability. From concept to completion, we deliver spaces that inspire culinary excellence.',
    cta1Text: 'View Services',
    cta1Link: '/services',
    cta2Text: 'Contact Us',
    cta2Link: '/contact',
  },
  {
    id: 3,
    image: '/commercial_kitchen_chefs.jpg',
    badge: 'Leading Kitchen Equipment Supplier',
    title: 'Professional',
    highlight: 'Kitchen Equipment',
    description:
      'Transform your commercial kitchen with premium equipment, expert installation, and comprehensive support. Trusted by the finest establishments for over 10 years.',
    cta1Text: 'Explore Products',
    cta1Link: '/products',
    cta2Text: 'Get Free Quote',
    cta2Link: '/contact',
  },
  {
    id: 4,
    image: '/chat4.png',
    badge: 'Expert Chef-Grade Solutions',
    title: 'Designed for',
    highlight: 'Culinary Masters',
    description:
      'From professional chefs to restaurant owners, our kitchen solutions are built to meet the highest standards of performance and reliability in any environment.',
    cta1Text: 'Explore Products',
    cta1Link: '/products',
    cta2Text: 'Get Free Quote',
    cta2Link: '/contact',
  },
  {
    id: 5,
    image: '/home_slider1.jpg',
    badge: 'Full-Service Kitchen Solutions',
    title: 'Teamwork &',
    highlight: 'Precision',
    description:
      'Our specialists collaborate with you every step of the way — from design to delivery, installation to ongoing after-sales support — ensuring a seamless experience.',
    cta1Text: 'View Services',
    cta1Link: '/services',
    cta2Text: 'Contact Us',
    cta2Link: '/contact',
  },
  {
    id: 6,
    image: '/chat7.png',
    badge: 'Premium Stainless Steel Equipment',
    title: 'Luxury Kitchens',
    highlight: 'Elevated',
    description:
      'Discover our premium stainless steel appliances and fixtures that combine elegance with durability, crafted for the most demanding commercial environments.',
    cta1Text: 'Explore Products',
    cta1Link: '/products',
    cta2Text: 'Get Free Quote',
    cta2Link: '/contact',
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const loadedRef = useRef<Set<number>>(new Set());

  // Preload all slide images and track which have fully loaded
  useEffect(() => {
    slides.forEach((slide, index) => {
      const img = new window.Image();
      img.onload = () => loadedRef.current.add(index);
      img.src = slide.image;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % slides.length;
        return loadedRef.current.has(next) ? next : prev;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative bg-gray-900 min-h-[700px] flex items-center overflow-hidden">
      {/* Background images */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id}
            className="absolute inset-0"
            style={{
              opacity: isActive ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out',
              willChange: 'opacity',
            }}
          >
            {/* Ken Burns via transform transition — avoids class-toggle snap-back */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-gray-900"
              style={{
                backgroundImage: `url(${slide.image})`,
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
                transition: isActive
                  ? 'transform 8s ease-out'
                  : 'transform 0s',
                willChange: 'transform',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 via-gray-900/50 to-gray-900/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent" />
          </div>
        );
      })}

      {/* Slide content */}
      <Container className="relative z-10 py-20">
        <div key={currentSlide} className="max-w-4xl">
          <div className="inline-flex items-center space-x-2 bg-orange-600/20 border border-orange-600/50 rounded-full px-4 py-2 mb-6 animate-fade-in">
            <span className="text-orange-400 text-sm font-medium">
              {slides[currentSlide].badge}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in">
            {slides[currentSlide].title}{' '}
            <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
              {slides[currentSlide].highlight}
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl animate-fade-in">
            {slides[currentSlide].description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in">
            <Link to={slides[currentSlide].cta1Link}>
              <Button size="lg" className="group">
                {slides[currentSlide].cta1Text}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to={slides[currentSlide].cta2Link}>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white text-white hover:bg-white hover:text-gray-900"
              >
                <Phone className="mr-2 h-5 w-5" />
                {slides[currentSlide].cta2Text}
              </Button>
            </Link>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === currentSlide
                    ? 'w-12 bg-orange-500'
                    : 'w-4 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </Container>

      {/* Prev / Next */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-orange-600 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-orange-600 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </section>
  );
}
