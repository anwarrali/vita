import type { ReactNode } from 'react';
import { Logo } from './Logo';
import { cn } from './ui/utils';

interface HeroVisualProps {
  className?: string;
}

function FloatingItem({
  className,
  children,
  delay = '0s',
}: {
  className?: string;
  children: ReactNode;
  delay?: string;
}) {
  return (
    <div
      className={cn(
        'absolute flex items-center justify-center',
        'animate-[hero-float_5s_ease-in-out_infinite]',
        className
      )}
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  );
}

function PerfumeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="perfume-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <rect x="8" y="14" width="16" height="28" rx="4" fill="url(#perfume-grad)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" />
      <rect x="12" y="6" width="8" height="10" rx="2" fill="currentColor" fillOpacity="0.3" />
      <rect x="14" y="2" width="4" height="6" rx="1" fill="currentColor" fillOpacity="0.45" />
    </svg>
  );
}

function LipstickIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 44" className={className} aria-hidden="true">
      <rect x="6" y="16" width="16" height="24" rx="3" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1" strokeOpacity="0.35" />
      <path d="M6 16 L14 4 L22 16 Z" fill="currentColor" fillOpacity="0.5" />
      <rect x="9" y="40" width="10" height="4" rx="1" fill="currentColor" fillOpacity="0.35" />
    </svg>
  );
}

function BagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 40" className={className} aria-hidden="true">
      <rect x="6" y="12" width="32" height="26" rx="5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.35" />
      <path d="M14 12 C14 6 18 2 22 2 C26 2 30 6 30 12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeOpacity="0.45" />
      <circle cx="22" cy="25" r="2" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
}

function CompactIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="16" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.35" />
      <circle cx="20" cy="20" r="10" fill="currentColor" fillOpacity="0.08" />
      <ellipse cx="20" cy="20" rx="6" ry="4" fill="currentColor" fillOpacity="0.2" transform="rotate(-20 20 20)" />
    </svg>
  );
}

function BrushIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <rect x="16" y="10" width="6" height="22" rx="2" fill="currentColor" fillOpacity="0.3" transform="rotate(25 19 21)" />
      <ellipse cx="10" cy="10" rx="8" ry="6" fill="currentColor" fillOpacity="0.22" transform="rotate(25 10 10)" />
    </svg>
  );
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} aria-hidden="true">
      <path
        d="M6 0 L6.8 4.2 L11 5 L6.8 5.8 L6 10 L5.2 5.8 L1 5 L5.2 4.2 Z"
        fill="currentColor"
        fillOpacity="0.5"
      />
    </svg>
  );
}

export function HeroVisual({ className }: HeroVisualProps) {
  return (
    <div className={cn('relative w-full max-w-[340px] mx-auto aspect-square', className)}>
      {/* Ambient glow */}
      <div className="absolute inset-[12%] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute inset-[22%] rounded-full border border-primary/10 bg-gradient-to-br from-primary/5 to-transparent" />

      {/* Orbital ring */}
      <div className="absolute inset-[8%] rounded-full border border-dashed border-primary/15" />

      {/* Floating accessories */}
      <FloatingItem className="top-[4%] left-[8%] w-14 h-14 text-primary p-2" delay="0s">
        <PerfumeIcon className="w-full h-full" />
      </FloatingItem>

      <FloatingItem className="top-[8%] right-[4%] w-12 h-12 text-primary p-2" delay="1.2s">
        <LipstickIcon className="w-full h-full" />
      </FloatingItem>

      <FloatingItem className="bottom-[18%] left-[0%] w-14 h-14 text-primary p-2" delay="0.6s">
        <BagIcon className="w-full h-full" />
      </FloatingItem>

      <FloatingItem className="bottom-[12%] right-[2%] w-12 h-12 text-primary p-1.5" delay="1.8s">
        <CompactIcon className="w-full h-full" />
      </FloatingItem>

      <FloatingItem className="top-[42%] left-[-2%] w-11 h-11 text-primary p-1.5" delay="2.4s">
        <BrushIcon className="w-full h-full" />
      </FloatingItem>

      {/* Sparkles */}
      <Sparkle className="absolute top-[28%] right-[18%] w-3 h-3 text-primary" />
      <Sparkle className="absolute bottom-[32%] left-[20%] w-2.5 h-2.5 text-primary" />
      <Sparkle className="absolute top-[55%] right-[8%] w-2 h-2 text-primary" />

      {/* Central logo pedestal — 3D layered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Shadow base */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-36 h-8 rounded-[50%] bg-primary/15 blur-md" />

          {/* Pedestal */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-32 h-6 rounded-[50%] bg-gradient-to-b from-primary/20 to-primary/5 border border-primary/10" />

          {/* Logo disc */}
          <div
            className={cn(
              'relative w-36 h-36 md:w-40 md:h-40 rounded-full',
              'bg-gradient-to-br from-background via-background to-primary/5',
              'border border-primary/20 shadow-xl shadow-primary/15',
              'flex items-center justify-center',
              'before:absolute before:inset-1 before:rounded-full before:border before:border-white/40 before:pointer-events-none'
            )}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-primary/8 to-transparent" />
            <Logo className="relative h-16 md:h-[4.5rem] w-auto text-primary z-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
