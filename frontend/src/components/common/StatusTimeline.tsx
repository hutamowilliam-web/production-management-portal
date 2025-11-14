import React from 'react';
import { Clock, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';

interface TimelineItem {
  id: string;
  date: Date;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  color?: string;
}

interface StatusTimelineProps {
  items: TimelineItem[];
  vertical?: boolean;
  compact?: boolean;
  maxItems?: number;
}

const StatusIcon = ({ status, size = 24 }: { status: TimelineItem['status']; size?: number }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 size={size} className="text-green-600" />;
    case 'in_progress':
      return <Clock size={size} className="text-blue-600 animate-spin" />;
    case 'error':
      return <AlertCircle size={size} className="text-red-600" />;
    default:
      return <Clock size={size} className="text-gray-400" />;
  }
};

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  items,
  vertical = true,
  compact = false,
  maxItems = 5,
}) => {
  const displayItems = items.slice(0, maxItems);

  if (vertical) {
    return (
      <div className={`relative ${compact ? 'space-y-2' : 'space-y-4'}`}>
        {displayItems.map((item, index) => (
          <div key={item.id} className={`flex gap-${compact ? '2' : '4'}`}>
            {/* Timeline dot and line */}
            <div className="flex flex-col items-center">
              <div className={`rounded-full p-1 bg-white border-2 ${
                item.status === 'completed' ? 'border-green-500 bg-green-50' :
                item.status === 'in_progress' ? 'border-blue-500 bg-blue-50' :
                item.status === 'error' ? 'border-red-500 bg-red-50' :
                'border-gray-300 bg-gray-50'
              }`}>
                <StatusIcon status={item.status} size={compact ? 16 : 20} />
              </div>
              {index < displayItems.length - 1 && (
                <div className={`w-1 ${compact ? 'h-6' : 'h-10'} ${
                  item.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                }`} />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 ${compact ? 'py-0.5' : 'py-2'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`font-medium text-gray-900 dark:text-white ${compact ? 'text-sm' : 'text-base'}`}>
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className={`text-gray-600 dark:text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
                      {item.description}
                    </p>
                  )}
                </div>
                <div className={`flex items-center gap-1 text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4 ${compact ? 'text-xs' : 'text-sm'}`}>
                  <Calendar size={compact ? 14 : 16} />
                  {item.date.toLocaleDateString('en-ZA', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {items.length > maxItems && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
            +{items.length - maxItems} more items
          </div>
        )}
      </div>
    );
  }

  // Horizontal timeline
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {displayItems.map((item, index) => (
        <div key={item.id} className="flex flex-col items-center min-w-max">
          <div className={`rounded-full p-2 bg-white border-2 ${
            item.status === 'completed' ? 'border-green-500 bg-green-50' :
            item.status === 'in_progress' ? 'border-blue-500 bg-blue-50' :
            item.status === 'error' ? 'border-red-500 bg-red-50' :
            'border-gray-300 bg-gray-50'
          }`}>
            <StatusIcon status={item.status} size={20} />
          </div>
          <div className={`mt-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 max-w-[80px]`}>
            {item.title}
          </div>
          {index < displayItems.length - 1 && (
            <div className="h-1 w-4 bg-gray-200 mt-2" />
          )}
        </div>
      ))}
    </div>
  );
};

export default StatusTimeline;
