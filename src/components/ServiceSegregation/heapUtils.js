// Calculate total heap for a server's services
export const calculateServerTotal = (services) => {
  return services.reduce((total, service) => total + (service.maxHeap || 0), 0);
};

// Generate unique ID
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Sanitize string for use in filename
const sanitizeFilename = (str) => {
  return String(str || 'unknown').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 50);
};

// Export configuration as JSON (includes priorities)
export const exportConfig = (servers, priorities, account, environment) => {
  const config = {
    exportedAt: new Date().toISOString(),
    account,
    environment,
    priorities: Object.entries(priorities).map(([name, cfg]) => ({
      name,
      heap: cfg.heap,
      color: cfg.color
    })),
    servers: servers.map(server => ({
      id: server.id,
      name: server.name,
      linkedServerId: server.linkedServerId || null,
      totalHeap: calculateServerTotal(server.services),
      services: server.services.map(service => ({
        name: service.name,
        priority: service.priority,
        maxHeap: service.maxHeap
      }))
    })),
    summary: {
      totalServers: servers.length,
      totalServices: servers.reduce((sum, s) => sum + s.services.length, 0),
      totalHeap: servers.reduce((sum, s) => sum + calculateServerTotal(s.services), 0)
    }
  };

  const safeAccount = sanitizeFilename(account);
  const safeEnv = sanitizeFilename(environment);
  const dateStr = new Date().toISOString().split('T')[0];

  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `service-config-${safeAccount}-${safeEnv}-${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
