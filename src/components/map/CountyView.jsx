import React from "react";
import { useCountyContext, getCountiesByVoivodeshipFromContext } from "../../store/CountyContext";
import { useGameContext } from "../../store/GameContext";
import Card from "../ui/Card";
import { getColorByValue } from "../../utils/colors";

const CountyView = ({ voivodeshipId }) => {
  const { state: counties, dispatch: countyDispatch } = useCountyContext();
  const { state: gameState, dispatch: gameDispatch } = useGameContext();
  
  // Filtrujemy powiaty dla wybranego województwa
  const voivodeshipCounties = getCountiesByVoivodeshipFromContext(counties, voivodeshipId);
  
  // Obsługa wyboru powiatu
  const handleSelectCounty = (countyId) => {
    gameDispatch({ 
      type: "SELECT_COUNTY", 
      payload: { 
        voivodeshipId, 
        countyId 
      } 
    });
  };
  
  // Sprawdzamy, czy dany powiat jest wybrany
  const isCountySelected = (countyId) => {
    return gameState.selectedCounty?.voivodeshipId === voivodeshipId && 
           gameState.selectedCounty?.countyId === countyId;
  };
  
  if (!voivodeshipId || voivodeshipCounties.length === 0) {
    return (
      <Card title="Powiaty">
        <p className="text-gray-500">Wybierz województwo, aby zobaczyć powiaty.</p>
      </Card>
    );
  }
  
  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-bold text-lg mb-3">Powiaty w województwie</h3>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {voivodeshipCounties.map((county) => (
          <div
            key={county.id}
            onClick={() => handleSelectCounty(county.id)}
            className={`
              cursor-pointer p-3 rounded 
              border-2 
              ${isCountySelected(county.id) ? 'border-blue-500' : 'border-gray-200'}
              hover:bg-gray-50 transition-colors
            `}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{county.name}</div>
                <div className="text-sm text-gray-600">
                  {county.capital} • {county.population.toLocaleString()} mieszkańców
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {county.projects.length} projekty
              </div>
            </div>
            
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="flex items-center text-sm">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: getColorByValue(county.solarPotential) }}
                ></div>
                <span>Słońce: {county.solarPotential}/100</span>
              </div>
              <div className="flex items-center text-sm">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: getColorByValue(county.windPotential) }}
                ></div>
                <span>Wiatr: {county.windPotential}/100</span>
              </div>
            </div>
            
            <div className="mt-1 text-sm flex justify-between">
              <span>Grunty: {county.availableLand} ha</span>
              <span>Moc przyłączeniowa: {county.gridCapacity} MW</span>
            </div>
            
            {county.events.length > 0 && (
              <div className="mt-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                <span>{county.events.length} aktywnych wydarzeń</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountyView; 