import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Link2 } from 'lucide-react';
import ServiceCard from './ServiceCard';
import { calculateServerTotal } from './heapUtils';

const ServerColumn = ({
  server,
  priorities,
  priorityList,
  onPriorityChange,
  onDeleteServer,
  onAddService,
  onLinkServer,
  linkedServerName,
  readOnly
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: server.id,
    disabled: readOnly
  });

  const totalHeap = calculateServerTotal(server.services);

  return (
    <div className="server-column">
      <div className="server-header">
        <div className="server-header-top">
          <h3 className="server-name">{server.name}</h3>
          {!readOnly && (
            <button
              className="btn-delete-server"
              onClick={() => onDeleteServer(server.id)}
              title="Delete server"
            >
              &times;
            </button>
          )}
        </div>
        <div className="server-stats">
          <span className="total-heap">Total: {totalHeap} MB</span>
          <span className="service-count">{server.services.length} services</span>
        </div>
        {/* Server link info */}
        <div className="server-link-info">
          {server.linkedServerId ? (
            <button
              className="btn-server-link linked"
              onClick={() => !readOnly && onLinkServer(server.id)}
              title={readOnly ? `Linked to: ${linkedServerName}` : "Click to change linked server"}
              disabled={readOnly}
            >
              <Link2 size={12} />
              <span>{linkedServerName || 'Linked'}</span>
            </button>
          ) : (
            !readOnly && (
              <button
                className="btn-server-link"
                onClick={() => onLinkServer(server.id)}
                title="Link to actual server"
              >
                <Link2 size={12} />
                <span>Link Server</span>
              </button>
            )
          )}
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={`service-list ${isOver && !readOnly ? 'drop-target' : ''}`}
      >
        <SortableContext
          items={server.services.map(s => s.id)}
          strategy={verticalListSortingStrategy}
          disabled={readOnly}
        >
          {server.services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              priorities={priorities}
              priorityList={priorityList}
              onPriorityChange={onPriorityChange}
              readOnly={readOnly}
            />
          ))}
        </SortableContext>
        {server.services.length === 0 && (
          <div className="empty-placeholder">
            {readOnly ? 'No services' : 'Drop services here'}
          </div>
        )}
      </div>
      {!readOnly && (
        <div className="server-footer">
          <button
            className="btn-add-service"
            onClick={() => onAddService(server.id, server.name)}
          >
            + Add Service
          </button>
        </div>
      )}
    </div>
  );
};

export default ServerColumn;
