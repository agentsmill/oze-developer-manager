import React from "react";
import { useRegionsContext } from "../../store/RegionContext";
import { useGameContext } from "../../store/GameContext";
import { useProjects } from "../../hooks/useProjects";
import { useCountyContext } from "../../store/CountyContext";
import RegionItem from "./RegionItem";
import RegionInfo from "./RegionInfo";
import CountyView from "./CountyView";
import CountyInfo from "./CountyInfo";
import Card from "../ui/Card";
import { getColorByValue } from "../../utils/colors";

const MapView = () => {
  // Pobieramy stany z kontekstów
  const { state: regions } = useRegionsContext();
  const { state: counties } = useCountyContext();
  const { state: gameState, dispatch: gameDispatch } = useGameContext();
  const { startNewProject } = useProjects();

  // Definicja wybranego województwa
  const selectedRegion = gameState.selectedRegion
    ? regions.find((r) => r.id === gameState.selectedRegion)
    : null;
    
  // Sprawdzamy, czy jest wybrany powiat
  const hasSelectedCounty = gameState.selectedCounty !== null;

  // Funkcje obsługi
  const handleSelectRegion = (regionId) => {
    gameDispatch({ type: "SELECT_REGION", payload: regionId });
  };

  const handleStartProject = (technology = "PV", countyId = null) => {
    if (countyId) {
      // Jeśli mamy wybrany powiat, tworzymy projekt w powiecie
      startNewProject(gameState.selectedRegion, technology, countyId);
    } else if (gameState.selectedRegion) {
      // Jeśli mamy tylko wybrane województwo, tworzymy projekt w województwie
      startNewProject(gameState.selectedRegion, technology);
    }
  };

  return (
    <div className="flex flex-1">
      {/* Mapa */}
      <div className="flex-1 bg-blue-50 p-4 overflow-auto">
        <div className="w-full h-full">
          {/* Mapa Polski z województwami */}
          <div className="w-full min-h-full grid grid-cols-4 auto-rows-min gap-4">
            {regions.map((region) => (
              <RegionItem
                key={region.id}
                region={region}
                isSelected={gameState.selectedRegion === region.id}
                onSelect={handleSelectRegion}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Panel informacyjny */}
      <div className="w-1/3 bg-white p-4 overflow-y-auto">
        {selectedRegion ? (
          <div className="space-y-4">
            <RegionInfo
              region={selectedRegion}
              onStartProject={handleStartProject}
            />
            
            {/* Wyświetlamy powiaty danego województwa */}
            {gameState.countySettings.showCounties && (
              <CountyView voivodeshipId={selectedRegion.id} />
            )}
            
            {/* Jeśli wybrany jest powiat, wyświetlamy jego szczegóły */}
            {hasSelectedCounty && gameState.selectedCounty.voivodeshipId === selectedRegion.id && (
              <CountyInfo 
                voivodeshipId={gameState.selectedCounty.voivodeshipId}
                countyId={gameState.selectedCounty.countyId}
                onStartProject={handleStartProject}
              />
            )}
          </div>
        ) : (
          <Card title="Mapa Polski">
            <p>Wybierz województwo, aby zobaczyć szczegóły.</p>
            <p className="mt-2 text-sm text-gray-600">
              W nowej wersji aplikacji możesz teraz zarządzać projektami OZE na poziomie powiatów.
              Każdy powiat ma unikalne parametry, które wpływają na opłacalność i trudność realizacji projektów.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Twoim celem jest osiągnięcie 25 GW mocy w projektach Ready-to-Build
              lub zgromadzenie 10 miliardów złotych.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MapView;
