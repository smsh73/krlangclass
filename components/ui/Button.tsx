import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = `
    font-semibold
    rounded-lg
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

  const variantStyles = {
    primary: `
      bg-blue-600 hover:bg-blue-700
      text-white
      focus:ring-blue-500
    `,
    secondary: `
      bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
      text-gray-900 dark:text-gray-100
      focus:ring-gray-500
    `,
    danger: `
      bg-red-600 hover:bg-red-700
      text-white
      focus:ring-red-500
    `,
  };

  const sizeStyles = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 md:h-14 px-6 text-base md:text-lg',
    lg: 'h-14 md:h-16 px-8 text-lg md:text-xl',
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
