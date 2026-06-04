import { ReactNode } from 'react';
import Container from './Container';

interface SectionProps {
  children: ReactNode;
  background?: 'light' | 'dark' | 'darker';
  className?: string;
}

export default function Section({ children, background = 'dark', className = '' }: SectionProps) {
  const bgClasses = {
    light: 'bg-white',
    dark: 'bg-gradient-to-br from-gray-50 to-gray-100',
    darker: 'bg-gradient-to-br from-white to-gray-50'
  };

  return (
    <section className={`py-16 md:py-24 ${bgClasses[background]} ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}
