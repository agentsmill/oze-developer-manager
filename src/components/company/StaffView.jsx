import React, { useState, useEffect } from 'react';
import { usePlayerContext } from '../../store/PlayerContext';
import { useGameContext } from '../../store/GameContext';
import useStaffManagement from '../../hooks/useStaffManagement';
import StaffCard from './StaffCard';
import StaffDetailsModal from './StaffDetailsModal';
import { Users, Search, Filter, PlusCircle, Briefcase, Brain, Heart } from 'lucide-react';
import StaffModel from '../../models/Staff';
import '../../styles/indicators.css';

const StaffView = () => {
  const { state: player, dispatch: playerDispatch } = usePlayerContext();
  const { state: gameState, showNotification } = useGameContext();
  const { hireStaff, fireStaff, trainStaff } = useStaffManagement();
  
  // Stan komponentu
  const [selectedStaffType, setSelectedStaffType] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('skill');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  
  // Pobieramy wszystkich pracowników w jedną tablicę
  const getAllStaff = () => {
    const allStaff = [];
    
    Object.entries(player.staff).forEach(([staffType, staffList]) => {
      if (staffList && staffList.length > 0) {
        staffList.forEach(staff => {
          allStaff.push({
            ...staff,
            staffCategory: staffType.replace(/s$/, '') // usuwamy 's' na końcu (np. scouts -> scout)
          });
        });
      }
    });
    
    return allStaff;
  };
  
  // Filtrowanie pracowników
  const getFilteredStaff = () => {
    let filteredStaff = getAllStaff();
    
    // Filtrowanie po typie
    if (selectedStaffType !== 'all') {
      filteredStaff = filteredStaff.filter(staff => 
        staff.staffCategory === selectedStaffType || staff.type === selectedStaffType
      );
    }
    
    // Filtrowanie po poziomie
    if (selectedLevel !== 'all') {
      filteredStaff = filteredStaff.filter(staff => staff.level === selectedLevel);
    }
    
    // Filtrowanie po zapytaniu
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredStaff = filteredStaff.filter(staff => 
        staff.name.toLowerCase().includes(query) || 
        (staff.specialization && staff.specialization.toLowerCase().includes(query))
      );
    }
    
    // Sortowanie
    filteredStaff.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'skill':
          comparison = (b.skill || 0) - (a.skill || 0);
          break;
        case 'experience':
          comparison = (b.experience || 0) - (a.experience || 0);
          break;
        case 'salary':
          comparison = (b.salary || 0) - (a.salary || 0);
          break;
        case 'morale':
          comparison = (b.morale || 0) - (a.morale || 0);
          break;
        case 'energy':
          comparison = (b.energy || 0) - (a.energy || 0);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? -comparison : comparison;
    });
    
    return filteredStaff;
  };
  
  // Obliczanie statystyk pracowników
  const getStaffStats = () => {
    const allStaff = getAllStaff();
    
    const scoutCount = allStaff.filter(s => s.staffCategory === 'scout').length;
    const developerCount = allStaff.filter(s => s.staffCategory === 'developer').length;
    const specialistCount = allStaff.filter(s => 
      s.staffCategory !== 'scout' && s.staffCategory !== 'developer'
    ).length;
    
    const totalSalaries = allStaff.reduce((sum, staff) => sum + (staff.salary || 0), 0);
    
    const avgSkill = allStaff.length > 0 
      ? allStaff.reduce((sum, staff) => sum + (staff.skill || 0), 0) / allStaff.length 
      : 0;
    
    const avgMorale = allStaff.length > 0 
      ? allStaff.reduce((sum, staff) => sum + (staff.morale || 0), 0) / allStaff.length 
      : 0;
    
    const avgEnergy = allStaff.length > 0 
      ? allStaff.reduce((sum, staff) => sum + (staff.energy || 0), 0) / allStaff.length 
      : 0;
    
    return {
      totalCount: allStaff.length,
      scoutCount,
      developerCount,
      specialistCount,
      totalSalaries,
      avgSkill,
      avgMorale,
      avgEnergy
    };
  };
  
  // Obsługa zwalniania pracownika
  const handleFireStaff = (staff) => {
    if (staff && confirm(`Czy na pewno chcesz zwolnić ${staff.name}?`)) {
      fireStaff(staff.staffCategory, staff.id);
    }
  };
  
  // Obsługa wysyłania na szkolenie
  const handleTrainStaff = (staff) => {
    if (staff) {
      trainStaff(staff.staffCategory, staff.id, 'skill');
    }
  };
  
  // Obsługa szczegółów pracownika
  const handleStaffDetails = (staff) => {
    setSelectedStaff(staff);
    setShowDetailsModal(true);
  };
  
  // Podzielenie pracowników na typy (do kart)
  const staffByType = {
    scouts: getFilteredStaff().filter(s => s.staffCategory === 'scout'),
    developers: getFilteredStaff().filter(s => s.staffCategory === 'developer'),
    specialists: getFilteredStaff().filter(s => 
      s.staffCategory !== 'scout' && s.staffCategory !== 'developer'
    )
  };
  
  // Statystyki pracowników
  const staffStats = getStaffStats();
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Zarządzanie Kadrami</h2>
      <p className="text-gray-600 mb-4">
        Zarządzaj swoimi pracownikami, zatrudniaj nowych, szkolenia i przydzielaj do projektów.
      </p>
      
      {/* Panel statystyk */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Łączna liczba pracowników</div>
              <div className="text-2xl font-bold">{staffStats.totalCount}</div>
            </div>
            <Users className="h-10 w-10 text-blue-500 opacity-40" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Skauci: {staffStats.scoutCount} • Developerzy: {staffStats.developerCount} • Specjaliści: {staffStats.specialistCount}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Miesięczne wynagrodzenia</div>
              <div className="text-2xl font-bold">{staffStats.totalSalaries.toLocaleString()} PLN</div>
            </div>
            <Briefcase className="h-10 w-10 text-green-500 opacity-40" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Średnio na pracownika: {staffStats.totalCount > 0 ? (staffStats.totalSalaries / staffStats.totalCount).toLocaleString() : 0} PLN
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Średnie umiejętności</div>
              <div className="text-2xl font-bold">{staffStats.avgSkill.toFixed(1)}/10</div>
            </div>
            <Brain className="h-10 w-10 text-purple-500 opacity-40" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Skauci: {
              staffByType.scouts.length > 0 
                ? (staffByType.scouts.reduce((sum, s) => sum + (s.skill || 0), 0) / staffByType.scouts.length).toFixed(1) 
                : '0'
            } • 
            Developerzy: {
              staffByType.developers.length > 0 
                ? (staffByType.developers.reduce((sum, s) => sum + (s.skill || 0), 0) / staffByType.developers.length).toFixed(1) 
                : '0'
            }
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Średnie morale zespołu</div>
              <div className="text-2xl font-bold">{staffStats.avgMorale.toFixed(0)}%</div>
            </div>
            <Heart className="h-10 w-10 text-red-500 opacity-40" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Energia zespołu: {staffStats.avgEnergy.toFixed(0)}%
          </div>
        </div>
      </div>
      
      {/* Panel kontrolny */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Filtr typu pracownika */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Typ pracownika</label>
              <select 
                value={selectedStaffType}
                onChange={(e) => setSelectedStaffType(e.target.value)}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="all">Wszyscy</option>
                <option value="scout">Skauci</option>
                <option value="developer">Developerzy</option>
                <option value="lobbyist">Lobbyści</option>
                <option value="lawyer">Prawnicy</option>
                <option value="envSpecialist">Specjaliści środowiskowi</option>
              </select>
            </div>
            
            {/* Filtr poziomu */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Poziom</label>
              <select 
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="all">Wszystkie</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
              </select>
            </div>
            
            {/* Sortowanie */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Sortuj wg</label>
              <div className="flex">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border-l border-t border-b rounded-l px-3 py-1 text-sm"
                >
                  <option value="name">Imię i nazwisko</option>
                  <option value="skill">Umiejętności</option>
                  <option value="experience">Doświadczenie</option>
                  <option value="salary">Wynagrodzenie</option>
                  <option value="morale">Morale</option>
                  <option value="energy">Energia</option>
                </select>
                <button 
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="border rounded-r px-2 bg-gray-100 hover:bg-gray-200"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Wyszukiwarka */}
            <div className="relative">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Szukaj pracownika..."
                className="border rounded pl-9 pr-3 py-1.5 w-64"
              />
              <Search className="h-4 w-4 text-gray-400 absolute top-2 left-3" />
            </div>
            
            {/* Przycisk zatrudniania */}
            <button 
              onClick={() => setShowHireModal(true)}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-1.5"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Zatrudnij pracownika
            </button>
          </div>
        </div>
      </div>
      
      {/* Sekcje pracowników */}
      <div className="space-y-8">
        {/* Skauci */}
        <div>
          <h3 className="text-lg font-bold mb-3 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Skauci - Pozyskiwanie gruntów
            <span className="ml-2 text-sm font-normal text-gray-500">({staffByType.scouts.length})</span>
          </h3>
          
          <p className="text-gray-600 mb-4 text-sm">
            Skauci szukają i negocjują umowy dzierżawy gruntów pod projekty OZE. Doświadczeni skauci przyśpieszają pozyskiwanie gruntów i wynegocjują lepsze ceny.
          </p>
          
          {staffByType.scouts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffByType.scouts.map(staff => (
                <StaffCard 
                  key={staff.id}
                  staff={staff}
                  onFire={handleFireStaff}
                  onTrain={handleTrainStaff}
                  onDetails={handleStaffDetails}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-500 mb-4">Nie masz jeszcze żadnych pozyskiwaczy</p>
              <div className="flex justify-center space-x-3">
                <button 
                  onClick={() => hireStaff('scout', 'junior')}
                  className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Zatrudnij początkującego
                </button>
                <button 
                  onClick={() => hireStaff('scout', 'mid')}
                  className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Zatrudnij doświadczonego
                </button>
                <button 
                  onClick={() => hireStaff('scout', 'senior')}
                  className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Zatrudnij eksperta
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Developerzy */}
        <div>
          <h3 className="text-lg font-bold mb-3 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Developerzy - Zarządzanie projektami
            <span className="ml-2 text-sm font-normal text-gray-500">({staffByType.developers.length})</span>
          </h3>
          
          <p className="text-gray-600 mb-4 text-sm">
            Developerzy zarządzają projektami i przyspieszają proces realizacji. Doświadczeni developerzy zwiększają szanse na powodzenie projektu i redukują ryzyko.
          </p>
          
          {staffByType.developers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffByType.developers.map(staff => (
                <StaffCard 
                  key={staff.id}
                  staff={staff}
                  onFire={handleFireStaff}
                  onTrain={handleTrainStaff}
                  onDetails={handleStaffDetails}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-500 mb-4">Nie masz jeszcze żadnych developerów</p>
              <div className="flex justify-center space-x-3">
                <button 
                  onClick={() => hireStaff('developer', 'junior')}
                  className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Zatrudnij początkującego
                </button>
                <button 
                  onClick={() => hireStaff('developer', 'mid')}
                  className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Zatrudnij doświadczonego
                </button>
                <button 
                  onClick={() => hireStaff('developer', 'senior')}
                  className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Zatrudnij eksperta
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Specjaliści wysokiego szczebla */}
        <div>
          <h3 className="text-lg font-bold mb-3 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Specjaliści wysokiego szczebla
            <span className="ml-2 text-sm font-normal text-gray-500">({staffByType.specialists.length})</span>
          </h3>
          
          <p className="text-gray-600 mb-4 text-sm">
            Specjaliści wysokiego szczebla to kluczowi eksperci, którzy znacząco przyspieszają uzyskiwanie pozwoleń i rozwój projektów.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Prawnicy */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-bold text-md mb-2">Prawnik</h4>
              <p className="text-sm text-gray-600 mb-3">
                Przyspiesza uzyskiwanie warunków zabudowy i decyzji lokalizacyjnych o 30%.
              </p>
              <button 
                onClick={() => hireStaff('lawyer', 'senior')}
                className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Zatrudnij (30 mln zł)
              </button>
            </div>
            
            {/* Specjaliści ds. środowiska */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-bold text-md mb-2">Specjalista ds. środowiska</h4>
              <p className="text-sm text-gray-600 mb-3">
                Przyspiesza uzyskiwanie decyzji środowiskowych o 30% i zmniejsza ryzyko blokad.
              </p>
              <button 
                onClick={() => hireStaff('envSpecialist', 'senior')}
                className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Zatrudnij (25 mln zł)
              </button>
            </div>
            
            {/* Lobbyści */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-bold text-md mb-2">Lobbysta</h4>
              <p className="text-sm text-gray-600 mb-3">
                Wpływa na decyzje lokalne, przyspiesza procesy administracyjne i zwiększa akceptację społeczną.
              </p>
              <div className="flex space-x-2">
                <button 
                  onClick={() => hireStaff('lobbyist', 'junior')}
                  className="flex-1 px-2 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                >
                  Junior (5k zł/m-c)
                </button>
                <button 
                  onClick={() => hireStaff('lobbyist', 'senior')}
                  className="flex-1 px-2 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                >
                  Expert (11k zł/m-c)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal szczegółów pracownika */}
      {showDetailsModal && selectedStaff && (
        <StaffDetailsModal 
          staff={selectedStaff}
          onClose={() => setShowDetailsModal(false)}
          onFire={() => {
            handleFireStaff(selectedStaff);
            setShowDetailsModal(false);
          }}
          onTrain={() => {
            handleTrainStaff(selectedStaff);
            // Nie zamykamy modalu
          }}
        />
      )}
    </div>
  );
};

export default StaffView; 