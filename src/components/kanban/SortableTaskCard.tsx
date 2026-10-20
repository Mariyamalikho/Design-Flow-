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
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none select-none"
    >
      <TaskCard
        task={task}
        isDragging={isDragging}
        {...props}
      />
    </div>
  );
};
