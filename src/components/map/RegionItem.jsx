import React from "react";
import { useEventsContext } from "../../store/EventsContext";
import { getColorByValue } from "../../utils/colors";
import { Wind, Sun, Map } from "lucide-react";

const RegionItem = ({ region, isSelected, onSelect }) => {
  const { state: eventsState } = useEventsContext();
  
  // Defensywnie pobieramy wydarzenia z kontekstu
  const eventsArray = Array.isArray(eventsState?.events) ? eventsState.events : [];
  
  // Sprawdzamy, czy region ma aktywne wydarzenia
  const hasActiveEvents = React.useMemo(() => {
    if (!region || !region.id) return false;
    return eventsArray.some(event => 
      event.regionId === region.id && (!event.expires || event.expires > Date.now())
    );
  }, [eventsArray, region]);

  // Określamy kolor regionu na podstawie warunków
  const getRegionColorClass = (region) => {
    if (!region) return "bg-gray-200";
    
    // Poprawiony dostęp do wartości - używamy windConditions zamiast resources.wind
    const windValue = region.windConditions || 0;
    const sunValue = region.solarConditions || 0;
    const landValue = region.availableLand ? (region.availableLand / 20000 * 100) : 0; // normalizacja wartości gruntów do skali 0-100
    
    // Średnia wartość zasobów
    const avgResourceValue = (windValue + sunValue + landValue) / 3;
    
    return getColorByValue(avgResourceValue);
  };

  if (!region) return null;

  return (
    <div 
      className={`relative p-3 mb-3 rounded-lg shadow-sm transition-all duration-200 ${getRegionColorClass(region)} ${isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-md hover:brightness-105'} cursor-pointer`}
      onClick={() => onSelect(region.id)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg">{region.name}</h3>
          <div className="text-xs opacity-75 mb-2">Województwo</div>
        </div>
        {region.isOPRO && (
          <div className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">OPRO</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="flex items-center text-sm">
          <Sun className="h-4 w-4 mr-1 text-yellow-500" />
          <span>{region.solarConditions}/100</span>
        </div>
        <div className="flex items-center text-sm">
          <Wind className="h-4 w-4 mr-1 text-blue-500" />
          <span>{region.windConditions}/100</span>
        </div>
      </div>
      
      <div className="flex items-center mt-2 text-sm">
        <Map className="h-4 w-4 mr-1 text-gray-500" />
        <span className="text-gray-600">{(region.availableLand / 1000).toFixed(1)}k ha</span>
        
        <span className="mx-2 text-gray-400">|</span>
        
        <div className="w-2 h-2 rounded-full mr-1" style={{
          backgroundColor: region.gridCapacity > 400 ? '#10B981' : region.gridCapacity > 300 ? '#FBBF24' : '#EF4444'
        }}></div>
        <span className="text-gray-600">{region.gridCapacity} MW</span>
      </div>
      
      {/* Wskaźnik zdarzeń */}
      {hasActiveEvents && (
        <div className="absolute top-2 right-2 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
      )}
    </div>
  );
};

export default RegionItem;
