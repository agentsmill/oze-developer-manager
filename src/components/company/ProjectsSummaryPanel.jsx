import React, { useState, useMemo } from 'react';
import { usePlayerContext } from '../../store/PlayerContext';
import { useGameContext } from '../../store/GameContext';
import { translateStage } from '../../utils/translators';
import { useProjects } from '../../hooks/useProjects';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  ArrowUp,
  Play,
  AlertCircle,
  Briefcase,
  MapPin,
  Eye,
  BarChart2,
  Tag,
  Users,
  DollarSign,
  PlusCircle,
  XCircle,
  Sun,
  Wind
} from 'lucide-react';

/**
 * Komponent wyświetlający podsumowanie projektów
 */
const ProjectsSummaryPanel = () => {
  const { state: playerState, dispatch: playerDispatch } = usePlayerContext();
  const { state: gameState, showNotification } = useGameContext();
  const { projects, accelerateProject, sendProjectToMarket, applyIllegalMethod } = useProjects();
  
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pv, wf, development, rtb
  const [sortBy, setSortBy] = useState('progress'); // progress, power, stage, value
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Filtrujemy projekty według typu i statusu
  const filteredProjects = useMemo(() => {
    return playerState.projects.filter(project => {
      if (filter === 'all') return true;
      if (filter === 'pv') return project.technology === 'PV';
      if (filter === 'wf') return project.technology === 'WF';
      if (filter === 'development') return project.status !== 'ready_to_build';
      if (filter === 'rtb') return project.status === 'ready_to_build';
      return true;
    });
  }, [playerState.projects, filter]);
  
  // Sortujemy projekty
  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      if (sortBy === 'progress') {
        const aProgress = a.progress || 0;
        const bProgress = b.progress || 0;
        return sortOrder === 'asc' ? aProgress - bProgress : bProgress - aProgress;
      }
      if (sortBy === 'power') {
        return sortOrder === 'asc' ? a.power - b.power : b.power - a.power;
      }
      if (sortBy === 'stage') {
        const stageOrder = [
          'land_acquisition',
          'environmental_decision',
          'zoning_conditions',
          'grid_connection',
          'ready_to_build'
        ];
        const aIndex = stageOrder.indexOf(a.status);
        const bIndex = stageOrder.indexOf(b.status);
        return sortOrder === 'asc' ? aIndex - bIndex : bIndex - aIndex;
      }
      if (sortBy === 'value') {
        // Szacowanie wartości projektu
        const estimateValue = (project) => {
          const baseValue = project.power * 150000;
          const stagePriceMultipliers = {
            land_acquisition: 0.15,
            environmental_decision: 0.35,
            zoning_conditions: 0.55,
            grid_connection: 0.85,
            ready_to_build: 1.0,
          };
          return baseValue * (stagePriceMultipliers[project.status] || 0.1);
        };
        const aValue = estimateValue(a);
        const bValue = estimateValue(b);
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
  }, [filteredProjects, sortBy, sortOrder]);
  
  // Obliczamy statystyki projektów
  const projectStats = useMemo(() => {
    const stats = {
      total: playerState.projects.length,
      pv: 0,
      wf: 0,
      rtb: 0,
      development: 0,
      totalPower: 0,
      totalEstimatedValue: 0
    };
    
    playerState.projects.forEach(project => {
      if (project.technology === 'PV') stats.pv++;
      if (project.technology === 'WF') stats.wf++;
      if (project.status === 'ready_to_build') stats.rtb++;
      if (project.status !== 'ready_to_build') stats.development++;
      
      stats.totalPower += project.power || 0;
      
      // Szacowanie wartości
      const baseValue = project.power * 150000;
      const stagePriceMultipliers = {
        land_acquisition: 0.15,
        environmental_decision: 0.35,
        zoning_conditions: 0.55,
        grid_connection: 0.85,
        ready_to_build: 1.0,
      };
      stats.totalEstimatedValue += baseValue * (stagePriceMultipliers[project.status] || 0.1);
    });
    
    return stats;
  }, [playerState.projects]);
  
  // Funkcja obliczająca kolor paska postępu w zależności od etapu
  const getProgressColor = (status) => {
    const colors = {
      land_acquisition: 'bg-green-300',
      environmental_decision: 'bg-green-400',
      zoning_conditions: 'bg-green-500',
      grid_connection: 'bg-green-600',
      ready_to_build: 'bg-green-700'
    };
    return colors[status] || 'bg-green-300';
  };
  
  // Funkcja do renderowania ikon technologii
  const getTechnologyIcon = (technology) => {
    if (technology === "PV") {
      return <Sun className="h-4 w-4 text-yellow-500" />;
    } else if (technology === "WF") {
      return <Wind className="h-4 w-4 text-blue-500" />;
    }
    return <Zap className="h-4 w-4 text-yellow-500" />;
  };
  
  // Funkcja renderująca pasek postępu
  const renderProgressBar = (project) => {
    const stageOrder = [
      'land_acquisition',
      'environmental_decision',
      'zoning_conditions',
      'grid_connection',
      'ready_to_build'
    ];
    
    const currentStageIndex = stageOrder.indexOf(project.status);
    const totalStages = stageOrder.length;
    const baseProgress = (currentStageIndex / (totalStages - 1)) * 100;
    
    // Dodatkowy postęp w ramach bieżącego etapu, jeśli nie jest gotowy do budowy
    let additionalProgress = 0;
    if (project.status !== 'ready_to_build' && project.progress) {
      additionalProgress = (project.progress / 100) * (100 / (totalStages - 1));
    }
    
    const totalProgress = baseProgress + additionalProgress;
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 my-1">
        <div 
          className={`${getProgressColor(project.status)} h-2.5 rounded-full`} 
          style={{ width: `${totalProgress}%` }}
        ></div>
      </div>
    );
  };
  
  // Funkcja do renderowania przycisku akcji
  const renderActionButton = (project) => {
    const isRTB = project.status === 'ready_to_build';
    
    // Funkcje akcji dla projektów
    const handleAccelerateProject = () => {
      accelerateProject(project.id);
    };
    
    const handleSendProjectToMarket = () => {
      sendProjectToMarket(project.id);
    };
    
    const handleApplyIllegalMethod = () => {
      applyIllegalMethod(project.id, 'bribery');
    };
    
    return (
      <div className="flex space-x-2 mt-2">
        {!isRTB && (
          <button 
            onClick={handleAccelerateProject}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs flex items-center"
          >
            <ArrowUp className="h-3 w-3 mr-1" />
            Przyspiesz
          </button>
        )}
        
        {isRTB && (
          <button 
            onClick={handleSendProjectToMarket}
            className="px-2 py-1 bg-green-500 text-white rounded text-xs flex items-center"
          >
            <Tag className="h-3 w-3 mr-1" />
            Wystaw na rynek
          </button>
        )}
        
        {!isRTB && playerState.reputation >= 120 && (
          <button 
            onClick={handleApplyIllegalMethod}
            className="px-2 py-1 bg-gray-700 text-white rounded text-xs flex items-center"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Szara strefa
          </button>
        )}
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Briefcase className="h-6 w-6 mr-2 text-blue-600" /> 
        Podsumowanie projektów
      </h2>
      
      {/* Statystyki projektów */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
        <div className="bg-blue-50 p-3 rounded-md">
          <div className="text-xs text-blue-800">Wszystkie projekty</div>
          <div className="text-xl font-bold text-blue-900">{projectStats.total}</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-md">
          <div className="text-xs text-yellow-800">Fotowoltaika (PV)</div>
          <div className="text-xl font-bold text-yellow-900">{projectStats.pv}</div>
        </div>
        <div className="bg-green-50 p-3 rounded-md">
          <div className="text-xs text-green-800">Farmy wiatrowe (WF)</div>
          <div className="text-xl font-bold text-green-900">{projectStats.wf}</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-md">
          <div className="text-xs text-purple-800">W developmencie</div>
          <div className="text-xl font-bold text-purple-900">{projectStats.development}</div>
        </div>
        <div className="bg-indigo-50 p-3 rounded-md">
          <div className="text-xs text-indigo-800">Ready-to-Build</div>
          <div className="text-xl font-bold text-indigo-900">{projectStats.rtb}</div>
        </div>
        <div className="bg-red-50 p-3 rounded-md">
          <div className="text-xs text-red-800">Moc całkowita</div>
          <div className="text-xl font-bold text-red-900">{projectStats.totalPower} MW</div>
        </div>
      </div>
      
      {/* Filtry i sortowanie */}
      <div className="flex flex-wrap gap-2 mb-4 items-center text-sm">
        <div className="font-medium">Filtruj:</div>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="all">Wszystkie projekty</option>
          <option value="pv">Fotowoltaika (PV)</option>
          <option value="wf">Farmy wiatrowe (WF)</option>
          <option value="development">W developmencie</option>
          <option value="rtb">Ready-to-Build</option>
        </select>
        
        <div className="font-medium ml-4">Sortuj:</div>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="progress">Postęp</option>
          <option value="power">Moc (MW)</option>
          <option value="stage">Etap</option>
          <option value="value">Wartość</option>
        </select>
        
        <button 
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="border rounded px-2 py-1 flex items-center"
        >
          {sortOrder === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>
      
      {/* Lista projektów */}
      {sortedProjects.length > 0 ? (
        <div className="space-y-3">
          {sortedProjects.map((project) => (
            <div key={project.id} className="border rounded-lg overflow-hidden">
              {/* Nagłówek projektu */}
              <div 
                className="bg-gray-50 p-3 flex items-center justify-between cursor-pointer"
                onClick={() => setActiveAccordion(activeAccordion === project.id ? null : project.id)}
              >
                <div className="flex items-center space-x-3">
                  {getTechnologyIcon(project.technology)}
                  <span className="font-medium">{project.name}</span>
                  <span className="text-sm text-gray-500">{project.power} MW</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium">
                    {translateStage(project.status)}
                  </div>
                  {activeAccordion === project.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </div>
              
              {/* Pasek postępu zawsze widoczny */}
              <div className="px-3 py-2 bg-white">
                {renderProgressBar(project)}
              </div>
              
              {/* Szczegóły projektu (rozwijane) */}
              {activeAccordion === project.id && (
                <div className="p-3 bg-white border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-medium flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-600" />
                        Lokalizacja
                      </h4>
                      <p className="text-sm mt-1">
                        {project.regionId || "Nie określono"}, 
                        {project.countyId ? ` pow. ${project.countyId}` : ""}
                      </p>
                      
                      <h4 className="text-sm font-medium flex items-center mt-3">
                        <BarChart2 className="h-4 w-4 mr-1 text-gray-600" />
                        Parametry
                      </h4>
                      <p className="text-sm mt-1">
                        Moc: {project.power} MW<br />
                        {project.area ? `Powierzchnia: ${project.area} ha` : ""}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-600" />
                        Status i postęp
                      </h4>
                      <p className="text-sm mt-1">
                        Etap: {translateStage(project.status)}<br />
                        Postęp w etapie: {project.progress || 0}%<br />
                        {project.startDate && `Start: ${new Date(project.startDate).toLocaleDateString()}`}
                      </p>
                      
                      <h4 className="text-sm font-medium flex items-center mt-3">
                        <Users className="h-4 w-4 mr-1 text-gray-600" />
                        Zespół
                      </h4>
                      <p className="text-sm mt-1">
                        {project.assignedStaff && Object.keys(project.assignedStaff).length > 0 ? (
                          <>
                            Przydzielonych pracowników: {Object.keys(project.assignedStaff).length}
                          </>
                        ) : (
                          "Brak przydzielonych pracowników"
                        )}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-gray-600" />
                        Finanse
                      </h4>
                      <p className="text-sm mt-1">
                        Koszt całkowity: {(project.totalCost || 0).toLocaleString()} zł<br />
                        Wydano: {(project.spentCost || 0).toLocaleString()} zł<br />
                        Szacowana wartość: {(project.power * 150000 * (project.status === 'ready_to_build' ? 1 : 0.5)).toLocaleString()} zł
                      </p>
                      
                      {/* Przyciski akcji */}
                      {renderActionButton(project)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <div className="text-gray-400 mb-3">
            <PlusCircle className="h-10 w-10 mx-auto" />
          </div>
          <p className="text-gray-600">Brak projektów spełniających kryteria filtrowania</p>
          <p className="text-sm text-gray-400 mt-2">
            Zmień filtry lub rozpocznij nowe projekty
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectsSummaryPanel; 