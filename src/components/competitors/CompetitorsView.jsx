import React from "react";
import { useGameContext } from "../../store/GameContext";
import { usePlayerContext } from "../../store/PlayerContext";
import CompetitorCard from "./CompetitorCard";
import CompetitorRanking from "./CompetitorRanking";
import MarketAnalysis from "./MarketAnalysis";
import StrategicAdvice from "./StrategicAdvice";

const CompetitorsView = () => {
  const { state: gameState } = useGameContext();
  const { state: playerState } = usePlayerContext();

  // Sortujemy konkurentów według mocy RTB (malejąco)
  const sortedCompetitors = [...gameState.competitors].sort(
    (a, b) => b.rtbPower - a.rtbPower
  );

  // Dodajemy gracza do rankingu
  const ranking = [
    ...sortedCompetitors,
    {
      id: "player",
      name: "Twoja firma",
      rtbPower: playerState.rtbPower,
      power: playerState.rtbPower * 1.2,
    },
  ].sort((a, b) => b.rtbPower - a.rtbPower);

  // Znajdujemy pozycję gracza w rankingu
  const playerRank = ranking.findIndex((r) => r.id === "player") + 1;

  return (
    <div className="flex flex-1">
      <div className="flex-1 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Analiza konkurencji</h2>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white p-3 rounded shadow">
            <div className="text-sm text-gray-500">Twoja pozycja</div>
            <div className="text-xl font-bold">{playerRank} miejsce</div>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <div className="text-sm text-gray-500">Twoja moc RTB</div>
            <div className="text-xl font-bold">
              {playerState.rtbPower.toLocaleString()} MW
            </div>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <div className="text-sm text-gray-500">Lider rynku</div>
            <div className="text-xl font-bold">{ranking[0].name}</div>
            <div className="text-sm text-gray-500">
              {ranking[0].rtbPower.toLocaleString()} MW
            </div>
          </div>
        </div>

        {/* Ranking firm */}
        <CompetitorRanking ranking={ranking} />

        {/* Szczegóły konkurentów */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold text-lg mb-3">Strategie konkurentów</h3>

          <div className="grid grid-cols-3 gap-4">
            {sortedCompetitors.map((competitor) => (
              <CompetitorCard 
                key={competitor.id} 
                competitor={competitor} 
                playerPower={playerState.rtbPower}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Panel porad */}
      <div className="w-1/3 bg-gray-100 p-4 overflow-y-auto">
        <h3 className="font-bold text-lg mb-4">Analiza rynku i porady</h3>

        <div className="space-y-4">
          <MarketAnalysis 
            playerRank={playerRank} 
            ranking={ranking} 
            playerPower={playerState.rtbPower} 
          />
          
          <StrategicAdvice competitors={sortedCompetitors} playerPower={playerState.rtbPower} />
        </div>
      </div>
    </div>
  );
};

export default CompetitorsView; 