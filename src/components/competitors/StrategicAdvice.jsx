import React from "react";
import { getCompetitorAnalysis } from "../../utils/translators";

const StrategicAdvice = ({ competitors, playerPower }) => {
  return (
    <>
      <div className="bg-white p-3 rounded shadow">
        <h4 className="font-medium mb-2">Analiza konkurentów</h4>
        
        <ul className="text-sm space-y-2">
          {competitors.map(competitor => (
            <li key={competitor.id} className="flex">
              <div className="text-blue-600 font-bold mr-2">•</div>
              <div>
                <span className="font-medium">{competitor.name}:</span> {getCompetitorAnalysis(competitor, playerPower)}
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bg-white p-3 rounded shadow">
        <h4 className="font-medium mb-2">Porady strategiczne</h4>
        
        <ul className="text-sm space-y-2">
          <li className="flex">
            <div className="text-green-600 font-bold mr-2">•</div>
            <div>Skupiaj się na regionach z dobrymi warunkami wiatrowymi/słonecznymi i niską konkurencją.</div>
          </li>
          <li className="flex">
            <div className="text-green-600 font-bold mr-2">•</div>
            <div>Zatrudniaj doświadczonych specjalistów, aby przyspieszyć rozwój projektów.</div>
          </li>
          <li className="flex">
            <div className="text-green-600 font-bold mr-2">•</div>
            <div>Dywersyfikuj portfolio projektów geograficznie, aby minimalizować ryzyko.</div>
          </li>
          <li className="flex">
            <div className="text-green-600 font-bold mr-2">•</div>
            <div>Monitoruj ruchy konkurencji i unikaj regionów, w których są dominujący gracze.</div>
          </li>
          <li className="flex">
            <div className="text-green-600 font-bold mr-2">•</div>
            <div>Inwestuj w projekty z wysokim ROI, aby maksymalizować zwrot z inwestycji.</div>
          </li>
        </ul>
      </div>
      
      <div className="bg-white p-3 rounded shadow">
        <h4 className="font-medium mb-2">Cel gry</h4>
        
        <div className="text-sm">
          <p>Twoim celem jest osiągnięcie 100,000 MW (100 GW) mocy w projektach RTB jako pierwszy deweloper.</p>
          <div className="mt-2">
            <div className="font-medium">Postęp do celu:</div>
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
      </div>
    </>
  );
};

export default StrategicAdvice; 