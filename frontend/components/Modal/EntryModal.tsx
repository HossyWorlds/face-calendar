'use client';

import { useState, useEffect } from 'react';
import { Entry, EntryFormData, TimeOfDay } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PhotoUploader } from './PhotoUploader';

interface EntryModalProps {
  isOpen: boolean;
  date: Date | null;
  entry?: Entry;
  onClose: () => void;
  onSave: (data: EntryFormData) => void;
  onDelete: (id: string) => void;
}

const TIME_OPTIONS: { value: TimeOfDay; label: string }[] = [
  { value: 'morning', label: '朝' },
  { value: 'afternoon', label: '昼' },
  { value: 'evening', label: '夜' },
];

function formatDisplayDate(date: Date): string {
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日（${weekday}）`;
}

export function EntryModal({
  isOpen,
  date,
  entry,
  onClose,
  onSave,
  onDelete,
}: EntryModalProps) {
  const [formData, setFormData] = useState<EntryFormData>({
    photo: null,
    photo_url: '',
    name: '',
    location: '',
    time_of_day: 'afternoon',
    memo: '',
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        photo: null,
        photo_url: entry.photo_url,
        name: entry.name,
        location: entry.location || '',
        time_of_day: entry.time_of_day,
        memo: entry.memo || '',
      });
    } else {
      setFormData({
        photo: null,
        photo_url: '',
        name: '',
        location: '',
        time_of_day: 'afternoon',
        memo: '',
      });
    }
  }, [entry, isOpen]);

  const handlePhotoChange = (file: File | null, previewUrl: string | null) => {
    setFormData((prev) => ({
      ...prev,
      photo: file,
      photo_url: previewUrl || '',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  const handleDelete = () => {
    if (entry && confirm('この記録を削除しますか？')) {
      onDelete(entry.id);
    }
  };

  if (!date) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{formatDisplayDate(date)}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <PhotoUploader
            currentPhotoUrl={formData.photo_url}
            onPhotoChange={handlePhotoChange}
          />

          <div className="space-y-2">
            <Label htmlFor="name">名前</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="会った人の名前"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>いつ</Label>
            <div className="flex gap-4">
              {TIME_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="time_of_day"
                    value={option.value}
                    checked={formData.time_of_day === option.value}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        time_of_day: e.target.value as TimeOfDay,
                      }))
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">場所（任意）</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="例: 渋谷"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memo">メモ（任意）</Label>
            <Textarea
              id="memo"
              value={formData.memo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, memo: e.target.value }))
              }
              placeholder="メモを入力"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              保存
            </Button>
            {entry && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                削除
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
