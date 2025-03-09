import React from "react";

const MarketAnalysis = ({ playerRank, ranking, playerPower }) => {
  return (
    <div className="bg-white p-3 rounded shadow">
      <h4 className="font-medium mb-2">Twoja pozycja na rynku</h4>
      
      {playerRank === 1 ? (
        <div className="p-3 bg-green-100 text-green-800 rounded">
          <div className="font-bold">Jesteś liderem rynku!</div>
          <p className="text-sm mt-1">Utrzymuj przewagę nad konkurencją rozwijając projekty w różnych regionach.</p>
        </div>
      ) : (
        <div className="p-3 bg-blue-100 text-blue-800 rounded">
          <div className="font-bold">Jesteś na {playerRank}. miejscu</div>
          <p className="text-sm mt-1">Do lidera brakuje Ci {(ranking[0].rtbPower - playerPower).toLocaleString()} MW mocy w projektach RTB.</p>
        </div>
      )}
      
      <div className="mt-3 text-sm">
        <p>Twój udział w rynku: {(playerPower / ranking.reduce((sum, c) => sum + c.rtbPower, 0) * 100).toFixed(1)}%</p>
        <p className="mt-1">Tempo wzrostu twojego portfela zależy od liczby projektów i zatrudnionych specjalistów.</p>
      </div>

      <div className="mt-4">
        <div className="font-medium mb-2">Postęp do celu (100 GW):</div>
        <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden mt-1">
          <div 
            className="h-full bg-green-500 relative" 
            style={{width: `${Math.min(100, (playerPower / 100000) * 100)}%`}}
          >
            <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold">
              {((playerPower / 100000) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysis; 