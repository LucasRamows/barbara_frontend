import { Clock, Dumbbell, GripVertical, Pencil, Trash2 } from "lucide-react";
import React from "react";
import type { ExerciseOnDay } from "../../../types/workout";

interface ExerciseCardProps {
  exerciseData: ExerciseOnDay;
  index: number;
  onEdit: (ex: ExerciseOnDay) => void;
  onDelete: (id: string) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exerciseData: ex,
  index,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="group bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-all shadow-sm">
      <div className="flex items-center gap-4">
        {/* Drag icon */}
        <div className="text-muted-foreground/40 cursor-grab active:cursor-grabbing">
          <GripVertical size={20} />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-neusharp text-primary italic">
              #{index + 1}
            </span>
            <h3 className="font-bold text-sm uppercase tracking-tight truncate max-w-[180px] sm:max-w-none">
              {ex.exercise.name}
            </h3>
          </div>

          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded text-foreground font-medium">
              <Dumbbell size={12} className="text-primary" /> {ex.sets}x{ex.reps}
            </span>
            {ex.weight != null && ex.weight > 0 && (
              <span className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded text-foreground font-medium">
                {ex.weight} kg
              </span>
            )}
            {ex.restTime && (
              <span className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded">
                <Clock size={12} /> {ex.restTime}s
              </span>
            )}
            {ex.exercise.targetMuscle && (
              <span className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded opacity-80 uppercase text-[9px]">
                {ex.exercise.targetMuscle}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(ex)}
            className="p-2 text-muted-foreground hover:text-primary transition-colors bg-secondary/30 rounded-xl"
            title="Edit exercise"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => {
              if (confirm("Deseja remover este exercício?")) {
                onDelete(ex.id);
              }
            }}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors bg-secondary/30 rounded-xl"
            title="Remove exercise"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
