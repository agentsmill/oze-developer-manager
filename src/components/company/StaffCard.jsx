import React from 'react';
import { Battery, Clock, Heart, Briefcase, Award, Brain, Zap } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';
import '../../styles/indicators.css';

/**
 * Komponent karty pracownika
 * @param {Object} props - Właściwości komponentu
 * @param {Object} props.staff - Dane pracownika
 * @param {function} props.onFire - Funkcja obsługująca zwolnienie
 * @param {function} props.onTrain - Funkcja obsługująca szkolenie
 * @param {function} props.onAssign - Funkcja obsługująca przypisanie do projektu
 * @param {function} props.onDetails - Funkcja otwierająca szczegóły
 * @returns {JSX.Element} Element JSX
 */
const StaffCard = ({ 
  staff, 
  onFire, 
  onTrain, 
  onAssign, 
  onDetails 
}) => {
  if (!staff) return null;
  
  // Ustalamy klasę dla morale pracownika
  const getMoraleClass = (morale) => {
    if (morale >= 75) return 'staff-morale-high';
    if (morale >= 40) return 'staff-morale-medium';
    return 'staff-morale-low';
  };
  
  // Ustalamy klasę dla energii pracownika
  const getEnergyClass = (energy) => {
    if (energy >= 75) return 'staff-energy-high';
    if (energy >= 40) return 'staff-energy-medium';
    return 'staff-energy-low';
  };
  
  // Obliczamy pasek doświadczenia
  const getExperienceProgress = () => {
    const levels = { junior: 0, mid: 1, senior: 2 };
    const currentLevel = levels[staff.level] || 0;
    const nextLevel = currentLevel < 2 ? currentLevel + 1 : 2;
    
    // Jeśli pracownik jest już seniorem, pokazujemy pełny pasek
    if (currentLevel === 2) return 100;
    
    // Progowe wartości doświadczenia dla poziomów
    const thresholds = [0, 3000, 8000];
    
    // Obliczamy procent postępu do następnego poziomu
    const currentExp = staff.experience || 0;
    const currentThreshold = thresholds[currentLevel];
    const nextThreshold = thresholds[nextLevel];
    
    const progress = ((currentExp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(100, Math.max(0, progress));
  };
  
  // Pobieramy ikony cech
  const getTraitIcon = (trait) => {
    switch(trait) {
      case 'pracowity': return <Zap size={14} className="text-yellow-500" />;
      case 'kreatywny': return <Brain size={14} className="text-blue-500" />;
      case 'dokładny': return <Award size={14} className="text-purple-500" />;
      case 'konfliktowy': return <Heart size={14} className="text-red-500" />;
      default: return null;
    }
  };
  
  // Formatujemy pensję
  const formatSalary = (salary) => {
    return `${(salary/1000).toFixed(1)}k PLN`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ${staff.level === 'senior' ? 'bg-purple-100' : staff.level === 'mid' ? 'bg-blue-100' : 'bg-green-100'}`}>
            <span className="text-sm font-bold">
              {staff.name ? staff.name[0] : 'P'}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{staff.name || 'Pracownik'}</h3>
            <p className="text-xs text-gray-600">
              {staff.type === 'scout' ? 'Pozyskiwacz' : 
               staff.type === 'developer' ? 'Developer' : 
               staff.type === 'lobbyist' ? 'Lobbysta' : 'Specjalista'} 
              {" • "}
              {staff.level === 'junior' ? 'Początkujący' : 
               staff.level === 'mid' ? 'Doświadczony' : 'Ekspert'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Pensja</div>
          <div className="text-sm font-medium">{formatSalary(staff.salary || 0)}</div>
        </div>
      </div>
      
      <div className="px-4 py-3">
        {/* Statystyki pracownika */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center">
            <Award className="h-4 w-4 text-blue-500 mr-1" />
            <div className="text-xs text-gray-700">Umiejętność: <span className="font-medium">{staff.skill || 0}/10</span></div>
          </div>
          <div className="flex items-center">
            <Briefcase className="h-4 w-4 text-gray-500 mr-1" />
            <div className="text-xs text-gray-700">Doświadczenie: <span className="font-medium">{Math.floor((staff.experience || 0) / 365)} lat</span></div>
          </div>
        </div>
        
        {/* Pasek doświadczenia */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Rozwój kariery</span>
            <span>{staff.level === 'junior' ? 'Junior → Mid' : staff.level === 'mid' ? 'Mid → Senior' : 'Senior'}</span>
          </div>
          <ProgressBar 
            value={getExperienceProgress()} 
            status={staff.level === 'senior' ? 'high' : 'medium'} 
          />
        </div>
        
        {/* Morale i energia */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <Heart className={`h-4 w-4 mr-1 ${getMoraleClass(staff.morale || 0)}`} />
                <span className="text-xs text-gray-600">Morale</span>
              </div>
              <span className={`text-xs font-medium ${getMoraleClass(staff.morale || 0)}`}>
                {staff.morale || 0}%
              </span>
            </div>
            <ProgressBar 
              value={staff.morale || 0} 
              status={staff.morale >= 75 ? 'high' : staff.morale >= 40 ? 'medium' : 'low'} 
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <Battery className={`h-4 w-4 mr-1 ${getEnergyClass(staff.energy || 0)}`} />
                <span className="text-xs text-gray-600">Energia</span>
              </div>
              <span className={`text-xs font-medium ${getEnergyClass(staff.energy || 0)}`}>
                {staff.energy || 0}%
              </span>
            </div>
            <ProgressBar 
              value={staff.energy || 0} 
              status={staff.energy >= 75 ? 'high' : staff.energy >= 40 ? 'medium' : 'low'} 
            />
          </div>
        </div>
        
        {/* Cechy */}
        {staff.traits && staff.traits.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-1">Cechy charakteru</div>
            <div className="flex flex-wrap gap-1">
              {staff.traits.map((trait, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                >
                  {getTraitIcon(trait)}
                  <span className="ml-1 capitalize">{trait}</span>
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Przyciski akcji */}
        <div className="flex space-x-2 mt-3">
          <button 
            onClick={() => onDetails && onDetails(staff)}
            className="flex-1 text-xs py-1 px-2 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            Szczegóły
          </button>
          <button 
            onClick={() => onTrain && onTrain(staff)}
            className="flex-1 text-xs py-1 px-2 bg-green-50 text-green-600 rounded border border-green-200 hover:bg-green-100 transition-colors"
          >
            Szkolenie
          </button>
          <button 
            onClick={() => onFire && onFire(staff)}
            className="flex-1 text-xs py-1 px-2 bg-red-50 text-red-600 rounded border border-red-200 hover:bg-red-100 transition-colors"
          >
            Zwolnij
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffCard; 