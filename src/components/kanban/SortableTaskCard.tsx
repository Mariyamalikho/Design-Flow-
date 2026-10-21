import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard, type TaskCardProps } from "./TaskCard";

export interface SortableTaskCardProps extends TaskCardProps {
  id: number;
}

export const SortableTaskCard: React.FC<SortableTaskCardProps> = ({
  id,
  task,
  ...props
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: "Task",
      task,
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 220ms cubic-bezier(0.2, 0, 0, 1), opacity 180ms ease",
    zIndex: isDragging ? 0 : undefined,
    willChange: isDragging ? "transform" : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none select-none relative transition-transform duration-200"
    >
      <TaskCard
        task={task}
        isDragging={isDragging}
        {...props}
      />
    </div>
  );
};
