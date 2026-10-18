import { X } from "lucide-react";
import React from "react";
import type { DayOfWeek } from "../../../types/workout";

interface DayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (day: DayOfWeek, label: string | null) => void;
}

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
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                Dia da Semana
              </label>
              <select
                required
                name="day"
                className="w-full bg-secondary/50 border border-border rounded-xl p-3 focus:outline-none focus:border-primary transition-all font-medium text-sm"
                defaultValue=""
              >
                <option value="" disabled>Selecione um dia</option>
                {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                Nome do Treino (opcional)
              </label>
              <input
                name="label"
                placeholder="Ex: Push Day, Pernas, Costas"
                className="w-full bg-secondary/50 border border-border rounded-xl p-3 focus:outline-none focus:border-primary transition-all font-medium text-sm"
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
