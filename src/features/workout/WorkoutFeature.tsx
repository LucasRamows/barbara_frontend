import { Plus } from "lucide-react";
import React, { useState } from "react";
import type { DayOfWeek, ExerciseOnDay } from "../../types/workout";
import { DayModal } from "./components/DayModal";
import { DaySelector } from "./components/DaySelector";
import { ExerciseCard } from "./components/ExerciseCard";
import { WorkoutModal } from "./components/WorkoutModal";
import { useWorkout } from "./hooks/useWorkout";

export const WorkoutFeature: React.FC = () => {
  const {
    workoutDays,
    globalExercises,
    loading,
    addDay,
    saveExercise,
    deleteExercise,
  } = useWorkout();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("MONDAY");
  const [isWorkoutModalOpen, setWorkoutModalOpen] = useState(false);
  const [isDayModalOpen, setDayModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseOnDay | null>(null);

  const currentDayData = workoutDays.find((d) => d.day === selectedDay);

  const openWorkoutModal = (exercise?: ExerciseOnDay) => {
    setEditingExercise(exercise || null);
    setWorkoutModalOpen(true);
  };

  const currentExercisesCount = currentDayData?.exercises.length || 0;

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-neusharp text-lg text-primary tracking-tighter italic uppercase">
            Plano de Treino
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Gerencie sua rotina semanal de exercícios
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDayModalOpen(true)}
            className="flex items-center gap-1 bg-secondary text-foreground px-3 py-1.5 rounded-full text-xs font-bold hover:bg-secondary/80 transition-colors"
          >
            <Plus size={14} /> <span className="hidden sm:inline">Dia de Treino</span>
          </button>
          
          {currentDayData && (
             <button
             onClick={() => openWorkoutModal()}
             className="bg-primary text-primary-foreground p-2 rounded-full hover:opacity-90 transition-all shadow-md shadow-primary/20"
           >
             <Plus size={18} />
           </button>
          )}
        </div>
      </div>

      <DaySelector
        workoutDays={workoutDays}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
      />

      <div className="space-y-4">
        <div className="flex justify-between items-end mb-2">
          <h2 className="font-neusharp text-xl uppercase italic text-foreground tracking-tight">
            {currentDayData?.label || "Selecione ou crie um dia"}
          </h2>
          <span className="text-[10px] font-bold text-primary opacity-70 bg-primary/10 px-2 py-1 rounded-full">
            {currentExercisesCount} EXERCÍCIOS
          </span>
        </div>

        {currentDayData?.exercises
          .sort((a, b) => a.order - b.order)
          .map((ex, index) => (
            <ExerciseCard
              key={ex.id}
              exerciseData={ex}
              index={index}
              onEdit={openWorkoutModal}
              onDelete={(id) => deleteExercise(currentDayData.id, id)}
            />
          ))}

        {workoutDays.length > 0 && (!currentDayData || currentExercisesCount === 0) && (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-3xl bg-secondary/10 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4 text-muted-foreground">
              <Plus size={24} />
            </div>
            <p className="font-medium text-sm text-foreground">
              Nenhum exercício neste dia
            </p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Adicione exercícios para montar seu treino
            </p>
            {currentDayData && (
              <button
                onClick={() => openWorkoutModal()}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold text-xs shadow-md shadow-primary/20 hover:opacity-90 transition-all"
              >
                ADICIONAR PRIMEIRO
              </button>
            )}
          </div>
        )}

        {workoutDays.length === 0 && (
           <div className="text-center py-16 border-2 border-dashed border-border rounded-3xl bg-secondary/10">
           <p className="font-medium text-sm text-foreground">
             Nenhum treino criado
           </p>
           <button
             onClick={() => setDayModalOpen(true)}
             className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold text-xs shadow-md shadow-primary/20 hover:opacity-90 transition-all"
           >
             CRIAR PRIMEIRO DIA
           </button>
         </div>
        )}
      </div>

      <WorkoutModal
        isOpen={isWorkoutModalOpen}
        onClose={() => setWorkoutModalOpen(false)}
        onSave={(payload, editingEx) => {
          if (currentDayData) {
            saveExercise(currentDayData.id, payload, editingEx);
          }
        }}
        globalExercises={globalExercises}
        editingExercise={editingExercise}
        currentDayExercisesCount={currentExercisesCount}
      />

      <DayModal
        isOpen={isDayModalOpen}
        onClose={() => setDayModalOpen(false)}
        onSave={addDay}
      />
    </div>
  );
};
