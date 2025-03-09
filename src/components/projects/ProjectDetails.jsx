import React, { useState } from 'react';
import { usePlayerContext } from '../../store/PlayerContext';
import { translateStage, getStageDescription, translateStaffType } from '../../utils/translators';
import Button from '../ui/Button';
import { Users, Briefcase, Clock, TrendingUp, ChevronRight, AlertTriangle, Shield } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';

const ProjectDetails = ({ project, onClose, onAssignStaff, onAdvance, onApplyIllegalMethod }) => {
  const { state: playerState } = usePlayerContext();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Funkcja do formatowania kosztów
  const formatCost = (cost) => {
    return cost.toLocaleString() + ' PLN';
  };
  
  // Typ pracownika na podstawie etapu projektu
  const getRecommendedStaffTypes = (stage) => {
    switch(stage) {
      case 'land_acquisition':
        return ['scout', 'developer'];
      case 'environmental_decision':
        return ['envSpecialist', 'developer'];
      case 'zoning_conditions':
        return ['lawyer', 'developer', 'lobbyist'];
      case 'grid_connection':
        return ['lawyer', 'lobbyist', 'developer'];
      case 'ready_to_build':
        return ['developer'];
      default:
        return ['developer'];
    }
  };
  
  // Znajdujemy przypisanych pracowników
  const assignedStaff = project.assignedStaff || {};
  const assignedStaffDetails = {};
  
  // Dla każdego typu pracownika, znajdujemy szczegóły
  Object.entries(assignedStaff).forEach(([type, id]) => {
    if (!id) return;
    
    const staffTypeKey = type.endsWith('s') ? type : `${type}s`;
    const staff = playerState.staff[staffTypeKey]?.find(s => s.id === id);
    
    if (staff) {
      assignedStaffDetails[type] = staff;
    }
  });
  
  // Wpływ przypisanych pracowników na postęp
  const getStaffImpact = (type, staff) => {
    if (!staff) return 'Brak wpływu';
    
    switch(type) {
      case 'scout':
        if (project.status === 'land_acquisition') {
          return `+${(staff.skill / 5).toFixed(1)} punktów postępu na turę`;
        }
        return 'Niewielki wpływ na tym etapie';
      
      case 'developer':
        return `+${(staff.skill / 10).toFixed(1)} punktów postępu na turę`;
      
      case 'envSpecialist':
        if (project.status === 'environmental_decision') {
          return `+${(staff.skill / 5).toFixed(1)} punktów postępu na turę`;
        }
        return 'Niewielki wpływ na tym etapie';
      
      case 'lawyer':
        if (project.status === 'zoning_conditions') {
          return `+${(staff.skill / 7).toFixed(1)} punktów postępu na turę`;
        } else if (project.status === 'grid_connection') {
          return `+${(staff.skill / 10).toFixed(1)} punktów postępu na turę`;
        }
        return 'Niewielki wpływ na tym etapie';
      
      case 'lobbyist':
        if (project.status === 'zoning_conditions') {
          return `+${(staff.skill / 8).toFixed(1)} punktów postępu na turę`;
        } else if (project.status === 'grid_connection') {
          return `+${(staff.skill / 6).toFixed(1)} punktów postępu na turę`;
        }
        return 'Niewielki wpływ na tym etapie';
        
      default:
        return 'Brak danych';
    }
  };
  
  // Rekomendowane typy pracowników dla tego etapu
  const recommendedStaffTypes = getRecommendedStaffTypes(project.status);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Nagłówek */}
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{project.name}</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-blue-200"
          >
            &times;
          </button>
        </div>
        
        {/* Podstawowe informacje */}
        <div className="bg-blue-50 px-6 py-3 flex flex-wrap gap-6 items-center">
          <div>
            <span className="text-gray-500 text-sm">Technologia:</span>
            <div className="font-medium">{project.technology}</div>
          </div>
          
          <div>
            <span className="text-gray-500 text-sm">Moc:</span>
            <div className="font-medium">{project.power} MW</div>
          </div>
          
          <div>
            <span className="text-gray-500 text-sm">Region:</span>
            <div className="font-medium">{project.region}</div>
          </div>
          
          <div>
            <span className="text-gray-500 text-sm">Etap:</span>
            <div className="font-medium">{translateStage(project.status)}</div>
          </div>
          
          <div className="flex-grow">
            <span className="text-gray-500 text-sm">Postęp:</span>
            <ProgressBar 
              value={project.progress} 
              max={100} 
              colorClass={project.progress >= 100 ? "bg-green-500" : "bg-blue-500"} 
              showLabel={true}
            />
          </div>
          
          {project.useIllegalMethods && (
            <div className="flex items-center text-amber-600">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Używa nielegalnych metod</span>
            </div>
          )}
        </div>
        
        {/* Zakładki */}
        <div className="flex border-b">
          <button 
            className={`px-6 py-3 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-700'}`}
            onClick={() => setActiveTab('overview')}
          >
            Przegląd
          </button>
          
          <button 
            className={`px-6 py-3 ${activeTab === 'staff' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-700'}`}
            onClick={() => setActiveTab('staff')}
          >
            Pracownicy
          </button>
          
          <button 
            className={`px-6 py-3 ${activeTab === 'events' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-700'}`}
            onClick={() => setActiveTab('events')}
          >
            Historia
          </button>
        </div>
        
        {/* Zawartość zakładek */}
        <div className="p-6 overflow-y-auto flex-grow">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-medium mb-2">Etap: {translateStage(project.status)}</h3>
              <p className="text-gray-700 mb-4">{getStageDescription(project.status)}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border rounded p-4">
                  <h4 className="font-medium flex items-center mb-2">
                    <Briefcase className="h-4 w-4 mr-2 text-blue-500" />
                    Informacje finansowe
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Koszt całkowity:</span>
                      <span className="font-medium">{formatCost(project.totalCost || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Szacowana wartość:</span>
                      <span className="font-medium">{formatCost(project.marketValue || project.totalCost || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Potencjalny zysk:</span>
                      <span className={`font-medium ${(project.marketValue || 0) > (project.totalCost || 0) ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCost((project.marketValue || 0) - (project.totalCost || 0))}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded p-4">
                  <h4 className="font-medium flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                    Czas i zaawansowanie
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data rozpoczęcia:</span>
                      <span className="font-medium">Tura {project.startTurn || 1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Czas trwania etapu:</span>
                      <span className="font-medium">{project.etapDuration || 'Nieznany'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Postęp:</span>
                      <span className="font-medium">{project.progress.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Akcje */}
              <div className="flex flex-wrap gap-3 mt-6">
                {onAssignStaff && (
                  <Button 
                    onClick={() => onAssignStaff(project.id)} 
                    icon={<Users />} 
                    variant="secondary"
                  >
                    Przydziel pracowników
                  </Button>
                )}
                
                {onAdvance && project.progress >= 100 && (
                  <Button 
                    onClick={() => onAdvance(project.id)} 
                    icon={<ChevronRight />} 
                    variant="success"
                  >
                    Przejdź do następnego etapu
                  </Button>
                )}
                
                {onApplyIllegalMethod && !project.useIllegalMethods && (
                  <Button 
                    onClick={() => onApplyIllegalMethod(project.id)} 
                    icon={<AlertTriangle />} 
                    variant="warning"
                  >
                    Użyj nielegalnych metod
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'staff' && (
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                Przypisani pracownicy
              </h3>
              
              <div className="mb-6">
                <h4 className="font-medium text-blue-600 mb-2">Rekomendowani specjaliści dla etapu {translateStage(project.status)}</h4>
                <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                  {recommendedStaffTypes.map(type => (
                    <li key={type}>
                      {translateStaffType(type)} - {getRecommendedStaffDescription(type, project.status)}
                    </li>
                  ))}
                </ul>
              </div>
              
              {Object.keys(assignedStaffDetails).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(assignedStaffDetails).map(([type, staff]) => (
                    <div key={type} className="border rounded p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{staff.name}</h4>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {translateStaffType(type)}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Poziom:</span>
                          <span className="font-medium">{staff.level}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Umiejętności:</span>
                          <span className="font-medium">{staff.skill}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Specjalizacja:</span>
                          <span className="font-medium">{staff.specialization || 'Brak'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Wpływ na projekt:</span>
                          <span className="font-medium text-green-600">{getStaffImpact(type, staff)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
                  <p>Brak przypisanych pracowników do tego projektu.</p>
                  <button 
                    onClick={() => onAssignStaff && onAssignStaff(project.id)}
                    className="mt-2 text-blue-600 hover:underline flex items-center"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Przydziel pracowników
                  </button>
                </div>
              )}
              
              <div className="mt-6">
                <Button 
                  onClick={() => onAssignStaff && onAssignStaff(project.id)} 
                  icon={<Users />} 
                  variant="primary"
                >
                  Zarządzaj pracownikami projektu
                </Button>
              </div>
            </div>
          )}
          
          {activeTab === 'events' && (
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                Historia projektu
              </h3>
              
              {project.events && project.events.length > 0 ? (
                <div className="border rounded divide-y">
                  {project.events.map((event, index) => (
                    <div key={index} className="p-3 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">Tura {event.turn || '?'}</span>
                        <span className={event.type === 'illegal' ? 'text-amber-600 text-sm' : 'text-sm'}>{event.type || ''}</span>
                      </div>
                      <p className="mt-1">{event.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Brak historii dla tego projektu.</p>
              )}
            </div>
          )}
        </div>
        
        {/* Stopka */}
        <div className="bg-gray-50 px-6 py-3 flex justify-end">
          <Button onClick={onClose} variant="secondary">Zamknij</Button>
        </div>
      </div>
    </div>
  );
};

// Funkcja pomocnicza do opisu rekomendowanych typów pracowników
const getRecommendedStaffDescription = (type, stage) => {
  switch(type) {
    case 'scout':
      return 'Przyspiesza pozyskiwanie gruntów i negocjacje z właścicielami.';
    case 'developer':
      return 'Podstawowy specjalista potrzebny na każdym etapie projektu.';
    case 'envSpecialist':
      return 'Znacząco przyspiesza uzyskanie decyzji środowiskowej.';
    case 'lawyer':
      if (stage === 'zoning_conditions') {
        return 'Pomaga w uzyskaniu warunków zabudowy i pozwoleń.';
      } else if (stage === 'grid_connection') {
        return 'Wspiera w negocjacjach z operatorem sieci.';
      }
      return 'Zapewnia wsparcie prawne w procedurach administracyjnych.';
    case 'lobbyist':
      if (stage === 'zoning_conditions') {
        return 'Przyspiesza decyzje dotyczące warunków zabudowy.';
      } else if (stage === 'grid_connection') {
        return 'Znacząco przyspiesza proces przyłączenia do sieci.';
      }
      return 'Wpływa na decyzje urzędników i przyspiesza procedury.';
    default:
      return 'Brak szczegółowego opisu.';
  }
};

export default ProjectDetails; 