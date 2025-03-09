import React, { useState } from 'react';
import { usePlayerContext } from "../../store/PlayerContext";
import { useGameContext } from "../../store/GameContext";
import { translateStaffType, translateStaffLevel } from "../../utils/translators";
import useStaffManagement from "../../hooks/useStaffManagement";
import Button from "../ui/Button";
import { Users, Briefcase, Award, UserPlus, Filter, Search, ArrowUpDown } from "lucide-react";

const StaffManagement = ({ openStaffDetails }) => {
  const { state: player } = usePlayerContext();
  const { showNotification } = useGameContext();
  const staffManagement = useStaffManagement();
  
  // Stan filtrów i sortowania
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  
  // Wszystkie typy personelu
  const staffTypes = [
    { id: "scouts", name: "Pozyskiwacze", icon: <Users className="h-4 w-4" /> },
    { id: "developers", name: "Developerzy", icon: <Briefcase className="h-4 w-4" /> },
    { id: "lawyers", name: "Prawnicy", icon: <Award className="h-4 w-4" /> },
    { id: "envSpecialists", name: "Specjaliści ds. środowiska", icon: <Award className="h-4 w-4" /> },
    { id: "lobbyists", name: "Lobbyści", icon: <Award className="h-4 w-4" /> },
  ];
  
  // Poziomy pracowników
  const staffLevels = [
    { id: "junior", name: "Junior", cost: 1 },
    { id: "mid", name: "Mid", cost: 1.5 },
    { id: "senior", name: "Senior", cost: 2.5 },
  ];
  
  // Stan modalu zatrudniania
  const [hiringModalOpen, setHiringModalOpen] = useState(false);
  const [selectedHiringType, setSelectedHiringType] = useState(null);
  const [selectedHiringLevel, setSelectedHiringLevel] = useState("junior");
  
  // Pobieramy wszystkich pracowników
  const getAllStaff = () => {
    return Object.entries(player.staff).flatMap(([type, staffList]) => 
      staffList.map(staff => ({
        ...staff,
        staffType: type
      }))
    );
  };
  
  // Filtrujemy pracowników
  const getFilteredStaff = () => {
    let staff = getAllStaff();
    
    // Filtrujemy według typu
    if (filter !== "all") {
      staff = staff.filter(s => s.staffType === filter);
    }
    
    // Filtrujemy według wyszukiwania
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      staff = staff.filter(s => 
        s.name.toLowerCase().includes(query) ||
        (s.specialization && s.specialization.toLowerCase().includes(query))
      );
    }
    
    // Sortujemy
    staff.sort((a, b) => {
      let aValue, bValue;
      
      switch(sortBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "skill":
          aValue = a.skill;
          bValue = b.skill;
          break;
        case "experience":
          aValue = a.experience;
          bValue = b.experience;
          break;
        case "salary":
          aValue = a.salary;
          bValue = b.salary;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return staff;
  };
  
  // Obliczamy statystyki personelu
  const calculateStaffStats = () => {
    const allStaff = getAllStaff();
    
    return {
      totalStaff: allStaff.length,
      totalSalary: allStaff.reduce((sum, s) => sum + (s.salary || 0), 0),
      averageSkill: allStaff.length > 0 
        ? Math.round(allStaff.reduce((sum, s) => sum + s.skill, 0) / allStaff.length * 10) / 10
        : 0,
      staffByType: Object.fromEntries(
        Object.entries(player.staff).map(([type, list]) => [type, list.length])
      ),
      staffByLevel: allStaff.reduce((acc, s) => {
        acc[s.level] = (acc[s.level] || 0) + 1;
        return acc;
      }, {})
    };
  };
  
  // Statystyki personelu
  const staffStats = calculateStaffStats();
  
  // Zatrudnianie pracownika
  const handleHire = (type, level) => {
    try {
      staffManagement.hireStaff(type, level);
      setHiringModalOpen(false);
    } catch (error) {
      showNotification(error.message || "Nie udało się zatrudnić pracownika", "error");
    }
  };
  
  // Renderuje pojedynczą kartę pracownika
  const renderStaffCard = (staff) => {
    const staffTypeSingular = staff.staffType.endsWith('s') 
      ? staff.staffType.slice(0, -1) 
      : staff.staffType;
    
    return (
      <div 
        key={staff.id}
        className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => openStaffDetails(staff.id, staffTypeSingular)}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold">{staff.name}</h3>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {translateStaffType(staffTypeSingular)}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div>
            <span className="text-gray-600">Poziom:</span>
            <span className="ml-1">{translateStaffLevel(staff.level)}</span>
          </div>
          <div>
            <span className="text-gray-600">Umiejętność:</span>
            <span className="ml-1 font-medium">{staff.skill}/10</span>
          </div>
          <div>
            <span className="text-gray-600">Doświadczenie:</span>
            <span className="ml-1">{staff.experience} pkt</span>
          </div>
          <div>
            <span className="text-gray-600">Wynagrodzenie:</span>
            <span className="ml-1">{staff.salary.toLocaleString()} PLN</span>
          </div>
        </div>
        
        {staff.specialization && (
          <div className="mt-2 text-sm">
            <span className="text-gray-600">Specjalizacja:</span>
            <span className="ml-1 font-medium">{staff.specialization}</span>
          </div>
        )}
        
        {staff.assignedProject && (
          <div className="mt-2 bg-blue-50 p-2 rounded text-sm">
            <span className="text-blue-800">Przypisany do projektu</span>
          </div>
        )}
      </div>
    );
  };
  
  // Renderuje modal zatrudniania
  const renderHiringModal = () => {
    if (!hiringModalOpen) return null;
    
    // Sprawdzamy koszt zatrudnienia
    const getHiringCost = (type, level) => {
      const baseCost = {
        scout: 15000,
        developer: 25000,
        lawyer: 30000,
        envSpecialist: 20000,
        lobbyist: 40000,
      }[type] || 20000;
      
      const levelMultiplier = {
        junior: 1,
        mid: 1.5,
        senior: 2.2
      }[level] || 1;
      
      return Math.round(baseCost * levelMultiplier);
    };
    
    const hiringCost = selectedHiringType 
      ? getHiringCost(selectedHiringType, selectedHiringLevel)
      : 0;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Zatrudnij nowego pracownika</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Typ pracownika:</label>
            <div className="grid grid-cols-2 gap-2">
              {staffTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedHiringType(type.id.endsWith('s') ? type.id.slice(0, -1) : type.id)}
                  className={`p-2 border rounded flex items-center ${
                    selectedHiringType === (type.id.endsWith('s') ? type.id.slice(0, -1) : type.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {type.icon}
                  <span className="ml-2">{type.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Poziom doświadczenia:</label>
            <div className="grid grid-cols-3 gap-2">
              {staffLevels.map(level => (
                <button
                  key={level.id}
                  onClick={() => setSelectedHiringLevel(level.id)}
                  className={`p-2 border rounded ${
                    selectedHiringLevel === level.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {level.name}
                </button>
              ))}
            </div>
          </div>
          
          {selectedHiringType && (
            <div className="bg-gray-50 p-3 rounded mb-4">
              <div className="flex justify-between mb-1">
                <span className="font-medium">Koszt zatrudnienia:</span>
                <span className="font-bold">{hiringCost.toLocaleString()} PLN</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Miesięczne wynagrodzenie:</span>
                <span className="font-bold">
                  {Math.round(hiringCost * 0.04).toLocaleString()} PLN
                </span>
              </div>
            </div>
          )}
          
          <div className="flex justify-between">
            <Button
              variant="secondary"
              onClick={() => setHiringModalOpen(false)}
            >
              Anuluj
            </Button>
            
            <Button
              variant="primary"
              disabled={!selectedHiringType}
              onClick={() => handleHire(selectedHiringType, selectedHiringLevel)}
            >
              Zatrudnij
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  // Renderujemy komponent zarządzania personelem
  return (
    <div>
      <div className="bg-white p-5 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Zarządzanie personelem</h2>
          
          <Button
            variant="primary"
            icon={<UserPlus className="h-4 w-4" />}
            onClick={() => {
              setSelectedHiringType(null);
              setSelectedHiringLevel("junior");
              setHiringModalOpen(true);
            }}
          >
            Zatrudnij pracownika
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-sm text-blue-800">Łączna liczba pracowników</div>
            <div className="text-xl font-bold">{staffStats.totalStaff}</div>
          </div>
          
          <div className="bg-green-50 p-3 rounded">
            <div className="text-sm text-green-800">Łączne wynagrodzenie miesięczne</div>
            <div className="text-xl font-bold">{staffStats.totalSalary.toLocaleString()} PLN</div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded">
            <div className="text-sm text-purple-800">Średni poziom umiejętności</div>
            <div className="text-xl font-bold">{staffStats.averageSkill}/10</div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 border-t pt-4">
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-sm text-gray-700">Filtruj:</span>
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="all">Wszyscy pracownicy</option>
            {staffTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
          
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj..."
              className="text-sm border rounded pl-8 pr-2 py-1 w-40"
            />
            <Search className="h-4 w-4 text-gray-400 absolute left-2 top-1.5" />
          </div>
          
          <div className="flex items-center ml-auto">
            <ArrowUpDown className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-sm text-gray-700">Sortuj:</span>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="name">Imię i nazwisko</option>
            <option value="skill">Umiejętności</option>
            <option value="experience">Doświadczenie</option>
            <option value="salary">Wynagrodzenie</option>
          </select>
          
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="asc">Rosnąco</option>
            <option value="desc">Malejąco</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getFilteredStaff().map(renderStaffCard)}
        
        {getFilteredStaff().length === 0 && (
          <div className="col-span-full bg-gray-50 p-4 rounded text-center text-gray-600">
            {filter === "all" && searchQuery === ""
              ? "Nie masz jeszcze żadnych pracowników. Zatrudnij kogoś, aby rozpocząć!"
              : "Brak pracowników spełniających kryteria wyszukiwania."}
          </div>
        )}
      </div>
      
      {renderHiringModal()}
    </div>
  );
};

export default StaffManagement; 