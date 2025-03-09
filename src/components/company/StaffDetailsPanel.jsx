import React from 'react';
import { usePlayerContext } from '../../store/PlayerContext';
import { useGameContext } from '../../store/GameContext';
import { translateStaffType, translateStaffLevel } from '../../utils/translators';
import Button from '../ui/Button';
import { 
  User, Clock, Briefcase, Award, Brain, 
  TrendingUp, Heart, Battery, CreditCard, CalendarDays, UserX 
} from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';

const StaffDetailsPanel = ({ staffId, staffType, onClose, onFire, onTrain, onAssign }) => {
  const { state: player } = usePlayerContext();
  const { state: gameState } = useGameContext();
  
  // Znajdujemy pracownika w stanie gracza
  const staffTypeKey = staffType.endsWith('s') ? staffType : `${staffType}s`;
  const staff = player.staff[staffTypeKey]?.find(s => s.id === staffId);
  
  if (!staff) {
    return (
      <div className="p-4">
        <div className="bg-red-100 p-4 rounded">
          <p className="text-red-800">Nie znaleziono pracownika.</p>
        </div>
        <Button onClick={onClose} className="mt-4">Zamknij</Button>
      </div>
    );
  }
  
  // Formatujemy datę zatrudnienia
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL');
  };
  
  // Obliczamy czas zatrudnienia
  const calculateEmploymentDuration = () => {
    const hiredDate = new Date(staff.hiredOn);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - hiredDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} dni (${Math.floor(diffDays / 30)} miesięcy)`;
  };
  
  // Formatujemy wynagrodzenie
  const formatSalary = (salary) => {
    return `${salary.toLocaleString()} PLN / mies.`;
  };
  
  // Określamy klasę dla stanu morale i energii
  const getMoraleClass = (morale) => {
    if (morale >= 80) return "text-green-600";
    if (morale >= 50) return "text-blue-600";
    if (morale >= 30) return "text-yellow-600";
    return "text-red-600";
  };
  
  const getEnergyClass = (energy) => {
    if (energy >= 80) return "text-green-600";
    if (energy >= 50) return "text-blue-600";
    if (energy >= 30) return "text-yellow-600";
    return "text-red-600";
  };
  
  // Sprawdzamy, czy pracownik jest przypisany do projektu
  const assignedProject = player.projects.find(p => p.id === staff.assignedProject);
  
  // Grupujemy cechy na pozytywne, negatywne i neutralne
  const positiveTraits = staff.traits?.filter(t => t.effect > 0) || [];
  const negativeTraits = staff.traits?.filter(t => t.effect < 0) || [];
  const neutralTraits = staff.traits?.filter(t => t.effect === 0) || [];
  
  // Renderujemy jedną cechę
  const renderTrait = (trait) => {
    const getTraitClass = () => {
      if (trait.effect > 0) return "text-green-600";
      if (trait.effect < 0) return "text-red-600";
      return "text-gray-600";
    };
    
    return (
      <div key={trait.name} className="flex items-center">
        <span className={`${getTraitClass()} font-medium mr-2`}>{trait.name}</span>
        <span className="text-sm text-gray-600">{trait.description}</span>
      </div>
    );
  };
  
  return (
    <div className="overflow-y-auto">
      {/* Nagłówek z podstawowymi informacjami */}
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
          <User className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{staff.name}</h2>
          <div className="flex items-center text-gray-600">
            <Briefcase className="h-4 w-4 mr-1" />
            <span>{translateStaffType(staffType)} ({translateStaffLevel(staff.level)})</span>
          </div>
        </div>
      </div>
      
      {/* Sekcja umiejętności */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-2 flex items-center">
          <Brain className="h-5 w-5 mr-2 text-purple-600" />
          Umiejętności i rozwój
        </h3>
        
        <div className="bg-white rounded shadow p-4">
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-gray-700">Poziom umiejętności:</span>
              <span className="font-medium">{staff.skill}/10</span>
            </div>
            <ProgressBar value={staff.skill * 10} max={100} colorClass="bg-purple-500" />
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-gray-700">Doświadczenie:</span>
              <span className="font-medium">{staff.experience} pkt</span>
            </div>
            <ProgressBar 
              value={staff.experience % 100} 
              max={100} 
              colorClass="bg-blue-500" 
            />
            <div className="text-sm text-gray-600 mt-1">
              Do awansu: {100 - (staff.experience % 100)} pkt
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <div className="text-gray-700 mb-1">Specjalizacja:</div>
              <div className="font-medium">{staff.specialization || "Brak"}</div>
            </div>
            <div>
              <div className="text-gray-700 mb-1">Odbyte szkolenia:</div>
              <div className="font-medium">{staff.training?.length || 0}</div>
            </div>
          </div>
        </div>
        
        {/* Przyciski akcji */}
        <div className="flex gap-2 mt-3">
          <Button 
            onClick={() => onTrain(staffId, staffType)}
            variant="primary"
            className="flex-1"
            icon={<TrendingUp className="h-4 w-4" />}
          >
            Trenuj
          </Button>
          
          <Button 
            onClick={() => onAssign(staffId, staffType)}
            variant="secondary"
            className="flex-1"
            icon={<Briefcase className="h-4 w-4" />}
          >
            Przydziel do projektu
          </Button>
        </div>
      </div>
      
      {/* Sekcja cech charakteru */}
      {(staff.traits && staff.traits.length > 0) && (
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-2">Cechy charakteru</h3>
          
          <div className="bg-white rounded shadow p-4">
            {positiveTraits.length > 0 && (
              <div className="mb-3">
                <h4 className="font-medium text-green-600 mb-1">Pozytywne:</h4>
                <div className="space-y-1">
                  {positiveTraits.map(renderTrait)}
                </div>
              </div>
            )}
            
            {neutralTraits.length > 0 && (
              <div className="mb-3">
                <h4 className="font-medium text-gray-600 mb-1">Neutralne:</h4>
                <div className="space-y-1">
                  {neutralTraits.map(renderTrait)}
                </div>
              </div>
            )}
            
            {negativeTraits.length > 0 && (
              <div>
                <h4 className="font-medium text-red-600 mb-1">Negatywne:</h4>
                <div className="space-y-1">
                  {negativeTraits.map(renderTrait)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Historia pracownika */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-2 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-blue-600" />
          Historia zatrudnienia
        </h3>
        
        <div className="bg-white rounded shadow p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-gray-700 mb-1">Data zatrudnienia:</div>
              <div className="font-medium">{formatDate(staff.hiredOn)}</div>
            </div>
            <div>
              <div className="text-gray-700 mb-1">Czas zatrudnienia:</div>
              <div className="font-medium">{calculateEmploymentDuration()}</div>
            </div>
            <div>
              <div className="text-gray-700 mb-1">Wynagrodzenie:</div>
              <div className="font-medium">{formatSalary(staff.salary)}</div>
            </div>
            <div>
              <div className="text-gray-700 mb-1">Koszt zatrudnienia:</div>
              <div className="font-medium">{formatSalary(staff.hiringCost || 0)}</div>
            </div>
          </div>
          
          {assignedProject && (
            <div className="mt-3 p-2 bg-blue-50 rounded">
              <div className="text-blue-800 font-medium">Przypisany do projektu:</div>
              <div>{assignedProject.name} ({assignedProject.technology})</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Status pracownika */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-2 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-red-600" />
          Status
        </h3>
        
        <div className="bg-white rounded shadow p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>Morale:</span>
                <span className={getMoraleClass(staff.morale)}>{staff.morale}%</span>
              </div>
              <ProgressBar 
                value={staff.morale} 
                max={100} 
                colorClass={staff.morale >= 50 ? "bg-green-500" : "bg-red-500"} 
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Energia:</span>
                <span className={getEnergyClass(staff.energy)}>{staff.energy}%</span>
              </div>
              <ProgressBar 
                value={staff.energy} 
                max={100} 
                colorClass={staff.energy >= 50 ? "bg-blue-500" : "bg-orange-500"} 
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Akcje na dole */}
      <div className="mt-6 flex justify-between">
        <Button 
          onClick={() => onFire(staffId, staffType)} 
          variant="danger"
          icon={<UserX className="h-4 w-4" />}
        >
          Zwolnij pracownika
        </Button>
        
        <Button onClick={onClose} variant="secondary">Zamknij</Button>
      </div>
    </div>
  );
};

export default StaffDetailsPanel; 