import { useCallback, useMemo, useState } from 'react';
import ServerGrid from './ServerGrid';
import PriorityManager from './PriorityManager';
import AddServiceModal from './AddServiceModal';
import DeleteServerModal from './DeleteServerModal';
import ServerLinkModal from './ServerLinkModal';
import { exportConfig, calculateServerTotal } from './heapUtils';

// Default priority configuration
const DEFAULT_PRIORITIES = {
  HIGH: { heap: 512, color: '#ff6b6b' },
  MEDIUM: { heap: 256, color: '#ffd93d' },
  LOW: { heap: 128, color: '#6bcb77' }
};

function ServiceSegregationApp({
  config,
  onUpdateConfig,
  realServers = [],
  readOnly = false,
  account,
  environment
}) {
  const servers = config?.appServers || [];
  const priorities = config?.priorities || DEFAULT_PRIORITIES;

  // Modal states
  const [addServiceModal, setAddServiceModal] = useState({ isOpen: false, serverId: null, serverName: '' });
  const [deleteServerModal, setDeleteServerModal] = useState({ isOpen: false, server: null });
  const [linkServerModal, setLinkServerModal] = useState({ isOpen: false, server: null });

  // Helper to update servers
  const updateServers = useCallback((newServers) => {
    onUpdateConfig({ appServers: newServers });
  }, [onUpdateConfig]);

  // Helper to update priorities
  const updatePriorities = useCallback((newPriorities) => {
    onUpdateConfig({ priorities: newPriorities });
  }, [onUpdateConfig]);

  // Get heap value for a priority
  const getHeapForPriority = useCallback((priority) => {
    return priorities[priority]?.heap || 128;
  }, [priorities]);

  // Handle service priority change
  const handlePriorityChange = useCallback((serviceId, newPriority) => {
    const newHeap = getHeapForPriority(newPriority);
    const newServers = servers.map(server => ({
      ...server,
      services: server.services.map(service =>
        service.id === serviceId
          ? { ...service, priority: newPriority, maxHeap: newHeap }
          : service
      )
    }));
    updateServers(newServers);
  }, [servers, getHeapForPriority, updateServers]);

  // Handle drag end - move service between servers
  const handleDragEnd = useCallback((sourceServerId, targetServerId, serviceId, overId) => {
    if (sourceServerId === targetServerId) {
      const newServers = servers.map(server => {
        if (server.id !== sourceServerId) return server;

        const services = [...server.services];
        const oldIndex = services.findIndex(s => s.id === serviceId);
        const newIndex = services.findIndex(s => s.id === overId);

        if (oldIndex === -1) return server;

        const [movedService] = services.splice(oldIndex, 1);

        if (newIndex === -1) {
          services.push(movedService);
        } else {
          services.splice(newIndex, 0, movedService);
        }

        return { ...server, services };
      });
      updateServers(newServers);
    } else {
      let movedService = null;

      let newServers = servers.map(server => {
        if (server.id === sourceServerId) {
          const serviceIndex = server.services.findIndex(s => s.id === serviceId);
          if (serviceIndex !== -1) {
            movedService = { ...server.services[serviceIndex] };
            return {
              ...server,
              services: server.services.filter(s => s.id !== serviceId)
            };
          }
        }
        return server;
      });

      if (!movedService) return;

      movedService.id = `${targetServerId}-${movedService.name}`;

      newServers = newServers.map(server => {
        if (server.id === targetServerId) {
          const overIndex = server.services.findIndex(s => s.id === overId);
          const newServices = [...server.services];

          if (overIndex === -1) {
            newServices.push(movedService);
          } else {
            newServices.splice(overIndex, 0, movedService);
          }

          return { ...server, services: newServices };
        }
        return server;
      });

      updateServers(newServers);
    }
  }, [servers, updateServers]);

  // Handle priority configuration update
  const handleUpdatePriority = useCallback((priorityName, updates) => {
    const newPriorities = {
      ...priorities,
      [priorityName]: { ...priorities[priorityName], ...updates }
    };
    updatePriorities(newPriorities);

    if (updates.heap !== undefined) {
      const newServers = servers.map(server => ({
        ...server,
        services: server.services.map(service =>
          service.priority === priorityName
            ? { ...service, maxHeap: updates.heap }
            : service
        )
      }));
      updateServers(newServers);
    }
  }, [priorities, servers, updatePriorities, updateServers]);

  // Handle adding new priority
  const handleAddPriority = useCallback((newPriority) => {
    const newPriorities = {
      ...priorities,
      [newPriority.name]: { heap: newPriority.heap, color: newPriority.color }
    };
    updatePriorities(newPriorities);
  }, [priorities, updatePriorities]);

  // Handle deleting a priority
  const handleDeletePriority = useCallback((priorityName) => {
    const newServers = servers.map(server => ({
      ...server,
      services: server.services.map(service =>
        service.priority === priorityName
          ? { ...service, priority: 'LOW', maxHeap: priorities.LOW?.heap || 128 }
          : service
      )
    }));
    updateServers(newServers);

    const newPriorities = { ...priorities };
    delete newPriorities[priorityName];
    updatePriorities(newPriorities);
  }, [priorities, servers, updatePriorities, updateServers]);

  // Handle adding new server
  const handleAddServer = useCallback((serverName) => {
    const newServer = {
      id: `server-${Date.now()}`,
      name: serverName,
      linkedServerId: null,
      services: []
    };
    updateServers([...servers, newServer]);
  }, [servers, updateServers]);

  // Open add service modal
  const handleOpenAddService = useCallback((serverId, serverName) => {
    setAddServiceModal({ isOpen: true, serverId, serverName });
  }, []);

  // Close add service modal
  const handleCloseAddService = useCallback(() => {
    setAddServiceModal({ isOpen: false, serverId: null, serverName: '' });
  }, []);

  // Add new service to a server
  const handleAddService = useCallback((serviceName, priority) => {
    const { serverId } = addServiceModal;
    if (!serverId) return;

    const newService = {
      id: `${serverId}-${serviceName}-${Date.now()}`,
      name: serviceName,
      priority,
      maxHeap: getHeapForPriority(priority)
    };

    const newServers = servers.map(server =>
      server.id === serverId
        ? { ...server, services: [...server.services, newService] }
        : server
    );
    updateServers(newServers);
  }, [addServiceModal, servers, getHeapForPriority, updateServers]);

  // Open delete server modal
  const handleOpenDeleteServer = useCallback((serverId) => {
    const server = servers.find(s => s.id === serverId);
    if (server) {
      setDeleteServerModal({ isOpen: true, server });
    }
  }, [servers]);

  // Close delete server modal
  const handleCloseDeleteServer = useCallback(() => {
    setDeleteServerModal({ isOpen: false, server: null });
  }, []);

  // Delete server without keeping services
  const handleDeleteWithoutServices = useCallback((serverId) => {
    updateServers(servers.filter(s => s.id !== serverId));
    handleCloseDeleteServer();
  }, [servers, updateServers, handleCloseDeleteServer]);

  // Delete server and redistribute services to other servers (load-balanced)
  const handleDeleteWithReallocation = useCallback((serverId) => {
    const serverToDelete = servers.find(s => s.id === serverId);
    if (!serverToDelete) return;

    const servicesToReallocate = [...serverToDelete.services];
    const otherServers = servers.filter(s => s.id !== serverId);

    if (otherServers.length === 0) {
      return;
    }

    // Calculate current load for each server
    const serverLoads = otherServers.map(server => ({
      id: server.id,
      currentHeap: calculateServerTotal(server.services),
      servicesToAdd: []
    }));

    // Distribute services to servers with lowest load (greedy algorithm)
    servicesToReallocate.forEach(service => {
      // Find server with minimum current load
      serverLoads.sort((a, b) => a.currentHeap - b.currentHeap);
      const targetServer = serverLoads[0];

      // Add service to target and update its load
      targetServer.servicesToAdd.push({
        ...service,
        id: `${targetServer.id}-${service.name}`
      });
      targetServer.currentHeap += service.maxHeap;
    });

    // Build new servers array
    const newServers = otherServers.map(server => {
      const loadInfo = serverLoads.find(l => l.id === server.id);
      if (loadInfo && loadInfo.servicesToAdd.length > 0) {
        return {
          ...server,
          services: [...server.services, ...loadInfo.servicesToAdd]
        };
      }
      return server;
    });

    updateServers(newServers);
    handleCloseDeleteServer();
  }, [servers, updateServers, handleCloseDeleteServer]);

  // Handle server linking
  const handleOpenLinkServer = useCallback((serverId) => {
    const server = servers.find(s => s.id === serverId);
    if (server) {
      setLinkServerModal({ isOpen: true, server });
    }
  }, [servers]);

  const handleCloseLinkServer = useCallback(() => {
    setLinkServerModal({ isOpen: false, server: null });
  }, []);

  const handleLinkServer = useCallback((appServerId, realServerId) => {
    const newServers = servers.map(server =>
      server.id === appServerId
        ? { ...server, linkedServerId: realServerId }
        : server
    );
    updateServers(newServers);
  }, [servers, updateServers]);

  // Calculate totals
  const totalHeap = useMemo(() =>
    servers.reduce((sum, server) => sum + calculateServerTotal(server.services), 0),
    [servers]
  );

  const totalServices = useMemo(() =>
    servers.reduce((sum, server) => sum + server.services.length, 0),
    [servers]
  );

  // Priority list for dropdowns
  const priorityList = useMemo(() => Object.keys(priorities), [priorities]);

  // Other servers for reallocation
  const otherServers = useMemo(() => {
    if (!deleteServerModal.server) return [];
    return servers.filter(s => s.id !== deleteServerModal.server.id);
  }, [servers, deleteServerModal.server]);

  // Map of linked server IDs to server objects
  const linkedServersMap = useMemo(() => {
    const map = {};
    realServers.forEach(server => {
      map[server.id] = server;
    });
    return map;
  }, [realServers]);

  const handleExport = () => {
    exportConfig(servers, priorities, account, environment);
  };

  return (
    <div className="service-segregation-app">
      <div className="ss-header">
        <div className="ss-header-left">
          <h2>Service Allocation</h2>
          <p className="ss-subtitle">Drag services between servers to redistribute load</p>
        </div>
        {!readOnly && (
          <div className="ss-header-right">
            <button className="btn btn-primary" onClick={handleExport}>
              Export JSON
            </button>
          </div>
        )}
      </div>

      <PriorityManager
        priorities={priorities}
        onUpdatePriority={handleUpdatePriority}
        onAddPriority={handleAddPriority}
        onDeletePriority={handleDeletePriority}
        readOnly={readOnly}
      />

      <ServerGrid
        servers={servers}
        priorities={priorities}
        priorityList={priorityList}
        onDragEnd={handleDragEnd}
        onPriorityChange={handlePriorityChange}
        onDeleteServer={handleOpenDeleteServer}
        onAddServer={handleAddServer}
        onAddService={handleOpenAddService}
        onLinkServer={handleOpenLinkServer}
        linkedServersMap={linkedServersMap}
        readOnly={readOnly}
      />

      <div className="ss-footer">
        <div className="ss-footer-stats">
          <span>Total Servers: <strong>{servers.length}</strong></span>
          <span>Total Services: <strong>{totalServices}</strong></span>
          <span>Total Heap: <strong>{totalHeap} MB</strong></span>
        </div>
      </div>

      {/* Modals */}
      <AddServiceModal
        isOpen={addServiceModal.isOpen}
        onClose={handleCloseAddService}
        onAddService={handleAddService}
        priorities={priorities}
        priorityList={priorityList}
        serverName={addServiceModal.serverName}
      />

      <DeleteServerModal
        isOpen={deleteServerModal.isOpen}
        onClose={handleCloseDeleteServer}
        server={deleteServerModal.server}
        otherServers={otherServers}
        onDeleteWithReallocation={handleDeleteWithReallocation}
        onDeleteWithoutServices={handleDeleteWithoutServices}
      />

      <ServerLinkModal
        isOpen={linkServerModal.isOpen}
        onClose={handleCloseLinkServer}
        appServer={linkServerModal.server}
        realServers={realServers}
        currentLinkedId={linkServerModal.server?.linkedServerId}
        onLink={handleLinkServer}
      />
    </div>
  );
}

export default ServiceSegregationApp;
