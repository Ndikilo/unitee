import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { img: 'h-8 w-8', text: 'text-lg' },
  md: { img: 'h-10 w-10', text: 'text-xl' },
  lg: { img: 'h-16 w-16', text: 'text-3xl' },
};

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const s = sizes[size];
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/logo.png"
        alt="UNITEE Logo"
        className={`${s.img} object-contain`}
      />
      {showText && (
        <span className={`${s.text} font-extrabold tracking-tight`}>
          <span className="text-orange-500">UNI</span>
          <span className="text-blue-600">TEE</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
