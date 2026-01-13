import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CircleDashed,
  Wrench,
  Plane,
  type LucideIcon
} from 'lucide-react';

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
  {
    variants: {
      variant: {
        active: 'bg-status-active/10 text-status-active border-status-active/30',
        warning: 'bg-status-warning/10 text-status-warning border-status-warning/30',
        danger: 'bg-status-danger/10 text-status-danger border-status-danger/30',
        inactive: 'bg-status-inactive/10 text-status-inactive border-status-inactive/30',
        info: 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400',
      },
      size: {
        sm: 'text-[10px] px-2 py-0.5',
        default: 'text-xs px-2.5 py-1',
        lg: 'text-sm px-3 py-1.5',
      },
      pulse: {
        true: 'animate-pulse-status',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'active',
      size: 'default',
      pulse: false,
    },
  }
);

const statusIcons: Record<string, LucideIcon> = {
  active: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  inactive: CircleDashed,
  info: Plane,
};

const droneStatusIcons: Record<string, LucideIcon> = {
  active: Plane,
  retired: CircleDashed,
  under_repair: Wrench,
};

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  showIcon?: boolean;
  icon?: LucideIcon;
  droneStatus?: 'active' | 'retired' | 'under_repair';
}

export function StatusBadge({
  className,
  variant,
  size,
  pulse,
  showIcon = true,
  icon,
  droneStatus,
  children,
  ...props
}: StatusBadgeProps) {
  // Determine the icon to use
  let IconComponent: LucideIcon | null = null;

  if (icon) {
    IconComponent = icon;
  } else if (droneStatus) {
    IconComponent = droneStatusIcons[droneStatus] || statusIcons[variant || 'active'];
  } else if (showIcon && variant) {
    IconComponent = statusIcons[variant];
  }

  const iconSize = size === 'sm' ? 10 : size === 'lg' ? 14 : 12;

  return (
    <span
      className={cn(statusBadgeVariants({ variant, size, pulse, className }))}
      {...props}
    >
      {IconComponent && <IconComponent size={iconSize} />}
      {children}
    </span>
  );
}

// Preset status badges for common drone statuses
export function DroneStatusBadge({
  status
}: {
  status: 'active' | 'retired' | 'under_repair'
}) {
  const config = {
    active: { variant: 'active' as const, label: '稼働中' },
    retired: { variant: 'inactive' as const, label: '引退' },
    under_repair: { variant: 'warning' as const, label: '整備中' },
  };

  const { variant, label } = config[status];

  return (
    <StatusBadge variant={variant} droneStatus={status}>
      {label}
    </StatusBadge>
  );
}

// Maintenance type badges
export function MaintenanceTypeBadge({
  type
}: {
  type: 'usage' | 'repair' | 'adjustment' | 'replacement' | 'note'
}) {
  const config = {
    usage: { variant: 'info' as const, label: '使用記録' },
    repair: { variant: 'danger' as const, label: '修理' },
    adjustment: { variant: 'warning' as const, label: '調整' },
    replacement: { variant: 'active' as const, label: '交換' },
    note: { variant: 'inactive' as const, label: 'メモ' },
  };

  const { variant, label } = config[type];

  return (
    <StatusBadge variant={variant} size="sm">
      {label}
    </StatusBadge>
  );
}
