import React, { useState, useEffect } from 'react';
import { usePlayerContext } from '../../store/PlayerContext';
import { useGameContext } from '../../store/GameContext';
import { translateStaffType, translateStaffLevel } from '../../utils/translators';
import useStaffManagement from '../../hooks/useStaffManagement';
import './HRSystem.css';

// Komponenty
import EmployeesList from './EmployeesList';
import EmployeeDetails from './EmployeeDetails';
import CompanyUpgrades from './CompanyUpgrades';
import TrainingCenter from './TrainingCenter';
import EmploymentCenter from './EmploymentCenter';

/**
 * Komponent główny systemu HR
 */
const HRSystem = () => {
  const { state: playerState } = usePlayerContext();
  const { state: gameState } = useGameContext();
  const staffManagement = useStaffManagement();
  
  const [activeTab, setActiveTab] = useState('employees');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  
  // Przygotowanie danych o wszystkich pracownikach
  const getAllEmployees = () => {
    const allEmployees = [];
    const staffTypes = ['scouts', 'developers', 'lawyers', 'envSpecialists', 'lobbyists'];
    
    staffTypes.forEach(type => {
      if (playerState.staff[type]) {
        playerState.staff[type].forEach(employee => {
          allEmployees.push({
            ...employee,
            typePlural: type,
            typeShort: type.endsWith('s') ? type.slice(0, -1) : type
          });
        });
      }
    });
    
    return allEmployees;
  };
  
  // Obsługa wyboru pracownika
  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setSelectedType(employee.typeShort);
  };
  
  return (
    <div className="hr-system-container">
      <div className="hr-system-header">
        <h2>System zarządzania zasobami ludzkimi</h2>
        <div className="hr-system-tabs">
          <button 
            className={activeTab === 'employees' ? 'active' : ''} 
            onClick={() => setActiveTab('employees')}
          >
            Pracownicy
          </button>
          <button 
            className={activeTab === 'training' ? 'active' : ''} 
            onClick={() => setActiveTab('training')}
          >
            Szkolenia
          </button>
          <button 
            className={activeTab === 'upgrades' ? 'active' : ''} 
            onClick={() => setActiveTab('upgrades')}
          >
            Ulepszenia firmy
          </button>
          <button 
            className={activeTab === 'employment' ? 'active' : ''} 
            onClick={() => setActiveTab('employment')}
          >
            Zatrudnienie
          </button>
        </div>
      </div>
      
      <div className="hr-system-content">
        {activeTab === 'employees' && (
          <div className="hr-employees-view">
            <EmployeesList 
              employees={getAllEmployees()} 
              onSelectEmployee={handleEmployeeSelect}
              selectedEmployeeId={selectedEmployee?.id}
            />
            
            {selectedEmployee && (
              <EmployeeDetails 
                employee={selectedEmployee} 
                staffType={selectedType}
                staffManagement={staffManagement}
                gameState={gameState}
              />
            )}
          </div>
        )}
        
        {activeTab === 'training' && (
          <TrainingCenter 
            employees={getAllEmployees()}
            staffManagement={staffManagement}
            gameState={gameState}
          />
        )}
        
        {activeTab === 'upgrades' && (
          <CompanyUpgrades 
            playerState={playerState}
            gameState={gameState}
          />
        )}
        
        {activeTab === 'employment' && (
          <EmploymentCenter 
            staffManagement={staffManagement}
            gameState={gameState}
            playerState={playerState}
          />
        )}
      </div>
    </div>
  );
};

export default HRSystem; 