import React from "react";
import { translateCompetitorStrategy, getCompetitorAnalysis } from "../../utils/translators";

const CompetitorCard = ({ competitor, playerPower }) => {
  return (
    <div className="border rounded p-3">
      <h4 className="font-medium mb-2">{competitor.name}</h4>
      
      <div className="space-y-2">
        <div className="text-sm">
          <span className="font-medium">Strategia:</span> {translateCompetitorStrategy(competitor.strategy)}
        </div>
        <div className="text-sm">
          <span className="font-medium">Reputacja:</span> {competitor.reputation}/100
        </div>
        <div className="text-sm">
          <span className="font-medium">Tempo wzrostu:</span> {((competitor.growth - 1) * 100).toFixed(1)}% na turę
        </div>
        <div className="text-sm">
          <span className="font-medium">Silne regiony:</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {competitor.strongRegions.map(region => (
            <div key={region} className="text-xs bg-gray-200 px-2 py-1 rounded">
              {region}
            </div>
          ))}
        </div>
        <div className="text-sm mt-2 text-gray-600 italic">
          {getCompetitorAnalysis(competitor, playerPower)}
        </div>
      </div>
    </div>
  );
};

export default CompetitorCard; 