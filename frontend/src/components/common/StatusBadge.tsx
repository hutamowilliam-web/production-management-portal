import React from 'react';
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'subtle';
  showIcon?: boolean;
  onClick?: () => void;
  className?: string;
}

const statusConfig: Record<string, any> = {
  // Internal Rejects Statuses
  pending: {
    label: 'Pending',
    icon: Clock,
    colors: {
      solid: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      outline: 'border border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-300',
      subtle: 'text-yellow-700 dark:text-yellow-400',
    },
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    colors: {
      solid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      outline: 'border border-green-300 text-green-700 dark:border-green-700 dark:text-green-300',
      subtle: 'text-green-700 dark:text-green-400',
    },
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    colors: {
      solid: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      outline: 'border border-red-300 text-red-700 dark:border-red-700 dark:text-red-300',
      subtle: 'text-red-700 dark:text-red-400',
    },
  },
  escalated: {
    label: 'Escalated',
    icon: AlertCircle,
    colors: {
      solid: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      outline: 'border border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-300',
      subtle: 'text-orange-700 dark:text-orange-400',
    },
  },
  closed: {
    label: 'Closed',
    icon: CheckCircle2,
    colors: {
      solid: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
      subtle: 'text-gray-700 dark:text-gray-400',
    },
  },
  // Customer Returns Statuses
  credited: {
    label: 'Credited',
    icon: CheckCircle2,
    colors: {
      solid: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      outline: 'border border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300',
      subtle: 'text-blue-700 dark:text-blue-400',
    },
  },
  replaced: {
    label: 'Replaced',
    icon: CheckCircle2,
    colors: {
      solid: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      outline: 'border border-indigo-300 text-indigo-700 dark:border-indigo-700 dark:text-indigo-300',
      subtle: 'text-indigo-700 dark:text-indigo-400',
    },
  },
  'credit_and_replaced': {
    label: 'Credit & Replaced',
    icon: CheckCircle2,
    colors: {
      solid: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      outline: 'border border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300',
      subtle: 'text-purple-700 dark:text-purple-400',
    },
  },
  // Maintenance Ticket Statuses
  open: {
    label: 'Open',
    icon: AlertCircle,
    colors: {
      solid: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      outline: 'border border-red-300 text-red-700 dark:border-red-700 dark:text-red-300',
      subtle: 'text-red-700 dark:text-red-400',
    },
  },
  'in_progress': {
    label: 'In Progress',
    icon: Clock,
    colors: {
      solid: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      outline: 'border border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300',
      subtle: 'text-blue-700 dark:text-blue-400',
    },
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    colors: {
      solid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      outline: 'border border-green-300 text-green-700 dark:border-green-700 dark:text-green-300',
      subtle: 'text-green-700 dark:text-green-400',
    },
  },
  // SOP Failure Statuses
  'under_investigation': {
    label: 'Under Investigation',
    icon: Clock,
    colors: {
      solid: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      outline: 'border border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-300',
      subtle: 'text-yellow-700 dark:text-yellow-400',
    },
  },
  corrected: {
    label: 'Corrected',
    icon: CheckCircle2,
    colors: {
      solid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      outline: 'border border-green-300 text-green-700 dark:border-green-700 dark:text-green-300',
      subtle: 'text-green-700 dark:text-green-400',
    },
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  variant = 'solid',
  showIcon = true,
  onClick,
  className = '',
}) => {
  const config = statusConfig[status] || {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    icon: AlertCircle,
    colors: {
      solid: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
      subtle: 'text-gray-700 dark:text-gray-400',
    },
  };

  const Icon = config.icon;
  const colorClass = config.colors[variant];

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  return (
    <span
      onClick={onClick}
      className={clsx(
        'inline-flex items-center font-medium rounded-full transition-colors',
        variant === 'solid' && 'rounded-lg',
        sizeClasses[size],
        colorClass,
        onClick && 'cursor-pointer hover:opacity-80',
        className
      )}
    >
      {showIcon && <Icon size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />}
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
