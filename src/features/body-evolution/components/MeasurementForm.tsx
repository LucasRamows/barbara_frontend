import { X } from "lucide-react";
import React from "react";
import type { MeasurementRecord } from "../../../types/body-evolution";

interface MeasurementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: Partial<MeasurementRecord>) => void;
  initialData?: MeasurementRecord | null;
}

export const MeasurementForm: React.FC<MeasurementFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      month: formData.get("month") as string,
      weight: Number(formData.get("weight")),
      chest: Number(formData.get("chest")),
      waist: Number(formData.get("waist")),
      arms: Number(formData.get("arms")),
      legs: Number(formData.get("legs")),
      shoulders: Number(formData.get("shoulders")) || undefined,
    };
    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-neusharp text-xl italic text-primary">
              {initialData ? "EDITAR MEDIDAS" : "NOVA MEDIDA"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                  Mês (AAAA-MM)
                </label>
                <input
                  required
                  type="month"
                  name="month"
                  defaultValue={initialData?.month}
                  className="w-full bg-secondary/50 border border-border rounded-xl p-3 focus:outline-none focus:border-primary transition-all font-medium text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                  Peso (kg)
                </label>
                <input
                  required
                  name="weight"
                  type="number"
                  step="0.1"
                  defaultValue={initialData?.weight}
                  className="w-full bg-secondary/50 border border-border rounded-xl p-3 focus:outline-none focus:border-primary transition-all font-medium text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                  Peito (cm)
                </label>
                <input
                  required
                  name="chest"
                  type="number"
                  step="0.1"
                  defaultValue={initialData?.chest}
                  className="w-full bg-secondary/50 border border-border rounded-xl p-3 focus:outline-none focus:border-primary transition-all font-medium text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                  Ombros (cm)
                </label>
                <input
                  name="shoulders"
                  type="number"
                  step="0.1"
                  defaultValue={initialData?.shoulders}
                  className="w-full bg-secondary/50 border border-border rounded-xl p-3 focus:outline-none focus:border-primary transition-all font-medium text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                  Cintura
                </label>
                <input
                  required
                  name="waist"
                  type="number"
                  step="0.1"
                  defaultValue={initialData?.waist}
                  className="w-full bg-secondary/50 border border-border rounded-xl p-3 focus:outline-none focus:border-primary transition-all font-medium text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                  Braço
                </label>
                <input
                  required
                  name="arms"
                  type="number"
                  step="0.1"
                  defaultValue={initialData?.arms}
                  className="w-full bg-secondary/50 border border-border rounded-xl p-3 focus:outline-none focus:border-primary transition-all font-medium text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                  Perna
                </label>
                <input
                  required
                  name="legs"
                  type="number"
                  step="0.1"
                  defaultValue={initialData?.legs}
                  className="w-full bg-secondary/50 border border-border rounded-xl p-3 focus:outline-none focus:border-primary transition-all font-medium text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-neusharp italic mt-4 shadow-lg shadow-primary/20 hover:opacity-90 transition-all font-bold tracking-wider"
            >
              SALVAR MEDIDAS
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
