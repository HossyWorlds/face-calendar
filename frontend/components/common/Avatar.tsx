'use client';

import Image from 'next/image';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 150,
};

export function Avatar({ src, alt, size = 'md', className = '' }: AvatarProps) {
  const dimension = sizeMap[size];

  return (
    <div
      className={`relative overflow-hidden rounded-full ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={`${dimension}px`}
      />
    </div>
  );
}
