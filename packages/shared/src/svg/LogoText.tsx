import type { ReactElement } from 'react';
import React from 'react';
import {
  wordmarkAlphas,
  wordmarkFillRules,
  wordmarkPaths,
  WORDMARK_VIEWBOX,
} from './logoGeometry';

interface LogoTextProps {
  isPlus?: boolean;
  className?: {
    container?: string;
    group?: string;
  };
}

export default function LogoText({
  isPlus = false,
  className,
}: LogoTextProps): ReactElement {
  return (
    <svg
      viewBox="0 0 110 20"
      xmlns="http://www.w3.org/2000/svg"
      className={className?.container}
      style={{ width: '100px', height: '20px' }}
    >
      <text
        x="0"
        y="15"
        fill="var(--theme-text-primary)"
        fontSize="16"
        fontWeight="800"
        letterSpacing="-0.5px"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      >
        devcore<tspan fill="#3b82f6">.tr</tspan>
      </text>
    </svg>
  );
}
