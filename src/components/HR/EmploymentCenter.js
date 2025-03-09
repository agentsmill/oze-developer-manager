import React, { useState } from 'react';
import { translateStaffType, translateStaffLevel } from '../../utils/translators';

/**
 * Komponent centrum zatrudnienia
 * @param {Object} props - Właściwości komponentu
 * @param {Object} props.staffManagement - Hook do zarządzania pracownikami
 * @param {Object} props.gameState - Stan gry
 * @param {Object} props.playerState - Stan gracza
 */
const EmploymentCenter = ({ staffManagement, gameState, playerState }) => {
  const [selectedType, setSelectedType] = useState('scout');
  const [selectedLevel, setSelectedLevel] = useState('junior');
  
  // Podstawowe wynagrodzenie dla różnych typów pracowników
  const baseSalaries = {
    scout: 2500, // 2.5k zł
    developer: 3000, // 3k zł
    lawyer: 0, // Jednorazowa opłata
    envSpecialist: 0, // Jednorazowa opłata
    lobbyist: 5000 // 5k zł
  };
  
  // Mnożniki pensji w zależności od poziomu
  const salaryMultipliers = {
    junior: 1.0,
    mid: 1.5,
    senior: 2.2
  };
  
  // Koszt jednorazowego wynajęcia specjalistów
  const specialistCosts = {
    lawyer: 30000000, // 30 mln zł
    envSpecialist: 25000000 // 25 mln zł
  };
  
  // Obliczanie wynagrodzenia i kosztu zatrudnienia
  const calculateHiringCost = () => {
    const baseSalary = baseSalaries[selectedType];
    const monthlySalary = Math.floor(baseSalary * salaryMultipliers[selectedLevel]);
    
    // Dla prawników i specjalistów ds. środowiska jest to opłata jednorazowa
    const hireCost = (selectedType === 'lawyer' || selectedType === 'envSpecialist') 
      ? specialistCosts[selectedType]
      : monthlySalary * 2; // Koszt zatrudnienia = 2 miesiące wynagrodzenia
    
    return {
      monthlySalary,
      hireCost
    };
  };
  
  const { monthlySalary, hireCost } = calculateHiringCost();
  
  // Czy gracz ma wystarczające środki
  const canHire = playerState.cash >= hireCost;
  
  // Funkcja zatrudniania pracownika
  const handleHire = () => {
    staffManagement.hireStaff(selectedType, selectedLevel);
  };
  
  return (
    <div className="employment-center">
      <h3>Centrum zatrudnienia</h3>
      <p className="employment-description">
        Zatrudnij nowych pracowników do twojej firmy. Każdy typ specjalisty ma unikalne umiejętności, 
        które przyspieszą rozwój twoich projektów.
      </p>
      
      <div className="employment-grid">
        <div className="employment-options">
          <div className="employment-section">
            <h4>Wybierz stanowisko</h4>
            <div className="employment-types">
              <button 
                className={`emp-type-btn ${selectedType === 'scout' ? 'active' : ''}`}
                onClick={() => setSelectedType('scout')}
              >
                <div className="emp-type-icon">🔍</div>
                <div className="emp-type-name">Dzierżawca</div>
              </button>
              
              <button 
                className={`emp-type-btn ${selectedType === 'developer' ? 'active' : ''}`}
                onClick={() => setSelectedType('developer')}
              >
                <div className="emp-type-icon">🏗️</div>
                <div className="emp-type-name">Developer</div>
              </button>
              
              <button 
                className={`emp-type-btn ${selectedType === 'lawyer' ? 'active' : ''}`}
                onClick={() => setSelectedType('lawyer')}
              >
                <div className="emp-type-icon">⚖️</div>
                <div className="emp-type-name">Prawnik</div>
              </button>
              
              <button 
                className={`emp-type-btn ${selectedType === 'envSpecialist' ? 'active' : ''}`}
                onClick={() => setSelectedType('envSpecialist')}
              >
                <div className="emp-type-icon">🌿</div>
                <div className="emp-type-name">Specjalista ds. środowiska</div>
              </button>
              
              <button 
                className={`emp-type-btn ${selectedType === 'lobbyist' ? 'active' : ''}`}
                onClick={() => setSelectedType('lobbyist')}
              >
                <div className="emp-type-icon">🤝</div>
                <div className="emp-type-name">Lobbysta</div>
              </button>
            </div>
          </div>
          
          <div className="employment-section">
            <h4>Wybierz poziom doświadczenia</h4>
            <div className="employment-levels">
              <button 
                className={`emp-level-btn ${selectedLevel === 'junior' ? 'active' : ''}`}
                onClick={() => setSelectedLevel('junior')}
              >
                <div className="emp-level-name">Początkujący</div>
                <div className="emp-level-desc">Niższy koszt, mniejsze umiejętności (1-3)</div>
              </button>
              
              <button 
                className={`emp-level-btn ${selectedLevel === 'mid' ? 'active' : ''}`}
                onClick={() => setSelectedLevel('mid')}
              >
                <div className="emp-level-name">Doświadczony</div>
                <div className="emp-level-desc">Średni koszt, przyzwoite umiejętności (4-7)</div>
              </button>
              
              <button 
                className={`emp-level-btn ${selectedLevel === 'senior' ? 'active' : ''}`}
                onClick={() => setSelectedLevel('senior')}
              >
                <div className="emp-level-name">Ekspert</div>
                <div className="emp-level-desc">Wyższy koszt, wysokie umiejętności (7-10)</div>
              </button>
            </div>
          </div>
        </div>
        
        <div className="employment-summary">
          <div className="employment-summary-header">
            <h4>Podsumowanie zatrudnienia</h4>
          </div>
          
          <div className="employment-summary-content">
            <div className="summary-item">
              <div className="summary-label">Stanowisko:</div>
              <div className="summary-value">{translateStaffType(selectedType)}</div>
            </div>
            
            <div className="summary-item">
              <div className="summary-label">Poziom:</div>
              <div className="summary-value">{translateStaffLevel(selectedLevel)}</div>
            </div>
            
            {(selectedType !== 'lawyer' && selectedType !== 'envSpecialist') && (
              <div className="summary-item">
                <div className="summary-label">Miesięczne wynagrodzenie:</div>
                <div className="summary-value">{monthlySalary.toLocaleString()} PLN</div>
              </div>
            )}
            
            <div className="summary-item">
              <div className="summary-label">Koszt zatrudnienia:</div>
              <div className="summary-value">{hireCost.toLocaleString()} PLN</div>
            </div>
            
            <div className="summary-item">
              <div className="summary-label">Dostępne środki:</div>
              <div className="summary-value">{playerState.cash.toLocaleString()} PLN</div>
            </div>
            
            <div className="summary-description">
              {selectedType === 'scout' && (
                <>
                  <p><strong>Dzierżawca</strong> - Pozyskuje grunty pod projekty OZE, negocjuje z właścicielami działek.</p>
                  <p>• Zwiększa ilość gruntów gotowych do developmentu</p>
                  <p>• Zdobywa doświadczenie w pozyskiwaniu gruntów</p>
                </>
              )}
              
              {selectedType === 'developer' && (
                <>
                  <p><strong>Developer</strong> - Odpowiada za techniczny rozwój projektów OZE.</p>
                  <p>• Przyspiesza rozwój projektów</p>
                  <p>• Zdobywa doświadczenie w określonych technologiach</p>
                </>
              )}
              
              {selectedType === 'lawyer' && (
                <>
                  <p><strong>Prawnik</strong> - Ekspert w prawie energetycznym i administracyjnym.</p>
                  <p>• Przyspiesza uzyskiwanie pozwoleń i decyzji</p>
                  <p>• Zmniejsza ryzyko problemów prawnych</p>
                </>
              )}
              
              {selectedType === 'envSpecialist' && (
                <>
                  <p><strong>Specjalista ds. środowiska</strong> - Ekspert w zakresie ocen oddziaływania na środowisko.</p>
                  <p>• Przyspiesza uzyskiwanie pozwoleń środowiskowych</p>
                  <p>• Zmniejsza ryzyko problemów z ochroną przyrody</p>
                </>
              )}
              
              {selectedType === 'lobbyist' && (
                <>
                  <p><strong>Lobbysta</strong> - Buduje relacje z lokalnymi społecznościami i władzami.</p>
                  <p>• Przyspiesza decyzje administracyjne</p>
                  <p>• Zmniejsza ryzyko protestów społecznych</p>
                </>
              )}
            </div>
            
            <button 
              className="hire-button"
              onClick={handleHire}
              disabled={!canHire}
            >
              {canHire ? 'Zatrudnij pracownika' : 'Niewystarczające środki'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmploymentCenter; 