/* eslint-disable @typescript-eslint/no-explicit-any */
import { X } from "lucide-react";
import type { Exercise, ExerciseOnDay } from "../../../types/workout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface WorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any, editingExercise?: ExerciseOnDay) => void;
  globalExercises: Exercise[];
  editingExercise: ExerciseOnDay | null;
  currentDayExercisesCount: number;
}

export const WorkoutModal: React.FC<WorkoutModalProps> = ({
  isOpen,
  onClose,
  onSave,
  globalExercises,
  editingExercise,
  currentDayExercisesCount,
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const payload = {
      exerciseId: formData.get("exerciseId") as string,
      order: editingExercise?.order ?? currentDayExercisesCount + 1,
      sets: Number(formData.get("sets")),
      reps: formData.get("reps") as string,
      weight: Number(formData.get("weight")) || null,
      restTime: Number(formData.get("restTime")) || null,
    };

    onSave(payload, editingExercise || undefined);
    onClose();
  };

  const selectClass = cn(
    "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground shadow-xs",
    "transition-[color,box-shadow] outline-none dark:bg-input/30",
    "focus:border-ring focus:ring-ring/50 focus:ring-[3px]",
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-neusharp text-xl italic text-primary">
              {editingExercise ? "EDITAR EXERCÍCIO" : "NOVO EXERCÍCIO"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome do Exercício</Label>
              <select
                required
                name="exerciseId"
                defaultValue={editingExercise?.exercise?.id || ""}
                className={selectClass}
              >
                <option value="" disabled>
                  Selecione um exercício
                </option>
                {globalExercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} {ex.targetMuscle ? `(${ex.targetMuscle})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Séries</Label>
                <Input
                  required
                  name="sets"
                  type="number"
                  defaultValue={editingExercise?.sets || 4}
                  placeholder="4"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Repetições</Label>
                <Input
                  required
                  name="reps"
                  defaultValue={editingExercise?.reps || "10-12"}
                  placeholder="10-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Carga (kg)</Label>
                <Input
                  name="weight"
                  type="number"
                  step="0.5"
                  defaultValue={editingExercise?.weight || 0}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Descanso (seg)</Label>
                <Input
                  name="restTime"
                  type="number"
                  defaultValue={editingExercise?.restTime || 60}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-neusharp italic mt-4 shadow-lg shadow-primary/20 hover:opacity-90 transition-all font-bold tracking-wider"
            >
              {editingExercise ? "CONFIRMAR EDIÇÃO" : "ADICIONAR AO TREINO"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
