import { X } from "lucide-react";
import React from "react";
import type { MeasurementRecord } from "../../../types/body-evolution";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
              <div className="space-y-1.5">
                <Label>Mês (AAAA-MM)</Label>
                <Input
                  required
                  type="month"
                  name="month"
                  defaultValue={initialData?.month}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Peso (kg)</Label>
                <Input
                  required
                  name="weight"
                  type="number"
                  step="0.1"
                  defaultValue={initialData?.weight}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Peito (cm)</Label>
                <Input
                  required
                  name="chest"
                  type="number"
                  step="0.1"
                  defaultValue={initialData?.chest}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Ombros (cm)</Label>
                <Input
                  name="shoulders"
                  type="number"
                  step="0.1"
                  defaultValue={initialData?.shoulders}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Cintura</Label>
                <Input
                  required
                  name="waist"
                  type="number"
                  step="0.1"
                  defaultValue={initialData?.waist}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Braço</Label>
                <Input
                  required
                  name="arms"
                  type="number"
                  step="0.1"
                  defaultValue={initialData?.arms}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Perna</Label>
                <Input
                  required
                  name="legs"
                  type="number"
                  step="0.1"
                  defaultValue={initialData?.legs}
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
