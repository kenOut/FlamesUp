import { useEffect, useState, useRef } from 'react';
import { TrendingUp, Users, Award, Briefcase } from 'lucide-react';
import Section from '../ui/Section';

interface Stat {
  icon: JSX.Element;
  value: number;
  suffix: string;
  label: string;
  prefix?: string;
}

export default function StatsCounter() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const stats: Stat[] = [
    {
      icon: <TrendingUp className="h-8 w-8" />,
      value: 10,
      suffix: '+',
      label: 'Years of Excellence'
    },
    {
      icon: <Briefcase className="h-8 w-8" />,
      value: 500,
      suffix: '+',
      label: 'Projects Completed'
    },
    {
      icon: <Users className="h-8 w-8" />,
      value: 300,
      suffix: '+',
      label: 'Happy Clients'
    },
    {
      icon: <Award className="h-8 w-8" />,
      value: 100,
      suffix: '%',
      label: 'Satisfaction Rate'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const AnimatedNumber = ({ value, suffix, prefix = '' }: { value: number; suffix: string; prefix?: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!isVisible) return;

      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }, [isVisible, value]);

    return (
      <span className="text-5xl font-bold text-orange-500">
        {prefix}{count}{suffix}
      </span>
    );
  };

  return (
    <Section background="darker" className="relative overflow-hidden">
      <div ref={sectionRef} className="absolute inset-0 bg-gradient-to-r from-orange-50/80 to-orange-100/80"></div>

      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-orange-100 hover:border-orange-400 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105"
          >
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <div className="text-white">{stat.icon}</div>
            </div>
            <AnimatedNumber value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
            <div className="text-gray-700 mt-2 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}
