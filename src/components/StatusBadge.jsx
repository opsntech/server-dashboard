import { Circle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  };

  const iconSize = {
    sm: 12,
    md: 14,
    lg: 16
  };

  const statusConfig = {
    online: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      label: 'Online'
    },
    offline: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircle,
      label: 'Offline'
    },
    unknown: {
      color: 'bg-gray-100 text-gray-600 border-gray-200',
      icon: HelpCircle,
      label: 'Unknown'
    }
  };

  const config = statusConfig[status] || statusConfig.unknown;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${config.color} ${sizeClasses[size]}`}
    >
      <Icon size={iconSize[size]} />
      {config.label}
    </span>
  );
}
