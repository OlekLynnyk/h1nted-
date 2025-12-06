import React from 'react';

interface PlanProgressMonthlyProps {
  planName: string;
  used: number;
  total: number;
}

export const PlanProgressMonthly: React.FC<PlanProgressMonthlyProps> = ({
  planName,
  used,
  total,
}) => {
  const percentage = total > 0 ? (used / total) * 100 : 0;

  // На десктопе оставляем 90, на мобилке уменьшаем до 72
  const size = 90;
  const mobileSize = 72;
  const radius = size / 2 - 5;
  const mobileRadius = mobileSize / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const mobileCircumference = 2 * Math.PI * mobileRadius;
  const offset = circumference * (1 - percentage / 100);
  const mobileOffset = mobileCircumference * (1 - percentage / 100);

  const isNearLimit = percentage >= 90;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="relative flex-shrink-0">
        {/* Desktop SVG */}
        <div
          className="hidden sm:block"
          style={{
            width: `${size}px`,
            height: `${size}px`,
          }}
        >
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            <defs>
              {/* мягкий солнечный жёлтый */}
              <linearGradient id="yellowGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#FBBF24" />
              </linearGradient>
              <linearGradient id="yellowToRedGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#f28b82" />
              </linearGradient>
            </defs>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#FBBF24"
              strokeWidth="10"
              fill="none"
              opacity="0.15"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={isNearLimit ? 'url(#yellowToRedGradient)' : 'url(#yellowGradient)'}
              strokeWidth="10"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-xs text-muted-foreground lowercase leading-tight">monthly</div>
            <div className="text-xs text-muted-foreground font-mono">
              {used}/{total}
            </div>
          </div>
        </div>

        {/* Mobile SVG */}
        <div
          className="block sm:hidden"
          style={{
            width: `${mobileSize}px`,
            height: `${mobileSize}px`,
          }}
        >
          <svg
            width={mobileSize}
            height={mobileSize}
            viewBox={`0 0 ${mobileSize} ${mobileSize}`}
            className="-rotate-90"
          >
            <defs>
              <linearGradient id="yellowGradientMobile" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#FBBF24" />
              </linearGradient>
              <linearGradient id="yellowToRedGradientMobile" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#f28b82" />
              </linearGradient>
            </defs>
            <circle
              cx={mobileSize / 2}
              cy={mobileSize / 2}
              r={mobileRadius}
              stroke="#FBBF24"
              strokeWidth="8"
              fill="none"
              opacity="0.15"
            />
            <circle
              cx={mobileSize / 2}
              cy={mobileSize / 2}
              r={mobileRadius}
              stroke={
                isNearLimit ? 'url(#yellowToRedGradientMobile)' : 'url(#yellowGradientMobile)'
              }
              strokeWidth="8"
              fill="none"
              strokeDasharray={mobileCircumference}
              strokeDashoffset={mobileOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-[10px] text-muted-foreground lowercase leading-tight">monthly</div>
            <div className="text-[10px] text-muted-foreground font-mono">
              {used}/{total}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
