import { Activity, LayoutList } from "lucide-react";
import React, { useState } from "react";
import { BodyEvolutionFeature } from "../../features/body-evolution/BodyEvolutionFeature";
import { WorkoutFeature } from "../../features/workout/WorkoutFeature";

const WorkoutManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"workout" | "evolution">("workout");

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins pb-32">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-4">
        <h1 className="font-neusharp text-3xl text-primary tracking-tighter italic uppercase text-center md:text-left">
          Fitness
        </h1>
        
        {/* Navigation Tabs */}
        <div className="flex bg-secondary/30 p-1.5 rounded-full mx-auto md:mx-0 max-w-[400px]">
          <button
            onClick={() => setActiveTab("workout")}
            className={`flex-1 flex justify-center items-center gap-2 py-2 px-4 rounded-full text-xs font-bold transition-all ${
              activeTab === "workout"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <LayoutList size={16} /> TREINO
          </button>
          <button
            onClick={() => setActiveTab("evolution")}
            className={`flex-1 flex justify-center items-center gap-2 py-2 px-4 rounded-full text-xs font-bold transition-all ${
              activeTab === "evolution"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <Activity size={16} /> EVOLUÇÃO
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto flex flex-col gap-8">
        {activeTab === "workout" && <WorkoutFeature />}
        {activeTab === "evolution" && <BodyEvolutionFeature />}
      </main>
    </div>
  );
};

export default WorkoutManager;
