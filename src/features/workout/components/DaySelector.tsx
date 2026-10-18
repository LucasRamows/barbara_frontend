import React from "react";
import type { DayOfWeek, WorkoutDay } from "../../../types/workout";

interface DaySelectorProps {
  workoutDays: WorkoutDay[];
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  workoutDays,
  selectedDay,
  onSelectDay,
}) => {
  if (!workoutDays.length) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
      {workoutDays.map((day) => (
        <button
          key={day.id}
          onClick={() => onSelectDay(day.day as DayOfWeek)}
          className={`flex-shrink-0 px-5 py-2 rounded-xl text-xs font-bold transition-all border ${
            selectedDay === day.day
              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
              : "bg-card text-muted-foreground border-border hover:bg-secondary/50"
          }`}
        >
          {day.label ? `${day.label} (${day.day.slice(0, 3)})` : day.day.slice(0, 3)}
        </button>
      ))}
    </div>
  );
};
