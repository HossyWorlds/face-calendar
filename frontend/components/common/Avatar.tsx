'use client';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 32,
  md: 56,
  lg: 150,
};

export function Avatar({ src, alt, size = 'md', className = '' }: AvatarProps) {
  const dimension = sizeMap[size];

  return (
    <div
      className={`relative overflow-hidden rounded-full ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={dimension}
        height={dimension}
        className="object-cover w-full h-full"
      />
    </div>
  );
}
