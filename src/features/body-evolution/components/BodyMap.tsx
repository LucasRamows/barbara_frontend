import React, { useState } from "react";

interface BodyMapProps {
  data: Record<string, number | undefined>; // e.g., { chest: 100, arms: 40 }
}

export const BodyMap: React.FC<BodyMapProps> = ({ data }) => {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const getStyle = (partId: string) => {
    const isHovered = hoveredPart === partId;
    const hasData = data[partId] !== undefined;
    return ` transition-all duration-300 cursor-pointer stroke-2 ${
      isHovered
        ? "fill-primary/40 stroke-primary scale-105"
        : hasData
        ? "fill-primary/20 stroke-primary/50"
        : "fill-secondary stroke-border"
    }`;
  };

  const getTransformOrigin = (partId: string) => {
    switch (partId) {
      case "shoulders":
        return "center top";
      case "chest":
        return "center center";
      case "waist":
        return "center bottom";
      case "arms":
        return "center center";
      case "legs":
        return "center bottom";
      default:
        return "center center";
    }
  };

  return (
    <div className="relative flex justify-center items-center w-full h-[400px]">
      <div className="absolute top-0 right-0 p-4 bg-card border border-border shadow-lg rounded-xl z-10 w-48 transition-all">
        <h4 className="font-neusharp italic text-xs uppercase text-primary mb-2">
          {hoveredPart ? hoveredPart.toUpperCase() : "MÚSCULO"}
        </h4>
        <div className="text-xl font-bold">
          {hoveredPart && data[hoveredPart] !== undefined
            ? `${data[hoveredPart]} cm`
            : "--"}
        </div>
      </div>

      <svg
        viewBox="0 0 200 400"
        className="h-full drop-shadow-lg"
        onMouseLeave={() => setHoveredPart(null)}
      >
        <g style={{ transformOrigin: getTransformOrigin("shoulders") }}>
          <path
            id="shoulders"
            d="M50 80 Q100 60 150 80 L160 100 Q100 90 40 100 Z"
            className={getStyle("shoulders")}
            onMouseEnter={() => setHoveredPart("shoulders")}
          />
        </g>
        <g style={{ transformOrigin: getTransformOrigin("chest") }}>
          <path
            id="chest"
            d="M55 100 Q100 120 145 100 L140 150 Q100 160 60 150 Z"
            className={getStyle("chest")}
            onMouseEnter={() => setHoveredPart("chest")}
          />
        </g>
        <g style={{ transformOrigin: getTransformOrigin("waist") }}>
          <path
            id="waist"
            d="M60 150 Q100 170 140 150 L130 200 Q100 210 70 200 Z"
            className={getStyle("waist")}
            onMouseEnter={() => setHoveredPart("waist")}
          />
        </g>
        <g style={{ transformOrigin: getTransformOrigin("arms") }}>
          <path
            id="arms-left"
            d="M40 100 Q20 150 30 200 L50 200 Q40 150 50 100 Z"
            className={getStyle("arms")}
            onMouseEnter={() => setHoveredPart("arms")}
          />
          <path
            id="arms-right"
            d="M160 100 Q180 150 170 200 L150 200 Q160 150 150 100 Z"
            className={getStyle("arms")}
            onMouseEnter={() => setHoveredPart("arms")}
          />
        </g>
        <g style={{ transformOrigin: getTransformOrigin("legs") }}>
          <path
            id="legs"
            d="M70 200 Q100 220 130 200 L140 350 Q100 340 60 350 Z"
            className={getStyle("legs")}
            onMouseEnter={() => setHoveredPart("legs")}
          />
        </g>
        <circle cx="100" cy="40" r="20" className="fill-secondary stroke-border stroke-2" />
      </svg>
    </div>
  );
};
