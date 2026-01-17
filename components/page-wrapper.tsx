'use client';

import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageWrapper provides the side boundary lines and diagonal hatching pattern
 * that frames the entire landing page content.
 * The decorations are static (scroll with page) rather than fixed.
 */
export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Left Boundary - diagonal hatching with parallel lines only - ONLY shown on xl screens and above */}
      <div className="absolute left-0 top-0 bottom-0 w-20 pointer-events-none overflow-hidden z-10 hidden xl:block">
        {/* Outer Line (right edge) */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-border"/>
        {/* Inner Line */}
        <div className="absolute right-8 top-0 bottom-0 w-px bg-border"/>
        {/* Diagonal Hatching between the two lines - steel gray, subtle */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-8"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 4px,
              hsl(210, 10%, 50%) 4px,
              hsl(210, 10%, 50%) 5px
            )`,
            opacity: 0.08,
          }}
        />
      </div>

      {/* Right Boundary - diagonal hatching with parallel lines only - ONLY shown on xl screens and above */}
      <div className="absolute right-0 top-0 bottom-0 w-20 pointer-events-none overflow-hidden z-10 hidden xl:block">
        {/* Outer Line (left edge) */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-border"/>
        {/* Inner Line */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-border"/>
        {/* Diagonal Hatching between the two lines - steel gray, subtle */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-8"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 4px,
              hsl(210, 10%, 50%) 4px,
              hsl(210, 10%, 50%) 5px
            )`,
            opacity: 0.08,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}

/**
 * SectionDivider creates horizontal boundary lines with optional crosshair markers
 */
interface SectionDividerProps {
  showCrosshair?: boolean;
  className?: string;
}

export function SectionDivider({ showCrosshair = false, className }: SectionDividerProps) {
  return (
    <div className={cn('relative h-px bg-border', className)}>
      {showCrosshair && (
        <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="w-3 h-3 border border-border bg-background rounded-sm flex items-center justify-center">
            <span className="text-[8px] text-muted-foreground">+</span>
          </div>
        </div>
      )}
    </div>
  );
}
