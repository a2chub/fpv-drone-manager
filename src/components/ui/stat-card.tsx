import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export interface StatCardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  suffix?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'large';
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  suffix,
  onClick,
  className,
  variant = 'default',
  loading = false,
}: StatCardProps) {
  const TrendIcon = trend?.direction === 'up'
    ? TrendingUp
    : trend?.direction === 'down'
    ? TrendingDown
    : Minus;

  const trendColor = trend?.direction === 'up'
    ? 'text-status-active'
    : trend?.direction === 'down'
    ? 'text-status-danger'
    : 'text-status-inactive';

  const isClickable = !!onClick;

  const variants = {
    default: {
      container: 'p-4',
      label: 'text-sm',
      value: 'stat-value',
    },
    compact: {
      container: 'p-3',
      label: 'text-xs',
      value: 'font-mono text-xl font-semibold tabular-nums',
    },
    large: {
      container: 'p-6',
      label: 'text-base',
      value: 'stat-value-lg',
    },
  };

  const styles = variants[variant];

  return (
    <motion.div
      whileHover={isClickable ? { scale: 1.02 } : undefined}
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      className={cn(
        'panel-card',
        styles.container,
        isClickable && 'cursor-pointer hover:border-primary-500/50',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn(
            'panel-card-header mb-1',
            styles.label
          )}>
            {label}
          </p>

          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className={cn(styles.value, 'text-gray-900 dark:text-gray-100')}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              {suffix && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {suffix}
                </span>
              )}
            </div>
          )}

          {trend && !loading && (
            <div className={cn('flex items-center gap-1 mt-2', trendColor)}>
              <TrendIcon size={14} />
              <span className="text-xs font-medium">
                {trend.direction === 'up' && '+'}
                {trend.value}%
              </span>
            </div>
          )}
        </div>

        {Icon && (
          <div className="p-2 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400">
            <Icon size={variant === 'large' ? 24 : 20} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Horizontal stat bar for quick stats display
export interface QuickStatProps {
  items: Array<{
    label: string;
    value: number | string;
    icon?: LucideIcon;
    onClick?: () => void;
  }>;
  className?: string;
}

export function QuickStatBar({ items, className }: QuickStatProps) {
  return (
    <div className={cn(
      'flex items-center gap-6 p-4 panel-card overflow-x-auto',
      className
    )}>
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            'flex items-center gap-3 min-w-fit',
            item.onClick && 'cursor-pointer hover:text-primary-500 transition-colors'
          )}
          onClick={item.onClick}
        >
          {item.icon && (
            <item.icon size={18} className="text-gray-400" />
          )}
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-lg font-semibold tabular-nums text-gray-900 dark:text-gray-100">
              {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {item.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
