import type { ReactNode, SVGProps } from 'react';

// Единый стиль иконок: inline SVG, stroke=currentColor, без заливки — FRONTEND_TZ.md §3.4.
export function createIcon(paths: ReactNode) {
  return function IconComponent(props: SVGProps<SVGSVGElement>) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        width={18}
        height={18}
        {...props}
      >
        {paths}
      </svg>
    );
  };
}
