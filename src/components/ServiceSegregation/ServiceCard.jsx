import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const ServiceCard = ({ service, priorities, priorityList, onPriorityChange, readOnly }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: service.id, disabled: readOnly });

  // Get color from dynamic priorities
  const getColor = () => {
    return priorities[service.priority]?.color || '#6bcb77';
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: getColor(),
    opacity: isDragging ? 0.5 : 1,
    cursor: readOnly ? 'default' : (isDragging ? 'grabbing' : 'grab')
  };

  const handlePriorityChange = (e) => {
    e.stopPropagation();
    const newPriority = e.target.value;
    onPriorityChange(service.id, newPriority);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="service-card"
      {...attributes}
      {...(readOnly ? {} : listeners)}
    >
      <div className="service-info">
        <span className="service-name" title={service.name}>
          {service.name}
        </span>
        <span className="service-heap">{service.maxHeap}MB</span>
      </div>
      {readOnly ? (
        <span className="priority-badge">{service.priority}</span>
      ) : (
        <select
          className="priority-dropdown"
          value={service.priority}
          onChange={handlePriorityChange}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {priorityList.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default ServiceCard;
