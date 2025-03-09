import React, { useState, useMemo } from 'react';
import { translateStaffType, translateStaffLevel } from '../../utils/translators';

/**
 * Komponent centrum szkoleń
 * @param {Object} props - Właściwości komponentu
 * @param {Array} props.employees - Lista pracowników
 * @param {Object} props.staffManagement - Hook do zarządzania pracownikami
 * @param {Object} props.gameState - Stan gry
 */
const TrainingCenter = ({ employees, staffManagement, gameState }) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedTraining, setSelectedTraining] = useState('skill');
  const [filterType, setFilterType] = useState('all');
  
  // Filtrowanie pracowników
  const filteredEmployees = useMemo(() => {
    if (filterType === 'all') return employees;
    return employees.filter(emp => emp.typeShort === filterType);
  }, [employees, filterType]);
  
  // Aktualnie wybrany pracownik
  const selectedEmployee = useMemo(() => {
    return employees.find(emp => emp.id === selectedEmployeeId) || null;
  }, [employees, selectedEmployeeId]);
  
  // Typy szkoleń w zależności od typu pracownika
  const getAvailableTrainings = (employee) => {
    if (!employee) return [];
    
    const basicTrainings = [
      { id: 'skill', name: 'Rozwój umiejętności', description: 'Zwiększa ogólny poziom umiejętności pracownika.', cost: 5000 * (employee.skill / 2) },
      { id: 'morale', name: 'Budowanie morale', description: 'Zwiększa morale i zaangażowanie pracownika.', cost: 3000 }
    ];
    
    // Specjalne szkolenia dla developerów
    if (employee.typeShort === 'developer') {
      const techTrainings = [
        { id: 'tech_pv', name: 'Technologia PV', description: 'Pogłębiona wiedza o technologii fotowoltaicznej.', cost: 8000 },
        { id: 'tech_wind', name: 'Technologia wiatrowa', description: 'Specjalistyczna wiedza o turbinach wiatrowych.', cost: 10000 },
        { id: 'tech_bess', name: 'Magazyny energii', description: 'Specjalistyczna wiedza o magazynach energii.', cost: 12000 },
        { id: 'tech_hybrid', name: 'Systemy hybrydowe', description: 'Wiedza o łączeniu różnych technologii OZE.', cost: 15000 }
      ];
      return [...basicTrainings, ...techTrainings];
    }
    
    // Specjalne szkolenia dla dzierżawców
    if (employee.typeShort === 'scout') {
      const scoutTrainings = [
        { id: 'negotiation', name: 'Techniki negocjacyjne', description: 'Zwiększa skuteczność w negocjacjach z rolnikami.', cost: 7000 },
        { id: 'land_evaluation', name: 'Ocena gruntów', description: 'Lepsza ocena wartości i potencjału gruntów.', cost: 6000 }
      ];
      return [...basicTrainings, ...scoutTrainings];
    }
    
    // Specjalne szkolenia dla prawników
    if (employee.typeShort === 'lawyer') {
      const lawyerTrainings = [
        { id: 'energy_law', name: 'Prawo energetyczne', description: 'Pogłębiona wiedza o prawie energetycznym.', cost: 9000 },
        { id: 'env_regulations', name: 'Regulacje środowiskowe', description: 'Pogłębiona wiedza o przepisach ochrony środowiska.', cost: 8000 }
      ];
      return [...basicTrainings, ...lawyerTrainings];
    }
    
    // Specjalne szkolenia dla specjalistów środowiskowych
    if (employee.typeShort === 'envSpecialist') {
      const envTrainings = [
        { id: 'env_assessment', name: 'Oceny oddziaływania', description: 'Zaawansowane techniki oceny wpływu na środowisko.', cost: 8000 },
        { id: 'nature_protection', name: 'Ochrona przyrody', description: 'Specjalistyczna wiedza o obszarach chronionych.', cost: 7000 }
      ];
      return [...basicTrainings, ...envTrainings];
    }
    
    // Specjalne szkolenia dla lobbystów
    if (employee.typeShort === 'lobbyist') {
      const lobbyTrainings = [
        { id: 'public_relations', name: 'Relacje publiczne', description: 'Techniki budowania pozytywnych relacji.', cost: 6000 },
        { id: 'community_management', name: 'Zarządzanie społecznością', description: 'Sposoby angażowania lokalnych społeczności.', cost: 7000 }
      ];
      return [...basicTrainings, ...lobbyTrainings];
    }
    
    return basicTrainings;
  };
  
  // Dostępne szkolenia dla wybranego pracownika
  const availableTrainings = useMemo(() => {
    return getAvailableTrainings(selectedEmployee);
  }, [selectedEmployee]);
  
  // Aktualnie wybrane szkolenie
  const selectedTrainingInfo = useMemo(() => {
    return availableTrainings.find(t => t.id === selectedTraining) || null;
  }, [availableTrainings, selectedTraining]);
  
  // Obsługa rozpoczęcia szkolenia
  const handleStartTraining = () => {
    if (!selectedEmployee || !selectedTrainingInfo) return;
    
    // Implementacja logiki szkolenia poprzez hook staffManagement
    staffManagement.trainStaff(
      selectedEmployee.typeShort, 
      selectedEmployee.id, 
      selectedTraining
    );
  };
  
  return (
    <div className="training-center">
      <h3>Centrum szkoleń</h3>
      <p className="training-description">
        Rozwijaj umiejętności swoich pracowników poprzez specjalistyczne szkolenia. 
        Każde szkolenie zwiększa poziom umiejętności i doświadczenie pracownika.
      </p>
      
      <div className="training-filters">
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Wszyscy pracownicy</option>
          <option value="scout">Dzierżawcy</option>
          <option value="developer">Developerzy</option>
          <option value="lawyer">Prawnicy</option>
          <option value="envSpecialist">Spec. środowiskowi</option>
          <option value="lobbyist">Lobbyści</option>
        </select>
      </div>
      
      <div className="training-grid">
        <div className="employees-for-training">
          <h4>Wybierz pracownika do szkolenia</h4>
          
          {filteredEmployees.length === 0 ? (
            <div className="no-employees-message">
              Brak pracowników spełniających kryteria
            </div>
          ) : (
            <div className="training-employees-list">
              {filteredEmployees.map(employee => (
                <div 
                  key={employee.id}
                  className={`training-employee-item ${selectedEmployeeId === employee.id ? 'selected' : ''}`}
                  onClick={() => setSelectedEmployeeId(employee.id)}
                >
                  <div className="training-employee-name">{employee.name}</div>
                  <div className="training-employee-info">
                    <span>{translateStaffType(employee.typeShort)}</span>
                    <span>Poziom: {employee.skill}/10</span>
                  </div>
                  <div className="training-employee-exp">
                    Doświadczenie: {employee.experience} p.d.
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="training-options">
          {selectedEmployee ? (
            <>
              <h4>Dostępne szkolenia</h4>
              
              <div className="training-types-list">
                {availableTrainings.map(training => (
                  <div 
                    key={training.id}
                    className={`training-type-item ${selectedTraining === training.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTraining(training.id)}
                  >
                    <div className="training-type-name">{training.name}</div>
                    <div className="training-type-cost">{training.cost.toLocaleString()} PLN</div>
                  </div>
                ))}
              </div>
              
              {selectedTrainingInfo && (
                <div className="training-details">
                  <h5>{selectedTrainingInfo.name}</h5>
                  <p>{selectedTrainingInfo.description}</p>
                  <div className="training-cost">
                    Koszt: {selectedTrainingInfo.cost.toLocaleString()} PLN
                  </div>
                  
                  <div className="training-benefits">
                    <div className="training-benefit-title">Korzyści:</div>
                    
                    {selectedTraining === 'skill' && (
                      <div className="training-benefit-item">
                        • Wzrost umiejętności o 1 punkt
                      </div>
                    )}
                    
                    {selectedTraining === 'morale' && (
                      <div className="training-benefit-item">
                        • Wzrost morale o 20 punktów
                      </div>
                    )}
                    
                    {selectedTraining.startsWith('tech_') && (
                      <>
                        <div className="training-benefit-item">
                          • Dodatkowe doświadczenie w technologii
                        </div>
                        <div className="training-benefit-item">
                          • Szybszy rozwój projektów tej technologii
                        </div>
                      </>
                    )}
                    
                    {selectedTraining === 'negotiation' && (
                      <div className="training-benefit-item">
                        • Wyższe szanse na pozyskanie gruntów
                      </div>
                    )}
                    
                    {selectedTraining === 'land_evaluation' && (
                      <div className="training-benefit-item">
                        • Lepsza ocena potencjału gruntów
                      </div>
                    )}
                    
                    <div className="training-benefit-item">
                      • Wzrost doświadczenia zawodowego
                    </div>
                  </div>
                  
                  <button 
                    className="start-training-button"
                    onClick={handleStartTraining}
                  >
                    Rozpocznij szkolenie
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="select-employee-prompt">
              Wybierz pracownika z listy, aby zobaczyć dostępne szkolenia
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingCenter; 