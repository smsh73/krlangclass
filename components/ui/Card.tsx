import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`
        min-h-[180px] md:min-h-[240px]
        p-4 md:p-6
        rounded-lg md:rounded-xl
        shadow-md md:shadow-lg
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02]' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
