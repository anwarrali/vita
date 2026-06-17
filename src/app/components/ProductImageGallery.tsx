import { useState } from 'react';
import { cn } from './ui/utils';

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
}

export function ProductImageGallery({ images, alt }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const displayImages = images.filter(Boolean);

  if (displayImages.length === 0) {
    return (
      <div className="aspect-square rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
        لا توجد صور
      </div>
    );
  }

  const currentImage = displayImages[selectedIndex] ?? displayImages[0];

  return (
    <div>
      <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-4 border border-border">
        <img
          src={currentImage}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>

      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {displayImages.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              aria-label={`صورة ${idx + 1}`}
              aria-current={selectedIndex === idx}
              className={cn(
                'aspect-square rounded-lg overflow-hidden border-2 transition-all',
                selectedIndex === idx
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-transparent hover:border-border'
              )}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
