import React, { useState, useMemo } from 'react';
import { translateStaffType, translateStaffLevel } from '../../utils/translators';

/**
 * Komponent wyświetlający listę pracowników
 * @param {Object} props - Właściwości komponentu
 * @param {Array} props.employees - Lista pracowników
 * @param {Function} props.onSelectEmployee - Funkcja wywoływana po wybraniu pracownika
 * @param {string} props.selectedEmployeeId - ID aktualnie wybranego pracownika
 */
const EmployeesList = ({ employees, onSelectEmployee, selectedEmployeeId }) => {
  const [filterType, setFilterType] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  // Filtrowanie i sortowanie pracowników
  const filteredEmployees = useMemo(() => {
    let result = [...employees];
    
    // Filtrowanie po typie
    if (filterType !== 'all') {
      result = result.filter(emp => emp.typeShort === filterType);
    }
    
    // Filtrowanie po poziomie
    if (filterLevel !== 'all') {
      result = result.filter(emp => emp.level === filterLevel);
    }
    
    // Sortowanie
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.typeShort.localeCompare(b.typeShort);
        case 'level':
          return a.level.localeCompare(b.level);
        case 'skill':
          return b.skill - a.skill;
        case 'experience':
          return b.experience - a.experience;
        default:
          return 0;
      }
    });
    
    return result;
  }, [employees, filterType, filterLevel, sortBy]);
  
  // Obliczanie poziomów doświadczenia na podstawie specjalizacji
  const calculateExperienceLevel = (employee) => {
    if (employee.experience < 3000) return 'Początkujący';
    if (employee.experience < 8000) return 'Doświadczony';
    return 'Ekspert';
  };
  
  return (
    <div className="hr-employees-list">
      <div className="hr-employees-list-header">
        Pracownicy ({filteredEmployees.length})
      </div>
      
      <div className="hr-employees-list-filters">
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Wszyscy</option>
          <option value="scout">Dzierżawcy</option>
          <option value="developer">Developerzy</option>
          <option value="lawyer">Prawnicy</option>
          <option value="envSpecialist">Spec. środowiskowi</option>
          <option value="lobbyist">Lobbyści</option>
        </select>
        
        <select 
          value={filterLevel} 
          onChange={(e) => setFilterLevel(e.target.value)}
        >
          <option value="all">Wszystkie poziomy</option>
          <option value="junior">Początkujący</option>
          <option value="mid">Doświadczeni</option>
          <option value="senior">Eksperci</option>
        </select>
        
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Sortuj: Nazwa</option>
          <option value="type">Sortuj: Typ</option>
          <option value="level">Sortuj: Poziom</option>
          <option value="skill">Sortuj: Umiejętności</option>
          <option value="experience">Sortuj: Doświadczenie</option>
        </select>
      </div>
      
      <div className="hr-employees-items">
        {filteredEmployees.length === 0 ? (
          <div className="hr-no-employees">
            Brak pracowników spełniających kryteria
          </div>
        ) : (
          filteredEmployees.map(employee => (
            <div 
              key={employee.id}
              className={`hr-employee-item ${selectedEmployeeId === employee.id ? 'selected' : ''}`}
              onClick={() => onSelectEmployee(employee)}
            >
              <div className="hr-employee-name">{employee.name}</div>
              <div className="hr-employee-info">
                <span>{translateStaffType(employee.typeShort)}</span>
                <span>{translateStaffLevel(employee.level)}</span>
              </div>
              <div className="hr-employee-info">
                <span>Umiejętność: {employee.skill}/10</span>
                <span>Doświadczenie: {calculateExperienceLevel(employee)}</span>
              </div>
              {employee.specialization && (
                <div className="hr-employee-specialization">
                  {employee.specialization}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmployeesList; 