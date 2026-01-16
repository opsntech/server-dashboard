// Browser-based connection testing utilities
// Note: True ICMP ping is not possible from browsers for security reasons
// These methods provide alternative ways to check connectivity

export async function checkServerStatus(ip, hostname) {
  // In a browser environment, we can't do actual ping
  // This is a placeholder that returns 'unknown' status
  // In a real implementation, you would need:
  // 1. A backend API that performs the actual ping
  // 2. Or use WebSocket/HTTP health check endpoints on the servers

  return {
    status: 'unknown',
    message: 'Manual verification required - browser cannot perform ICMP ping',
    timestamp: new Date().toISOString()
  };
}

export function formatLastChecked(timestamp) {
  if (!timestamp) return 'Never';

  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

export function getStatusColor(status) {
  switch (status) {
    case 'online':
      return 'text-green-600 bg-green-100';
    case 'offline':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}
