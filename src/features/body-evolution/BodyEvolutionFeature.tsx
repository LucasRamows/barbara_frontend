import { Edit2, Image as ImageIcon, Plus, Scale } from "lucide-react";
import React, { useState } from "react";
import type { MeasurementRecord } from "../../types/body-evolution";
import { BodyMap } from "./components/BodyMap";
import { MeasurementForm } from "./components/MeasurementForm";
import { useBodyEvolution } from "./hooks/useBodyEvolution";

export const BodyEvolutionFeature: React.FC = () => {
  const { measurements, loading, addMeasurement, updateMeasurement } = useBodyEvolution();

  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingData, setEditingData] = useState<MeasurementRecord | null>(null);

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const sortedMeasurements = [...measurements].sort((a, b) => b.month.localeCompare(a.month)); // newest first
  const currentRecord = sortedMeasurements[selectedMonthIndex] || null;

  const handleSave = (payload: Partial<MeasurementRecord>) => {
    if (editingData) {
      updateMeasurement(editingData.id, payload);
    } else {
      addMeasurement(payload);
    }
  };

  const openForm = (data?: MeasurementRecord) => {
    setEditingData(data || null);
    setFormOpen(true);
  };

  const dataMap = currentRecord
    ? {
        chest: currentRecord.chest,
        waist: currentRecord.waist,
        arms: currentRecord.arms,
        legs: currentRecord.legs,
        shoulders: currentRecord.shoulders,
      }
    : {};

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-neusharp text-lg text-primary tracking-tighter italic uppercase">
            Evolução
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Mapeie o progresso do seu corpo
          </p>
        </div>
        <button
          onClick={() => openForm()}
          className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold text-xs hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
        >
          <Plus size={14} /> ADICIONAR
        </button>
      </div>

      {sortedMeasurements.length > 0 ? (
        <div className="space-y-6">
          {/* Mês Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {sortedMeasurements.map((m, index) => (
              <button
                key={m.id}
                onClick={() => setSelectedMonthIndex(index)}
                className={`flex-shrink-0 px-5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedMonthIndex === index
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-card text-muted-foreground border-border hover:bg-secondary/50"
                }`}
              >
                {new Date(m.month + "-01").toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).toUpperCase()}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visual Map */}
            <div className="bg-card border border-border p-4 rounded-3xl shadow-sm relative overflow-hidden">
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => openForm(currentRecord)}
                  className="p-2 bg-secondary text-primary rounded-full shadow hover:scale-105 transition-transform"
                >
                  <Edit2 size={16} />
                </button>
              </div>
              <h3 className="font-bold text-sm tracking-tight mb-4 flex items-center gap-2">
                <Scale size={16} className="text-primary" />
                DADOS DO MÊS
              </h3>
              
              <div className="flex justify-center mb-4">
               <span className="bg-primary/10 text-primary font-neusharp text-2xl px-6 py-2 rounded-2xl italic shadow-inner">
                 {currentRecord.weight} kg
               </span>
              </div>

              <BodyMap data={dataMap} />
            </div>

            {/* Photos */}
            <div className="bg-card border border-border p-4 rounded-3xl shadow-sm">
              <h3 className="font-bold text-sm tracking-tight mb-4 flex items-center gap-2">
                <ImageIcon size={16} className="text-primary" />
                GALERIA
              </h3>
              
              <div className="grid grid-cols-2 gap-4 h-[300px]">
                <div className="bg-secondary/30 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary/50 transition-colors cursor-pointer">
                  <Plus size={24} className="mb-2" />
                  <span className="text-xs font-bold uppercase">Foto Frontal</span>
                </div>
                <div className="bg-secondary/30 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary/50 transition-colors cursor-pointer">
                  <Plus size={24} className="mb-2" />
                  <span className="text-xs font-bold uppercase">Foto Lateral</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-3xl bg-secondary/10 flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4 text-muted-foreground">
            <Scale size={24} />
          </div>
          <p className="font-medium text-sm text-foreground">
            Nenhuma medida registrada
          </p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Comece a acompanhar a evolução do seu corpo
          </p>
          <button
            onClick={() => openForm()}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold text-xs shadow-md shadow-primary/20 hover:opacity-90 transition-all"
          >
            ADICIONAR PRIMEIRA MEDIDA
          </button>
        </div>
      )}

      <MeasurementForm
        isOpen={isFormOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initialData={editingData}
      />
    </div>
  );
};
