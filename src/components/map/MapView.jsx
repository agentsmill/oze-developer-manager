import React from "react";
import { useRegionsContext } from "../../store/RegionContext";
import { useGameContext } from "../../store/GameContext";
import { useProjects } from "../../hooks/useProjects";
import { useCountyContext } from "../../store/CountyContext";
import RegionInfo from "./RegionInfo";
import CountyView from "./CountyView";
import CountyInfo from "./CountyInfo";
import PolandMap from "./PolandMap";
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
          <PolandMap 
            regions={regions}
            selectedRegionId={gameState.selectedRegion}
            onSelectRegion={handleSelectRegion}
          />
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
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Mapa Polski</h2>
            <p className="mb-4">Wybierz województwo, aby zobaczyć szczegółowe informacje i rozpocząć projekty.</p>
            
            <div className="bg-blue-50 p-4 rounded mb-4">
              <h3 className="font-bold mb-2">Legenda mapy</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-300 mr-2 border border-gray-300"></div>
                  <span className="text-sm">Dobre warunki dla OZE</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-300 mr-2 border border-gray-300"></div>
                  <span className="text-sm">Średnie warunki dla OZE</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-300 mr-2 border border-gray-300"></div>
                  <span className="text-sm">Słabe warunki dla OZE</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 relative mr-2 border border-gray-300">
                    <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></div>
                  </div>
                  <span className="text-sm">Aktywne zdarzenia</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 relative mr-2 flex items-center justify-center">
                    <span className="text-xs text-green-800 font-bold">O</span>
                  </div>
                  <span className="text-sm">Obszar OPRO</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
