import { CSSProperties, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: CSSProperties;
}

export default function Card({ children, className = '', hover = false, style }: CardProps) {
  const hoverClasses = hover
    ? 'transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl cursor-pointer'
    : '';

  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden ${hoverClasses} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
