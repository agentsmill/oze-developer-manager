import React from "react";
import { useEventsContext } from "../../store/EventContext";
import { getColorByValue } from "../../utils/colors";

const RegionItem = ({ region, isSelected, onSelect }) => {
  const { state: events } = useEventsContext();

  // Sprawdzamy, czy są aktywne wydarzenia w regionie
  const regionEvents = events.filter((e) => e.regionId === region.id);
  const hasEvents = regionEvents.length > 0;

  // Określamy kolor regionu na podstawie warunków
  const getRegionColorClass = (region) => {
    // Obliczamy średnią warunków dla regionu
    const avgConditions = (region.solarConditions + region.windConditions) / 2;

    if (avgConditions >= 70) return "bg-green-200";
    else if (avgConditions >= 55) return "bg-yellow-200";
    else return "bg-red-200";
  };

  return (
    <div
      className={`
        relative
        flex items-center justify-center 
        border-2 ${isSelected ? "border-blue-600" : "border-gray-300"} 
        ${getRegionColorClass(region)}
        rounded-lg
        cursor-pointer 
        transition-all duration-200
        hover:opacity-80
        p-2
      `}
      onClick={() => onSelect(region.id)}
    >
      {/* Nazwa regionu */}
      <div className="text-center z-10">
        <div className="font-bold text-sm">{region.name}</div>
        <div className="text-xs">{region.projects.length} projektów</div>
        {region.isOPRO && (
          <div className="text-xs text-green-800 font-bold">OPRO</div>
        )}
      </div>

      {/* Wskaźnik zdarzeń */}
      {hasEvents && (
        <div className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
      )}

      {/* Wskaźniki warunków */}
      <div className="absolute bottom-1 left-1 flex gap-1">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: getColorByValue(region.solarConditions) }}
          title={`Nasłonecznienie: ${region.solarConditions}/100`}
        ></div>
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: getColorByValue(region.windConditions) }}
          title={`Warunki wiatrowe: ${region.windConditions}/100`}
        ></div>
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: getColorByValue(region.socialAcceptance) }}
          title={`Akceptacja społeczna: ${region.socialAcceptance}/100`}
        ></div>
      </div>
    </div>
  );
};

export default React.memo(RegionItem);
