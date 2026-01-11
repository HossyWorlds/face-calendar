'use client';

import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';

interface PhotoUploaderProps {
  currentPhotoUrl?: string;
  onPhotoChange: (file: File | null, previewUrl: string | null) => void;
}

export function PhotoUploader({ currentPhotoUrl, onPhotoChange }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const displayUrl = previewUrl || currentPhotoUrl;

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onPhotoChange(file, url);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        className="relative w-[150px] h-[150px] rounded-full border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center bg-gray-50 overflow-hidden"
      >
        {displayUrl ? (
          <Avatar src={displayUrl} alt="プレビュー" size="lg" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <Camera className="w-8 h-8" />
            <span className="text-sm">写真を選択</span>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
