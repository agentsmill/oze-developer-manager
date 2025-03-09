import React from 'react';
import { usePlayerContext } from "../../store/PlayerContext";
import { useGameContext } from "../../store/GameContext";
import { Users, Briefcase, TrendingUp, Award, Shield, Activity } from "lucide-react";

const CompanyOverview = () => {
  const { state: player } = usePlayerContext();
  const { state: gameState } = useGameContext();
  
  // Dane firmy
  const companyData = {
    name: player.name,
    founded: "2024",
    totalProjects: player.projects.length,
    completedProjects: player.projects.filter(p => p.status === 'ready_to_build').length,
    totalMW: player.totalPower,
    rtbMW: player.rtbPower,
    staffCount: Object.values(player.staff).reduce((acc, staff) => acc + staff.length, 0),
    cash: player.cash,
    reputation: player.reputation
  };
  
  // Formatuje liczbę jako walutę
  const formatCurrency = (amount) => {
    return amount.toLocaleString() + ' PLN';
  };
  
  // Kolorowanie reputacji
  const getReputationColor = (reputation) => {
    if (reputation >= 150) return "text-green-600";
    if (reputation >= 100) return "text-blue-600";
    if (reputation >= 50) return "text-yellow-600";
    return "text-red-600";
  };
  
  // Ocena reputacji
  const getReputationLabel = (reputation) => {
    if (reputation >= 150) return "Doskonała";
    if (reputation >= 100) return "Dobra";
    if (reputation >= 50) return "Przeciętna";
    if (reputation >= 20) return "Zła";
    return "Fatalna";
  };
  
  // Renderujemy komponent przeglądu firmy
  return (
    <div className="space-y-6">
      {/* Nagłówek z podstawowymi informacjami */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{companyData.name}</h2>
            <p className="text-gray-600">Założona w {companyData.founded} roku</p>
          </div>
          <div className="flex space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Reputacja</div>
              <div className={`text-lg font-bold ${getReputationColor(companyData.reputation)}`}>
                {companyData.reputation}/200 ({getReputationLabel(companyData.reputation)})
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Gotówka</div>
              <div className="text-lg font-bold text-green-600">{formatCurrency(companyData.cash)}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Karty z poszczególnymi statystykami */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Projekty */}
        <div className="bg-white p-5 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Projekty</h3>
              <p className="text-gray-600">Podsumowanie projektów</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">Wszystkie projekty:</span>
              <span className="font-medium">{companyData.totalProjects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Projekty RTB:</span>
              <span className="font-medium">{companyData.completedProjects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Łączna moc:</span>
              <span className="font-medium">{companyData.totalMW} MW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Moc RTB:</span>
              <span className="font-medium">{companyData.rtbMW} MW</span>
            </div>
          </div>
        </div>
        
        {/* Kadry */}
        <div className="bg-white p-5 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Personel</h3>
              <p className="text-gray-600">Kadry firmy</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">Liczba pracowników:</span>
              <span className="font-medium">{companyData.staffCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Developery:</span>
              <span className="font-medium">{player.staff.developers.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Pozyskiwacze:</span>
              <span className="font-medium">{player.staff.scouts.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Prawnicy i lobbyści:</span>
              <span className="font-medium">{player.staff.lawyers.length + player.staff.lobbyists.length}</span>
            </div>
          </div>
        </div>
        
        {/* Finanse */}
        <div className="bg-white p-5 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Wyniki</h3>
              <p className="text-gray-600">Statystyki firmy</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">Łączne inwestycje:</span>
              <span className="font-medium">{formatCurrency(player.economicMetrics.totalInvestment || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Łączne przychody:</span>
              <span className="font-medium">{formatCurrency(player.economicMetrics.totalRevenue || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Łączne wydatki:</span>
              <span className="font-medium">{formatCurrency(player.economicMetrics.totalExpenses || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Średni ROI:</span>
              <span className="font-medium">{((player.economicMetrics.avgROI || 0) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sekcja reputacji */}
      <div className="bg-white p-5 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <div className="p-3 rounded-full bg-yellow-100 mr-4">
            <Shield className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Reputacja firmy</h3>
            <p className="text-gray-600">Historia zmian reputacji</p>
          </div>
        </div>
        
        {player.reputationHistory.length > 0 ? (
          <div className="divide-y">
            {player.reputationHistory.slice(-5).reverse().map((entry, index) => (
              <div key={index} className="py-2">
                <div className="flex justify-between">
                  <div>
                    <span className="font-medium">Tura {entry.turn}: </span>
                    <span className="text-gray-700">{entry.reason}</span>
                  </div>
                  <span className={entry.change >= 0 ? "text-green-600" : "text-red-600"}>
                    {entry.change > 0 ? "+" : ""}{entry.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 italic">Brak historii zmian reputacji</p>
        )}
      </div>
      
      {/* Sekcja działań nielegalnych */}
      {player.illegals.illegalActionHistory.length > 0 && (
        <div className="bg-white p-5 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-red-100 mr-4">
              <Activity className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Działania szarej strefy</h3>
              <p className="text-gray-600">Historia nielegalnych działań</p>
            </div>
          </div>
          
          <div className="divide-y">
            {player.illegals.illegalActionHistory.slice(-5).reverse().map((action, index) => (
              <div key={index} className="py-2">
                <div className="flex justify-between">
                  <div>
                    <span className="font-medium">Tura {action.turn}: </span>
                    <span className="text-gray-700">{action.type.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="text-red-600">{formatCurrency(action.cost)}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Cel: {action.target}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyOverview; 