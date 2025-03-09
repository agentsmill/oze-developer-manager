import React, { useState } from 'react';
import { Sun, Wind, Battery, MapPin, Calendar, Clock, AlertTriangle, DollarSign, Users, Zap, ShieldOff } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';
import StatusBadge from '../ui/StatusBadge';
import { translateStage, getStageDescription } from '../../utils/translators';
import { usePlayerContext } from '../../store/PlayerContext';
import { useGameContext } from '../../store/GameContext';
import '../../styles/indicators.css';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';

/**
 * Komponent karty projektu
 * @param {Object} props - Właściwości komponentu
 * @param {Object} props.project - Dane projektu
 * @param {function} props.onAdvance - Funkcja obsługująca przejście do następnego etapu
 * @param {function} props.onAssignStaff - Funkcja obsługująca przypisanie pracownika
 * @param {function} props.onDetails - Funkcja otwierająca szczegóły
 * @param {function} props.onSell - Funkcja obsługująca sprzedaż
 * @param {function} props.onApplyIllegalMethod - Funkcja obsługująca użycie nielegalnych metod
 * @param {function} props.onAccelerate - Funkcja obsługująca przyspieszanie projektu
 * @returns {JSX.Element} Element JSX
 */
const ProjectCard = ({ 
  project, 
  onAdvance, 
  onAssignStaff, 
  onDetails, 
  onSell,
  onApplyIllegalMethod,
  onAccelerate
}) => {
  const { state: playerState } = usePlayerContext();
  const { showNotification } = useGameContext();
  const [showIllegalActions, setShowIllegalActions] = useState(false);
  
  if (!project) return null;
  
  // Ikona technologii
  const getTechnologyIcon = (technology) => {
    switch(technology) {
      case 'PV': return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'WF': return <Wind className="h-4 w-4 text-blue-500" />;
      case 'BESS': return <Battery className="h-4 w-4 text-purple-500" />;
      default: return null;
    }
  };
  
  // Status projektu
  const getProjectStatus = (status, progress) => {
    if (status === 'ready_to_build') return 'completed';
    if (progress < 25) return 'warning';
    if (progress >= 75) return 'active';
    return 'active';
  };
  
  // Klasyfikacja ryzyka
  const getRiskClass = (risk) => {
    if (risk < 0.3) return 'low';
    if (risk < 0.7) return 'medium';
    return 'high';
  };
  
  // Formatowanie kosztu
  const formatCost = (cost) => {
    if (cost >= 1000000) {
      return `${(cost / 1000000).toFixed(2)} mln zł`;
    } else if (cost >= 1000) {
      return `${(cost / 1000).toFixed(1)} tys. zł`;
    }
    return `${cost} zł`;
  };
  
  // Procentowy postęp etapu
  const getStagePercentage = () => {
    if (project.status === 'ready_to_build') return 100;
    return Math.min(100, Math.round(project.progress));
  };
  
  // Status etapów projektu dla wizualizacji
  const stageStatus = {
    land_acquisition: { index: 0, label: "Grunty" },
    environmental_decision: { index: 1, label: "Środowisko" },
    zoning_conditions: { index: 2, label: "Warunki zabudowy" },
    grid_connection: { index: 3, label: "Przyłączenie" },
    ready_to_build: { index: 4, label: "RTB" }
  };
  
  // Szacowana wartość projektu
  const getEstimatedValue = () => {
    // Bazowa wartość projektu dla RTB
    const baseValue = project.power * 250000; // 250k PLN za 1 MW
    
    // Mnożnik w zależności od etapu
    const stageMultipliers = {
      land_acquisition: 0.15,
      environmental_decision: 0.35,
      zoning_conditions: 0.55,
      grid_connection: 0.85,
      ready_to_build: 1.0
    };
    
    const stageMultiplier = stageMultipliers[project.status] || 0.1;
    
    // Mnożnik postępu w ramach etapu
    const progressMultiplier = (project.progress / 100) * 0.2;
    
    // Wartość z uwzględnieniem etapu i postępu
    return Math.round(baseValue * (stageMultiplier + progressMultiplier));
  };
  
  // Obliczenie zysku
  const getProfit = () => {
    const estimatedValue = getEstimatedValue();
    const profit = estimatedValue - project.totalCost;
    return profit;
  };
  
  // Procentowy zysk
  const getProfitPercentage = () => {
    const profit = getProfit();
    if (project.totalCost === 0) return 0;
    return Math.round((profit / project.totalCost) * 100);
  };
  
  // Funkcja do obsługi użycia nielegalnych metod
  const handleUseIllegalMethod = (methodType) => {
    if (!onApplyIllegalMethod) {
      showNotification('Funkcja używania nielegalnych metod nie jest dostępna', 'error');
      return;
    }
    
    // Sprawdzenie warunków użycia nielegalnych metod
    if (playerState.reputation < 30) {
      showNotification('Reputacja jest zbyt niska, aby ryzykować kolejne nielegalne działania', 'error');
      return;
    }
    
    // Obliczenie kosztów łapówki
    let bribeCost = 0;
    switch (methodType) {
      case 'bribe_official':
        bribeCost = 25000 + (project.power * 1000);
        break;
      case 'forge_documents':
        bribeCost = 15000 + (project.power * 500);
        break;
      case 'pressure_officials':
        bribeCost = 30000 + (project.power * 2000);
        break;
      default:
        bribeCost = 20000;
    }
    
    // Sprawdzenie, czy gracz ma wystarczająco pieniędzy
    if (playerState.cash < bribeCost) {
      showNotification(`Nie masz wystarczających środków na tę akcję (${bribeCost.toLocaleString()} zł)`, 'error');
      return;
    }
    
    // Wywołanie funkcji używania nielegalnych metod
    onApplyIllegalMethod(project.id, methodType, bribeCost);
    
    // Ukrycie menu po wybraniu metody
    setShowIllegalActions(false);
  };
  
  // Funkcja do przyspieszania projektu
  const handleAccelerate = () => {
    if (typeof onAccelerate === 'function') {
      onAccelerate(project.id);
    }
  };
  
  return (
    <div className="bg-white rounded shadow-md overflow-hidden flex flex-col h-full">
      {/* Nagłówek karty */}
      <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
        <div className="font-medium">
          <div className="flex items-center">
            {getTechnologyIcon(project.technology)}
            <span className="ml-1">{project.name}</span>
            {project.useIllegalMethods && (
              <div 
                className="ml-2 text-red-500" 
                title="Ten projekt wykorzystuje nielegalne metody"
              >
                <ShieldOff className="h-4 w-4" />
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500 flex items-center">
            <MapPin className="h-3 w-3 mr-1" /> 
            {project.county ? `${project.county.name}, ${project.region}` : project.region}
          </div>
        </div>
        
        <div className="text-right">
          <div className="font-bold flex items-center justify-end">
            {project.power} MW
          </div>
          <div className="text-xs text-gray-500 flex items-center justify-end">
            <Calendar className="h-3 w-3 mr-1" /> Tura {project.startedOn}
          </div>
        </div>
      </div>
      
      <div className="px-4 py-3">
        {/* Postęp etapu */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Etap: {translateStage(project.status)}</span>
            <span>{getStagePercentage()}%</span>
          </div>
          <ProgressBar 
            value={getStagePercentage()} 
            status={
              project.useIllegalMethods 
                ? 'warning' 
                : getStagePercentage() >= 75 ? 'high' : getStagePercentage() >= 30 ? 'medium' : 'low'
            } 
          />
        </div>
        
        {/* Ogólny postęp projektu */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Całkowity postęp</span>
            <span>{stageStatus[project.status]?.index * 20 + getStagePercentage() / 5}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${project.useIllegalMethods ? 'bg-amber-500' : 'bg-blue-500'}`}
              style={{ width: `${stageStatus[project.status]?.index * 20 + getStagePercentage() / 5}%` }}
            ></div>
          </div>
        </div>
        
        {/* Statystyki projektu */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-gray-500">Całkowity koszt</div>
            <div className="font-medium">{formatCost(project.totalCost)}</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-gray-500">Szacowana wartość</div>
            <div className="font-medium">{formatCost(getEstimatedValue())}</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-gray-500">Potencjalny zysk</div>
            <div className={`font-medium ${getProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCost(getProfit())} ({getProfitPercentage()}%)
            </div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-gray-500">Status</div>
            <div className="font-medium">
              <StatusBadge 
                status={getProjectStatus(project.status, project.progress)} 
                text={project.progress >= 100 ? "Gotowy do rozwoju" : "W trakcie"}
              />
            </div>
          </div>
        </div>
        
        {/* Przyciski akcji */}
        <div className="flex flex-wrap justify-between mt-auto pt-2 border-t">
          <div>
            <button 
              onClick={() => onDetails(project.id)} 
              className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
            >
              Szczegóły
            </button>
            <button 
              onClick={() => onAssignStaff(project.id)} 
              className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded ml-1"
            >
              <Users className="h-3 w-3 inline mr-1" />
              Personel
            </button>
          </div>
          
          <div className="relative">
            {/* Menu nielegalnych działań */}
            {showIllegalActions && (
              <div className="absolute bottom-8 right-0 bg-white shadow-md rounded border p-2 w-48 z-10">
                <div className="text-xs font-medium mb-2 text-red-600 flex items-center">
                  <ShieldOff className="h-3 w-3 mr-1" />
                  Działania niejawne
                </div>
                <button 
                  onClick={() => handleUseIllegalMethod('bribe_official')}
                  className="text-xs w-full text-left p-1 hover:bg-red-50 text-gray-700 mb-1 rounded"
                >
                  Łapówka dla urzędnika (25k+ zł)
                </button>
                <button 
                  onClick={() => handleUseIllegalMethod('forge_documents')}
                  className="text-xs w-full text-left p-1 hover:bg-red-50 text-gray-700 mb-1 rounded"
                >
                  Fałszowanie dokumentów (15k+ zł)
                </button>
                <button 
                  onClick={() => handleUseIllegalMethod('pressure_officials')}
                  className="text-xs w-full text-left p-1 hover:bg-red-50 text-gray-700 mb-1 rounded"
                >
                  Naciski na urzędników (30k+ zł)
                </button>
                <button 
                  onClick={() => setShowIllegalActions(false)}
                  className="text-xs w-full text-left p-1 hover:bg-gray-100 text-gray-500 rounded"
                >
                  Anuluj
                </button>
              </div>
            )}
            
            {/* Przycisk przejścia do następnego etapu */}
            {project.progress >= 100 && project.status !== 'ready_to_build' && (
              <button 
                onClick={() => onAdvance(project.id)} 
                className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Następny etap
              </button>
            )}
            
            {/* Przycisk sprzedaży projektu */}
            {project.status !== 'land_acquisition' && (
              <button 
                onClick={() => onSell(project.id)} 
                className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 ml-1"
              >
                <DollarSign className="h-3 w-3 inline mr-1" />
                Sprzedaj
              </button>
            )}
            
            {/* Przycisk nielegalnych działań */}
            {project.status !== 'ready_to_build' && (
              <button 
                onClick={() => setShowIllegalActions(!showIllegalActions)} 
                className={`text-xs px-2 py-1 ${project.useIllegalMethods ? 'bg-amber-500' : 'bg-gray-700'} text-white rounded hover:bg-gray-800 ml-1`}
                title={project.useIllegalMethods ? "Ten projekt już używa nielegalnych metod" : "Użyj nielegalnych metod, aby przyspieszyć projekt"}
              >
                <Zap className="h-3 w-3 inline" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Przyciski akcji */}
      <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
        <div>
          <span className="text-xs text-gray-500">Status: </span>
          <span className={`text-sm font-medium ${project.useIllegalMethods ? 'text-amber-600' : 'text-blue-600'}`}>
            {translateStage(project.status)}
          </span>
        </div>
        
        {project.status !== 'ready_to_build' && (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleAccelerate}
          >
            Przyspiesz projekt
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProjectCard; 