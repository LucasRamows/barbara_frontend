/* eslint-disable @typescript-eslint/no-explicit-any */
import { X } from "lucide-react";
import type { Exercise, ExerciseOnDay } from "../../../types/workout";

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
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                Nome do Exercício
              </label>
              <select
                required
                name="exerciseId"
                defaultValue={editingExercise?.exercise?.id || ""}
                className="w-full bg-secondary/50 border border-border rounded-xl p-3 focus:outline-none focus:border-primary transition-all font-medium text-sm"
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
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                  Séries
                </label>
                <input
                  required
                  name="sets"
                  type="number"
                  defaultValue={editingExercise?.sets || 4}
                  placeholder="4"
                  className="w-full bg-secondary/50 border border-border rounded-xl p-3 focus:outline-none focus:border-primary transition-all font-medium text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                  Repetições
                </label>
                <input
                  required
                  name="reps"
                  defaultValue={editingExercise?.reps || "10-12"}
                  placeholder="10-12"
                  className="w-full bg-secondary/50 border border-border rounded-xl p-3 focus:outline-none focus:border-primary transition-all font-medium text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                  Carga (kg)
                </label>
                <input
                  name="weight"
                  type="number"
                  step="0.5"
                  defaultValue={editingExercise?.weight || 0}
                  className="w-full bg-secondary/50 border border-border rounded-xl p-3 focus:outline-none focus:border-primary transition-all font-medium text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                  Descanso (seg)
                </label>
                <input
                  name="restTime"
                  type="number"
                  defaultValue={editingExercise?.restTime || 60}
                  className="w-full bg-secondary/50 border border-border rounded-xl p-3 focus:outline-none focus:border-primary transition-all font-medium text-sm"
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
