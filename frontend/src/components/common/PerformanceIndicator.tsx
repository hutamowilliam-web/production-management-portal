import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface PerformanceIndicatorProps {
  label: string;
  current: number;
  previous?: number;
  target?: number;
  unit?: string;
  format?: 'number' | 'currency' | 'percentage' | 'time';
  threshold?: {
    warning?: number;
    critical?: number;
  };
  size?: 'sm' | 'md' | 'lg';
  showTrend?: boolean;
}

export const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({
  label,
  current,
  previous,
  target,
  unit = '',
  format = 'number',
  threshold,
  size = 'md',
  showTrend = true,
}) => {
  const { trend, percentChange, status } = useMemo(() => {
    let t: 'up' | 'down' | 'neutral' = 'neutral';
    let pc = 0;
    let s: 'success' | 'warning' | 'critical' = 'success';

    if (previous !== undefined) {
      pc = ((current - previous) / previous) * 100;
      t = pc > 0 ? 'up' : pc < 0 ? 'down' : 'neutral';
    }

    if (threshold?.critical !== undefined && current >= threshold.critical) {
      s = 'critical';
    } else if (threshold?.warning !== undefined && current >= threshold.warning) {
      s = 'warning';
    }

    return { trend: t, percentChange: pc, status: s };
  }, [current, previous, threshold]);

  const formatValue = (value: number): string => {
    switch (format) {
      case 'currency':
        return `R${value.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'time':
        return `${Math.floor(value)}h ${Math.floor((value % 1) * 60)}m`;
      default:
        return value.toLocaleString('en-ZA');
    }
  };

  const sizeClasses = {
    sm: {
      container: 'p-3',
      label: 'text-xs',
      value: 'text-lg',
      trend: 'text-xs',
    },
    md: {
      container: 'p-4',
      label: 'text-sm',
      value: 'text-2xl',
      trend: 'text-sm',
    },
    lg: {
      container: 'p-6',
      label: 'text-base',
      value: 'text-3xl',
      trend: 'text-base',
    },
  };

  const statusColors = {
    success: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    warning: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    critical: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  };

  const classes = sizeClasses[size];

  return (
    <div className={`${classes.container} rounded-lg border border-gray-200 dark:border-gray-700 ${statusColors[status]} transition-colors`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`${classes.label} font-medium text-gray-600 dark:text-gray-400 mb-1`}>
            {label}
          </p>
          <p className={`${classes.value} font-bold`}>
            {formatValue(current)}{unit && <span className={`text-xs ml-1 ${classes.label}`}>{unit}</span>}
          </p>
        </div>

        {status === 'critical' && (
          <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-full ml-2">
            <AlertTriangle size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} className="text-red-600 dark:text-red-400" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {showTrend && previous !== undefined && (
          <div className={`flex items-center gap-1 ${classes.trend} font-medium ${
            trend === 'up' ? 'text-red-600 dark:text-red-400' :
            trend === 'down' ? 'text-green-600 dark:text-green-400' :
            'text-gray-600 dark:text-gray-400'
          }`}>
            {trend === 'up' && <TrendingUp size={size === 'sm' ? 12 : 14} />}
            {trend === 'down' && <TrendingDown size={size === 'sm' ? 12 : 14} />}
            <span>{Math.abs(percentChange).toFixed(1)}% {trend === 'up' ? 'increase' : trend === 'down' ? 'decrease' : ''}</span>
          </div>
        )}

        {target !== undefined && (
          <div className={`${classes.trend} text-gray-500 dark:text-gray-400`}>
            Target: {formatValue(target)}
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceIndicator;
