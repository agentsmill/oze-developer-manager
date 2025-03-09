import React, { useState } from 'react';
import { translateStaffType, translateStaffLevel } from '../../utils/translators';
import { POSITIVE_TRAITS, NEUTRAL_TRAITS, NEGATIVE_TRAITS } from '../../models/Staff';

/**
 * Komponent wyświetlający szczegóły pracownika
 * @param {Object} props - Właściwości komponentu
 * @param {Object} props.employee - Pracownik
 * @param {string} props.staffType - Typ pracownika
 * @param {Object} props.staffManagement - Hook do zarządzania pracownikami
 * @param {Object} props.gameState - Stan gry
 */
const EmployeeDetails = ({ employee, staffType, staffManagement, gameState }) => {
  const [showConfirmFire, setShowConfirmFire] = useState(false);
  
  if (!employee) return null;
  
  // Funkcje zarządzania pracownikiem
  const handleFire = () => {
    if (showConfirmFire) {
      staffManagement.fireStaff(employee.typeShort, employee.id);
      setShowConfirmFire(false);
    } else {
      setShowConfirmFire(true);
    }
  };
  
  const handleTrain = () => {
    // Inicjuj szkolenie pracownika - to będzie zaimplementowane w centrum szkoleń
  };
  
  // Oblicz staż pracy w turach
  const calculateTenure = () => {
    return gameState.turn - employee.hiredOn;
  };
  
  // Znajdź szczegóły dotyczące cech pracownika
  const getTraitDetails = (traitId) => {
    const allTraits = [...POSITIVE_TRAITS, ...NEUTRAL_TRAITS, ...NEGATIVE_TRAITS];
    return allTraits.find(t => t.id === traitId) || { label: traitId, description: '' };
  };
  
  // Zdobyte doświadczenie w technologii (tylko dla Developerów)
  const renderTechnologyExperience = () => {
    if (employee.typeShort !== 'developer') return null;
    
    // Jeśli nie ma historii technologii, zwróć komunikat
    if (!employee.technologyExperience || Object.keys(employee.technologyExperience).length === 0) {
      return (
        <div className="hr-employee-section">
          <h4>Doświadczenie w technologiach</h4>
          <div className="hr-no-data">Brak doświadczenia w konkretnych technologiach</div>
        </div>
      );
    }
    
    return (
      <div className="hr-employee-section">
        <h4>Doświadczenie w technologiach</h4>
        {Object.entries(employee.technologyExperience).map(([tech, exp]) => (
          <div key={tech} className="hr-stat-row">
            <div className="hr-stat-label">{tech}</div>
            <div className="hr-stat-value">{exp} p.d.</div>
            <div className="hr-progress-bar">
              <div 
                className="hr-progress-value" 
                style={{ width: `${Math.min(100, exp / 50)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Doświadczenie dzierżawcy w pozyskiwaniu gruntów
  const renderLessorExperience = () => {
    if (employee.typeShort !== 'scout') return null;
    
    // Jeśli nie ma informacji o pozyskanych gruntach
    if (!employee.acquiredLands || employee.acquiredLands === 0) {
      return (
        <div className="hr-employee-section">
          <h4>Doświadczenie dzierżawcy</h4>
          <div className="hr-no-data">Jeszcze nie pozyskał żadnych gruntów</div>
        </div>
      );
    }
    
    return (
      <div className="hr-employee-section">
        <h4>Doświadczenie dzierżawcy</h4>
        <div className="hr-stat-row">
          <div className="hr-stat-label">Pozyskane grunty</div>
          <div className="hr-stat-value">{employee.acquiredLands}</div>
        </div>
        <div className="hr-stat-row">
          <div className="hr-stat-label">Łączna powierzchnia</div>
          <div className="hr-stat-value">{employee.acquiredArea || 0} ha</div>
        </div>
      </div>
    );
  };
  
  // Historia pracownika
  const renderHistory = () => {
    if (!employee.historia || employee.historia.length === 0) {
      return (
        <div className="hr-no-data">Brak historii wydarzeń</div>
      );
    }
    
    return (
      <div className="hr-history-list">
        {employee.historia.map((event, index) => (
          <div key={index} className="hr-history-item">
            <div className="hr-history-date">
              {new Date(event.data).toLocaleDateString('pl-PL')} (tura {gameState.turn})
            </div>
            <div className="hr-history-description">
              {event.opis}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Inicjał imienia do awatara
  const getInitials = () => {
    return employee.name.charAt(0);
  };
  
  return (
    <div className="hr-employee-details">
      <div className="hr-employee-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="hr-employee-avatar">
            {getInitials()}
          </div>
          <div className="hr-employee-title">
            <h3>{employee.name}</h3>
            <div className="hr-employee-job">
              {translateStaffLevel(employee.level)} {translateStaffType(employee.typeShort)}
            </div>
            <div>
              {employee.specialization && (
                <span className="hr-specialization">
                  Specjalizacja: {employee.specialization}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="hr-employee-actions">
          <button className="train-btn" onClick={handleTrain}>
            Szkolenie
          </button>
          <button className="fire-btn" onClick={handleFire}>
            {showConfirmFire ? 'Potwierdź zwolnienie' : 'Zwolnij'}
          </button>
        </div>
      </div>
      
      <div className="hr-employee-grid">
        <div>
          <div className="hr-employee-section">
            <h4>Statystyki</h4>
            <div className="hr-stat-row">
              <div className="hr-stat-label">Staż pracy</div>
              <div className="hr-stat-value">{calculateTenure()} tur</div>
            </div>
            <div className="hr-stat-row">
              <div className="hr-stat-label">Umiejętności</div>
              <div className="hr-stat-value">{employee.skill}/10</div>
              <div className="hr-progress-bar">
                <div 
                  className={`hr-progress-value ${employee.skill > 7 ? 'high' : employee.skill > 4 ? 'medium' : 'low'}`}
                  style={{ width: `${employee.skill * 10}%` }}
                />
              </div>
            </div>
            <div className="hr-stat-row">
              <div className="hr-stat-label">Doświadczenie</div>
              <div className="hr-stat-value">{employee.experience} p.d.</div>
              <div className="hr-progress-bar">
                <div 
                  className="hr-progress-value"
                  style={{ width: `${Math.min(100, employee.experience / 100)}%` }}
                />
              </div>
            </div>
            <div className="hr-stat-row">
              <div className="hr-stat-label">Energia</div>
              <div className="hr-stat-value">{employee.energy}/100</div>
              <div className="hr-progress-bar">
                <div 
                  className={`hr-progress-value ${employee.energy > 70 ? 'high' : employee.energy > 40 ? 'medium' : 'low'}`}
                  style={{ width: `${employee.energy}%` }}
                />
              </div>
            </div>
            <div className="hr-stat-row">
              <div className="hr-stat-label">Morale</div>
              <div className="hr-stat-value">{employee.morale}/100</div>
              <div className="hr-progress-bar">
                <div 
                  className={`hr-progress-value ${employee.morale > 70 ? 'high' : employee.morale > 40 ? 'medium' : 'low'}`}
                  style={{ width: `${employee.morale}%` }}
                />
              </div>
            </div>
            <div className="hr-stat-row">
              <div className="hr-stat-label">Wynagrodzenie</div>
              <div className="hr-stat-value">{employee.salary.toLocaleString()} PLN / miesiąc</div>
            </div>
          </div>
          
          {renderTechnologyExperience()}
          {renderLessorExperience()}
        </div>
        
        <div>
          <div className="hr-employee-section">
            <h4>Cechy charakteru</h4>
            {employee.traits && employee.traits.length > 0 ? (
              employee.traits.map(traitId => {
                const trait = getTraitDetails(traitId);
                return (
                  <div key={traitId} className="hr-trait-item">
                    <div className="hr-trait-name">{trait.label}</div>
                    <div className="hr-trait-description">{trait.description}</div>
                  </div>
                );
              })
            ) : (
              <div className="hr-no-data">Brak zdefiniowanych cech charakteru</div>
            )}
          </div>
          
          <div className="hr-employee-section">
            <h4>Potrzeby</h4>
            {employee.potrzeby ? (
              <>
                <div className="hr-stat-row">
                  <div className="hr-stat-label">Uznanie</div>
                  <div className="hr-stat-value">{employee.potrzeby.uznanie}/100</div>
                  <div className="hr-progress-bar">
                    <div 
                      className="hr-progress-value"
                      style={{ width: `${employee.potrzeby.uznanie}%` }}
                    />
                  </div>
                </div>
                <div className="hr-stat-row">
                  <div className="hr-stat-label">Rozwój</div>
                  <div className="hr-stat-value">{employee.potrzeby.rozwoj}/100</div>
                  <div className="hr-progress-bar">
                    <div 
                      className="hr-progress-value"
                      style={{ width: `${employee.potrzeby.rozwoj}%` }}
                    />
                  </div>
                </div>
                <div className="hr-stat-row">
                  <div className="hr-stat-label">Stabilizacja</div>
                  <div className="hr-stat-value">{employee.potrzeby.stabilizacja}/100</div>
                  <div className="hr-progress-bar">
                    <div 
                      className="hr-progress-value"
                      style={{ width: `${employee.potrzeby.stabilizacja}%` }}
                    />
                  </div>
                </div>
                <div className="hr-stat-row">
                  <div className="hr-stat-label">Autonomia</div>
                  <div className="hr-stat-value">{employee.potrzeby.autonomia}/100</div>
                  <div className="hr-progress-bar">
                    <div 
                      className="hr-progress-value"
                      style={{ width: `${employee.potrzeby.autonomia}%` }}
                    />
                  </div>
                </div>
                <div className="hr-stat-row">
                  <div className="hr-stat-label">Relacje społeczne</div>
                  <div className="hr-stat-value">{employee.potrzeby.relacjeSpoleczne}/100</div>
                  <div className="hr-progress-bar">
                    <div 
                      className="hr-progress-value"
                      style={{ width: `${employee.potrzeby.relacjeSpoleczne}%` }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="hr-no-data">Brak zdefiniowanych potrzeb</div>
            )}
          </div>
          
          <div className="hr-employee-section">
            <h4>Historia</h4>
            {renderHistory()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails; 