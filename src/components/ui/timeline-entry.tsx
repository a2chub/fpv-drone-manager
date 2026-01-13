import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import {
  Wrench,
  RefreshCw,
  Settings,
  FileText,
  Plane,
  type LucideIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export type TimelineEntryType = 'usage' | 'repair' | 'adjustment' | 'replacement' | 'note';

const typeConfig: Record<TimelineEntryType, {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
}> = {
  usage: {
    icon: Plane,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500',
    borderColor: 'border-l-blue-500',
    label: '使用記録',
  },
  repair: {
    icon: Wrench,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-500',
    borderColor: 'border-l-red-500',
    label: '修理',
  },
  adjustment: {
    icon: Settings,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500',
    borderColor: 'border-l-amber-500',
    label: '調整',
  },
  replacement: {
    icon: RefreshCw,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500',
    borderColor: 'border-l-emerald-500',
    label: '交換',
  },
  note: {
    icon: FileText,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-500',
    borderColor: 'border-l-gray-400',
    label: 'メモ',
  },
};

export interface TimelineEntryProps {
  type: TimelineEntryType;
  title: string;
  description?: string;
  date: Date;
  partName?: string;
  images?: string[];
  isLast?: boolean;
  onClick?: () => void;
  className?: string;
  index?: number;
}

export function TimelineEntry({
  type,
  title,
  description,
  date,
  partName,
  images,
  isLast = false,
  onClick,
  className,
  index = 0,
}: TimelineEntryProps) {
  const config = typeConfig[type];
  const Icon = config.icon;
  const isClickable = !!onClick;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn('relative pl-8', className)}
    >
      {/* Timeline connector line */}
      {!isLast && (
        <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
      )}

      {/* Timeline dot */}
      <div className={cn(
        'absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center',
        'border-2 border-white dark:border-gray-800',
        config.bgColor
      )}>
        <Icon size={12} className="text-white" />
      </div>

      {/* Content */}
      <div
        className={cn(
          'pb-6 border-l-4 pl-4 ml-[-4px]',
          config.borderColor,
          isClickable && 'cursor-pointer group'
        )}
        onClick={onClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                config.color,
                config.bgColor.replace('bg-', 'bg-') + '/10'
              )}>
                {config.label}
              </span>
              {partName && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {partName}
                </span>
              )}
            </div>

            <h4 className={cn(
              'mt-1 font-medium text-gray-900 dark:text-gray-100',
              isClickable && 'group-hover:text-primary-500 transition-colors'
            )}>
              {title}
            </h4>
          </div>

          <time className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap font-mono">
            {format(date, 'yyyy/MM/dd', { locale: ja })}
          </time>
        </div>

        {/* Description */}
        {description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {description}
          </p>
        )}

        {/* Images */}
        {images && images.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {images.slice(0, 4).map((image, i) => (
              <div
                key={i}
                className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700"
              >
                <img
                  src={image}
                  alt={`${title} - ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {images.length > 4 && (
              <div className="w-16 h-16 rounded-lg flex-shrink-0 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{images.length - 4}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Timeline container component
export interface TimelineProps {
  entries: Array<Omit<TimelineEntryProps, 'isLast' | 'index'>>;
  className?: string;
  maxItems?: number;
  emptyMessage?: string;
}

export function Timeline({
  entries,
  className,
  maxItems,
  emptyMessage = '記録がありません',
}: TimelineProps) {
  const displayEntries = maxItems ? entries.slice(0, maxItems) : entries;

  if (displayEntries.length === 0) {
    return (
      <div className={cn(
        'text-center py-8 text-gray-500 dark:text-gray-400',
        className
      )}>
        <FileText size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-0', className)}>
      {displayEntries.map((entry, index) => (
        <TimelineEntry
          key={index}
          {...entry}
          index={index}
          isLast={index === displayEntries.length - 1}
        />
      ))}
    </div>
  );
}
