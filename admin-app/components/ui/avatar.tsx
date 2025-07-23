import { cn } from '@/lib/utils';
import * as React from 'react';

const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    src?: string;
    alt?: string;
    fallback?: React.ReactNode;
  }
>(({ className, src, alt, fallback, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      'relative flex shrink-0 overflow-hidden rounded-full',
      className
    )}
    {...props}
  >
    {src ? (
      <img 
        src={src} 
        alt={alt} 
        className="aspect-square h-full w-full object-cover"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
        {fallback}
      </div>
    )}
  </span>
));
Avatar.displayName = 'Avatar';

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, ...props }, ref) => (
  <img
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
));
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-gray-100',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };