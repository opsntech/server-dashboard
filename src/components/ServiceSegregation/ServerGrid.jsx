import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection
} from '@dnd-kit/core';
import { useState } from 'react';
import ServerColumn from './ServerColumn';
import AddServerButton from './AddServerButton';

const ServerGrid = ({
  servers,
  priorities,
  priorityList,
  onDragEnd,
  onPriorityChange,
  onDeleteServer,
  onAddServer,
  onAddService,
  onLinkServer,
  linkedServersMap,
  readOnly
}) => {
  const [activeService, setActiveService] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event) => {
    if (readOnly) return;
    const { active } = event;
    for (const server of servers) {
      const service = server.services.find(s => s.id === active.id);
      if (service) {
        setActiveService(service);
        break;
      }
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveService(null);

    if (readOnly || !over) return;

    let sourceServer = null;
    let draggedService = null;

    for (const server of servers) {
      const service = server.services.find(s => s.id === active.id);
      if (service) {
        sourceServer = server;
        draggedService = service;
        break;
      }
    }

    if (!sourceServer || !draggedService) return;

    let targetServer = null;
    targetServer = servers.find(s => s.id === over.id);

    if (!targetServer) {
      for (const server of servers) {
        if (server.services.find(s => s.id === over.id)) {
          targetServer = server;
          break;
        }
      }
    }

    if (!targetServer) return;

    onDragEnd(sourceServer.id, targetServer.id, draggedService.id, over.id);
  };

  const collisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    return rectIntersection(args);
  };

  // Get color for active service from priorities
  const getActiveColor = () => {
    if (!activeService) return '#6bcb77';
    return priorities[activeService.priority]?.color || '#6bcb77';
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="server-grid">
        {servers.map((server) => (
          <ServerColumn
            key={server.id}
            server={server}
            priorities={priorities}
            priorityList={priorityList}
            onPriorityChange={onPriorityChange}
            onDeleteServer={onDeleteServer}
            onAddService={onAddService}
            onLinkServer={onLinkServer}
            linkedServerName={linkedServersMap?.[server.linkedServerId]?.hostname || null}
            readOnly={readOnly}
          />
        ))}
        {!readOnly && (
          <AddServerButton
            onAddServer={onAddServer}
            serverCount={servers.length}
          />
        )}
      </div>
      <DragOverlay>
        {activeService ? (
          <div
            className="service-card dragging"
            style={{
              backgroundColor: getActiveColor()
            }}
          >
            <div className="service-info">
              <span className="service-name">{activeService.name}</span>
              <span className="service-heap">{activeService.maxHeap}MB</span>
            </div>
            <span className="priority-badge">{activeService.priority}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ServerGrid;
