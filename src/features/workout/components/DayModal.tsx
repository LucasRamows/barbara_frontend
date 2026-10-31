import { X } from "lucide-react";
import React from "react";
import type { DayOfWeek } from "../../../types/workout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (day: DayOfWeek, label: string | null) => void;
}

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Segunda-feira",
  TUESDAY: "Terça-feira",
  WEDNESDAY: "Quarta-feira",
  THURSDAY: "Quinta-feira",
  FRIDAY: "Sexta-feira",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

export const DayModal: React.FC<DayModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const day = formData.get("day") as DayOfWeek;
    const label = formData.get("label") as string;
    onSave(day, label);
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
            <h2 className="font-neusharp text-xl italic text-primary">ADICIONAR DIA</h2>
            <button
              onClick={onClose}
              className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Dia da Semana</Label>
              <select
                required
                name="day"
                defaultValue=""
                className={selectClass}
              >
                <option value="" disabled>Selecione um dia</option>
                {Object.entries(DAY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Nome do Treino (opcional)</Label>
              <Input
                name="label"
                placeholder="Ex: Push Day, Pernas, Costas"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-neusharp italic mt-4 shadow-lg shadow-primary/20 hover:opacity-90 transition-all font-bold tracking-wider"
            >
              CRIAR NOVO TREINO
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
