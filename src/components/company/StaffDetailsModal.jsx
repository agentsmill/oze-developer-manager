import React from 'react';
import { X, User, Award, Heart, Battery, CreditCard, Calendar, Check, AlertTriangle, Brain, Zap } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';
import { POSITIVE_TRAITS, NEUTRAL_TRAITS, NEGATIVE_TRAITS } from '../../models/Staff';
import '../../styles/indicators.css';

/**
 * Modal szczegółów pracownika
 * @param {Object} props - Właściwości komponentu
 * @param {Object} props.staff - Dane pracownika
 * @param {function} props.onClose - Funkcja zamykająca modal
 * @param {function} props.onFire - Funkcja obsługująca zwolnienie
 * @param {function} props.onTrain - Funkcja obsługująca szkolenie
 * @returns {JSX.Element} Element JSX
 */
const StaffDetailsModal = ({ staff, onClose, onFire, onTrain }) => {
  if (!staff) return null;
  
  // Znajdź pełny opis cechy
  const getTraitDetails = (traitId) => {
    const allTraits = [...POSITIVE_TRAITS, ...NEUTRAL_TRAITS, ...NEGATIVE_TRAITS];
    return allTraits.find(t => t.id === traitId) || { label: traitId, description: '' };
  };
  
  // Formatowanie daty
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pl-PL', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };
  
  // Oblicz czas zatrudnienia
  const getEmploymentDuration = () => {
    if (!staff.hiredOn) return '-';
    
    const hiredDate = new Date(staff.hiredOn);
    const today = new Date();
    const diffTime = Math.abs(today - hiredDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} dni`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} mies.`;
    } else {
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      return `${years} lat${months > 0 ? `, ${months} mies.` : ''}`;
    }
  };
  
  // Formatowanie wynagrodzenia
  const formatSalary = (salary) => {
    return `${salary.toLocaleString()} PLN`;
  };
  
  // Klasyfikacja statusu morale
  const getMoraleStatus = (morale) => {
    if (morale >= 80) return { text: 'Doskonałe', status: 'high' };
    if (morale >= 60) return { text: 'Dobre', status: 'high' };
    if (morale >= 40) return { text: 'Neutralne', status: 'medium' };
    if (morale >= 20) return { text: 'Słabe', status: 'low' };
    return { text: 'Krytyczne', status: 'low' };
  };
  
  // Klasyfikacja statusu energii
  const getEnergyStatus = (energy) => {
    if (energy >= 80) return { text: 'Pełna', status: 'high' };
    if (energy >= 60) return { text: 'Wysoka', status: 'high' };
    if (energy >= 40) return { text: 'Średnia', status: 'medium' };
    if (energy >= 20) return { text: 'Niska', status: 'low' };
    return { text: 'Wyczerpanie', status: 'low' };
  };
  
  // Pobierz klasę koloru dla cechy
  const getTraitTypeClass = (traitId) => {
    if (POSITIVE_TRAITS.some(t => t.id === traitId)) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (NEGATIVE_TRAITS.some(t => t.id === traitId)) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Nagłówek */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{staff.name}</h2>
              <p className="text-sm text-gray-600">
                {staff.type === 'scout' ? 'Pozyskiwacz' : 
                 staff.type === 'developer' ? 'Developer' : 
                 staff.type === 'lobbyist' ? 'Lobbysta' : 
                 staff.type === 'lawyer' ? 'Prawnik' : 
                 staff.type === 'envSpecialist' ? 'Specjalista środowiskowy' : 
                 'Pracownik'} • {
                  staff.level === 'junior' ? 'Początkujący' : 
                  staff.level === 'mid' ? 'Doświadczony' : 
                  'Ekspert'
                }
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* Treść */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Lewa kolumna - Podstawowe informacje */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-500" />
                  Informacje podstawowe
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Data zatrudnienia</div>
                    <div className="font-medium">{formatDate(staff.hiredOn)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Czas zatrudnienia</div>
                    <div className="font-medium">{getEmploymentDuration()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Wynagrodzenie</div>
                    <div className="font-medium">{formatSalary(staff.salary || 0)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Specjalizacja</div>
                    <div className="font-medium">{staff.specialization || '-'}</div>
                  </div>
                </div>
              </div>
              
              {/* Umiejętności i postęp */}
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-blue-500" />
                  Umiejętności i rozwój
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Umiejętność podstawowa</span>
                      <span className="text-sm font-medium">{staff.skill || 0}/10</span>
                    </div>
                    <ProgressBar 
                      value={(staff.skill || 0) * 10} 
                      status={(staff.skill || 0) >= 7 ? 'high' : (staff.skill || 0) >= 4 ? 'medium' : 'low'} 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Doświadczenie</span>
                      <span className="text-sm font-medium">{staff.experience || 0} pkt</span>
                    </div>
                    <ProgressBar 
                      value={
                        staff.level === 'senior' ? 100 :
                        staff.level === 'mid' ? 
                          ((staff.experience - 3000) / 5000) * 100 : 
                          (staff.experience / 3000) * 100
                      } 
                      status="medium" 
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {staff.level === 'junior' ? 'Do awansu na poziom Doświadczony' :
                       staff.level === 'mid' ? 'Do awansu na poziom Ekspert' :
                       'Najwyższy poziom doświadczenia'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Cechy */}
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-blue-500" />
                  Cechy charakteru
                </h3>
                
                {staff.traits && staff.traits.length > 0 ? (
                  <div className="space-y-3">
                    {staff.traits.map(traitId => {
                      const trait = getTraitDetails(traitId);
                      return (
                        <div 
                          key={traitId} 
                          className={`p-2 rounded border ${getTraitTypeClass(traitId)}`}
                        >
                          <div className="font-medium">{trait.label || traitId}</div>
                          <div className="text-sm">{trait.description}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Brak zdefiniowanych cech</p>
                )}
              </div>
              
              {/* Historia */}
              {staff.historia && staff.historia.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                    Historia pracownika
                  </h3>
                  
                  <div className="border rounded divide-y">
                    {staff.historia.map((event, index) => (
                      <div key={index} className="p-3">
                        <div className="flex justify-between">
                          <div className="font-medium">{event.opis}</div>
                          <div className="text-sm text-gray-500">{formatDate(event.data)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Prawa kolumna - Status i akcje */}
            <div className="space-y-6">
              {/* Status */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-bold mb-3">Status</h3>
                
                <div className="space-y-4">
                  {/* Morale */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm flex items-center">
                        <Heart className="h-4 w-4 mr-1 text-red-500" />
                        Morale
                      </span>
                      <span className={`text-sm font-medium ${
                        getMoraleStatus(staff.morale || 0).status === 'high' ? 'text-green-600' :
                        getMoraleStatus(staff.morale || 0).status === 'medium' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {getMoraleStatus(staff.morale || 0).text}
                      </span>
                    </div>
                    <ProgressBar 
                      value={staff.morale || 0} 
                      status={getMoraleStatus(staff.morale || 0).status} 
                    />
                  </div>
                  
                  {/* Energia */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm flex items-center">
                        <Battery className="h-4 w-4 mr-1 text-green-500" />
                        Energia
                      </span>
                      <span className={`text-sm font-medium ${
                        getEnergyStatus(staff.energy || 0).status === 'high' ? 'text-green-600' :
                        getEnergyStatus(staff.energy || 0).status === 'medium' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {getEnergyStatus(staff.energy || 0).text}
                      </span>
                    </div>
                    <ProgressBar 
                      value={staff.energy || 0} 
                      status={getEnergyStatus(staff.energy || 0).status} 
                    />
                  </div>
                </div>
                
                {/* Potrzeby pracownika */}
                {staff.potrzeby && (
                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-2">Potrzeby</h4>
                    <div className="space-y-2">
                      {Object.entries(staff.potrzeby).map(([key, value]) => {
                        let label = '';
                        switch(key) {
                          case 'uznanie': label = 'Uznanie'; break;
                          case 'rozwoj': label = 'Rozwój'; break;
                          case 'stabilizacja': label = 'Stabilizacja'; break;
                          case 'autonomia': label = 'Autonomia'; break;
                          case 'relacjeSpoleczne': label = 'Relacje'; break;
                          default: label = key;
                        }
                        
                        return (
                          <div key={key}>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs">{label}</span>
                              <span className="text-xs font-medium">{value}/100</span>
                            </div>
                            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${value >= 70 ? 'bg-green-500' : value >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${value}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Przypisane projekty */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-md font-bold mb-3">Przypisane projekty</h3>
                
                <p className="text-sm text-gray-500 italic">Brak przypisanych projektów</p>
              </div>
              
              {/* Akcje */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-md font-bold mb-3">Akcje</h3>
                
                <div className="space-y-2">
                  <button 
                    onClick={() => onTrain && onTrain(staff)}
                    className="w-full flex items-center justify-center py-2 px-4 bg-blue-100 text-blue-700 rounded border border-blue-200 hover:bg-blue-200"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Wyślij na szkolenie
                  </button>
                  
                  <button 
                    onClick={() => onFire && onFire(staff)}
                    className="w-full flex items-center justify-center py-2 px-4 bg-red-100 text-red-700 rounded border border-red-200 hover:bg-red-200"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Zwolnij pracownika
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailsModal; 