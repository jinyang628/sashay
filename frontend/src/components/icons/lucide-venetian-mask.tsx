import * as React from 'react';

export function VenetianMaskIcon({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  className,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M18 11c-1.5 0-2.5.5-3 2" />
      <path d="M4 6a2 2 0 0 0-2 2v4a5 5 0 0 0 5 5a8 8 0 0 1 5 2a8 8 0 0 1 5-2a5 5 0 0 0 5-5V8a2 2 0 0 0-2-2h-3a8 8 0 0 0-5 2a8 8 0 0 0-5-2z" />
      <path d="M6 11c1.5 0 2.5.5 3 2" />
    </svg>
  );
}
