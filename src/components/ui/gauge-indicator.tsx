import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export interface GaugeIndicatorProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showValue?: boolean;
  label?: string;
  className?: string;
  trackColor?: string;
  valueColor?: 'auto' | 'primary' | 'success' | 'warning' | 'danger';
  strokeWidth?: number;
}

export function GaugeIndicator({
  value,
  size = 'md',
  showValue = true,
  label,
  className,
  trackColor,
  valueColor = 'auto',
  strokeWidth,
}: GaugeIndicatorProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));

  // Size configurations
  const sizeConfig = {
    sm: { dimension: 64, stroke: strokeWidth || 6, fontSize: 'text-sm', labelSize: 'text-[10px]' },
    md: { dimension: 96, stroke: strokeWidth || 8, fontSize: 'text-xl', labelSize: 'text-xs' },
    lg: { dimension: 128, stroke: strokeWidth || 10, fontSize: 'text-2xl', labelSize: 'text-sm' },
    xl: { dimension: 160, stroke: strokeWidth || 12, fontSize: 'text-3xl', labelSize: 'text-base' },
  };

  const config = sizeConfig[size];
  const radius = (config.dimension - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;

  // Auto color based on value
  const getAutoColor = () => {
    if (clampedValue >= 80) return 'text-status-active';
    if (clampedValue >= 50) return 'text-status-warning';
    return 'text-status-danger';
  };

  const colorMap = {
    auto: getAutoColor(),
    primary: 'text-primary-500',
    success: 'text-status-active',
    warning: 'text-status-warning',
    danger: 'text-status-danger',
  };

  const fillColor = colorMap[valueColor];

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={config.dimension}
        height={config.dimension}
        className="transform -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={config.dimension / 2}
          cy={config.dimension / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          className={trackColor || 'text-gray-200 dark:text-gray-700'}
        />

        {/* Value arc */}
        <motion.circle
          cx={config.dimension / 2}
          cy={config.dimension / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={fillColor}
        />
      </svg>

      {/* Center content */}
      {(showValue || label) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showValue && (
            <span className={cn(
              'font-mono font-bold tabular-nums text-gray-900 dark:text-gray-100',
              config.fontSize
            )}>
              {Math.round(clampedValue)}
            </span>
          )}
          {label && (
            <span className={cn(
              'text-gray-500 dark:text-gray-400 uppercase tracking-wider',
              config.labelSize
            )}>
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Mini gauge for inline display
export function MiniGauge({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const clampedValue = Math.max(0, Math.min(100, value));

  const getColor = () => {
    if (clampedValue >= 80) return 'bg-status-active';
    if (clampedValue >= 50) return 'bg-status-warning';
    return 'bg-status-danger';
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', getColor())}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <span className="font-mono text-xs tabular-nums text-gray-600 dark:text-gray-400">
        {Math.round(clampedValue)}%
      </span>
    </div>
  );
}

// Health indicator with multiple segments
export interface HealthSegment {
  label: string;
  value: number;
  color?: string;
}

export function HealthIndicator({
  segments,
  className,
}: {
  segments: HealthSegment[];
  className?: string;
}) {
  const getSegmentColor = (value: number, customColor?: string) => {
    if (customColor) return customColor;
    if (value >= 80) return 'bg-status-active';
    if (value >= 50) return 'bg-status-warning';
    return 'bg-status-danger';
  };

  return (
    <div className={cn('space-y-2', className)}>
      {segments.map((segment, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400 w-20 truncate">
            {segment.label}
          </span>
          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', getSegmentColor(segment.value, segment.color))}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, segment.value)}%` }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
            />
          </div>
          <span className="font-mono text-xs tabular-nums text-gray-600 dark:text-gray-400 w-8 text-right">
            {segment.value}%
          </span>
        </div>
      ))}
    </div>
  );
}
