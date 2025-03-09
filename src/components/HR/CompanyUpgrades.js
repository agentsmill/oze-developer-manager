import React, { useState } from 'react';
import { usePlayerContext } from '../../store/PlayerContext';
import { FaCheck, FaInfoCircle } from 'react-icons/fa';

/**
 * Komponent ulepszeń firmowych
 * @param {Object} props - Właściwości komponentu
 * @param {Object} props.playerState - Stan gracza
 * @param {Object} props.gameState - Stan gry
 */
const CompanyUpgrades = ({ playerState, gameState }) => {
  const { dispatch: playerDispatch } = usePlayerContext();
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Definicje dostępnych ulepszeń
  const upgrades = [
    // Ulepszenia dla dzierżawców (scouts)
    {
      id: 'scout_cars',
      name: 'Flota luksusowych samochodów',
      category: 'scout',
      description: 'Ładniejsze samochody do prezentowania przed rolnikami zwiększają skuteczność dzierżawców.',
      levels: [
        { level: 1, cost: 250000, benefit: '+5% do skuteczności pozyskiwania gruntów' },
        { level: 2, cost: 500000, benefit: '+10% do skuteczności pozyskiwania gruntów' },
        { level: 3, cost: 1000000, benefit: '+15% do skuteczności pozyskiwania gruntów' }
      ],
      currentLevel: playerState.companyUpgrades?.scout_cars || 0
    },
    {
      id: 'scout_software',
      name: 'Oprogramowanie do analizy gruntów',
      category: 'scout',
      description: 'Zaawansowane narzędzia do analizy potencjału gruntów przed negocjacjami.',
      levels: [
        { level: 1, cost: 300000, benefit: '+7% do oceny potencjału gruntów' },
        { level: 2, cost: 600000, benefit: '+15% do oceny potencjału gruntów' },
        { level: 3, cost: 1200000, benefit: '+25% do oceny potencjału gruntów' }
      ],
      currentLevel: playerState.companyUpgrades?.scout_software || 0
    },
    
    // Ulepszenia dla developerów
    {
      id: 'dev_workstations',
      name: 'Zaawansowane stacje robocze',
      category: 'developer',
      description: 'Wysokiej klasy komputery i oprogramowanie CAD dla developerów.',
      levels: [
        { level: 1, cost: 350000, benefit: '+8% do szybkości rozwoju projektów' },
        { level: 2, cost: 700000, benefit: '+16% do szybkości rozwoju projektów' },
        { level: 3, cost: 1400000, benefit: '+25% do szybkości rozwoju projektów' }
      ],
      currentLevel: playerState.companyUpgrades?.dev_workstations || 0
    },
    {
      id: 'dev_software',
      name: 'Specjalistyczne oprogramowanie',
      category: 'developer',
      description: 'Licencje na profesjonalne oprogramowanie dla developerów.',
      levels: [
        { level: 1, cost: 400000, benefit: '+10% do jakości dokumentacji technicznej' },
        { level: 2, cost: 800000, benefit: '+20% do jakości dokumentacji technicznej' },
        { level: 3, cost: 1600000, benefit: '+30% do jakości dokumentacji technicznej' }
      ],
      currentLevel: playerState.companyUpgrades?.dev_software || 0
    },
    
    // Ulepszenia dla GIS (geograficzne systemy informacyjne)
    {
      id: 'gis_tools',
      name: 'Zaawansowane narzędzia GIS',
      category: 'gis',
      description: 'Profesjonalne oprogramowanie i sprzęt do analizy przestrzennej.',
      levels: [
        { level: 1, cost: 500000, benefit: '+10% do dokładności analiz lokalizacyjnych' },
        { level: 2, cost: 1000000, benefit: '+20% do dokładności analiz lokalizacyjnych' },
        { level: 3, cost: 2000000, benefit: '+35% do dokładności analiz lokalizacyjnych' }
      ],
      currentLevel: playerState.companyUpgrades?.gis_tools || 0
    },
    {
      id: 'drone_fleet',
      name: 'Flota dronów badawczych',
      category: 'gis',
      description: 'Drony z kamerami termowizyjnymi i multispektralnymi do badania terenu.',
      levels: [
        { level: 1, cost: 600000, benefit: '+12% do szybkości analizy terenu' },
        { level: 2, cost: 1200000, benefit: '+25% do szybkości analizy terenu' },
        { level: 3, cost: 2400000, benefit: '+40% do szybkości analizy terenu' }
      ],
      currentLevel: playerState.companyUpgrades?.drone_fleet || 0
    },
    
    // Ulepszenia dla prawników
    {
      id: 'law_database',
      name: 'Baza danych prawniczych',
      category: 'lawyer',
      description: 'Dostęp do profesjonalnych baz danych prawniczych i precedensów.',
      levels: [
        { level: 1, cost: 450000, benefit: '+10% do skuteczności w postępowaniach administracyjnych' },
        { level: 2, cost: 900000, benefit: '+20% do skuteczności w postępowaniach administracyjnych' },
        { level: 3, cost: 1800000, benefit: '+35% do skuteczności w postępowaniach administracyjnych' }
      ],
      currentLevel: playerState.companyUpgrades?.law_database || 0
    },
    
    // Ulepszenia dla lobbystów
    {
      id: 'pr_campaigns',
      name: 'Kampanie PR dla projektów',
      category: 'lobbyist',
      description: 'Profesjonalne kampanie PR zwiększające akceptację społeczną.',
      levels: [
        { level: 1, cost: 400000, benefit: '+15% do akceptacji społecznej projektów' },
        { level: 2, cost: 800000, benefit: '+30% do akceptacji społecznej projektów' },
        { level: 3, cost: 1600000, benefit: '+50% do akceptacji społecznej projektów' }
      ],
      currentLevel: playerState.companyUpgrades?.pr_campaigns || 0
    },
    
    // Ulepszenia dla całej firmy
    {
      id: 'company_offices',
      name: 'Nowoczesna siedziba firmy',
      category: 'company',
      description: 'Prestiżowe biura zwiększające morale wszystkich pracowników.',
      levels: [
        { level: 1, cost: 1000000, benefit: '+10% do morale wszystkich pracowników' },
        { level: 2, cost: 2500000, benefit: '+20% do morale wszystkich pracowników' },
        { level: 3, cost: 5000000, benefit: '+35% do morale wszystkich pracowników' }
      ],
      currentLevel: playerState.companyUpgrades?.company_offices || 0
    },
    {
      id: 'employee_benefits',
      name: 'Program benefitów pracowniczych',
      category: 'company',
      description: 'Kompleksowy pakiet benefitów poprawiający zadowolenie i wydajność.',
      levels: [
        { level: 1, cost: 800000, benefit: '+8% do wydajności i -10% do rotacji pracowników' },
        { level: 2, cost: 1600000, benefit: '+15% do wydajności i -25% do rotacji pracowników' },
        { level: 3, cost: 3200000, benefit: '+25% do wydajności i -50% do rotacji pracowników' }
      ],
      currentLevel: playerState.companyUpgrades?.employee_benefits || 0
    },
    {
      id: 'training_program',
      name: 'Program szkoleń wewnętrznych',
      category: 'company',
      description: 'Systematyczne szkolenia zwiększające kompetencje całego zespołu.',
      levels: [
        { level: 1, cost: 600000, benefit: '+10% szybszy wzrost doświadczenia' },
        { level: 2, cost: 1200000, benefit: '+20% szybszy wzrost doświadczenia' },
        { level: 3, cost: 2400000, benefit: '+35% szybszy wzrost doświadczenia' }
      ],
      currentLevel: playerState.companyUpgrades?.training_program || 0
    }
  ];
  
  // Filtrowanie ulepszeń według kategorii
  const filteredUpgrades = selectedCategory === 'all'
    ? upgrades
    : upgrades.filter(upgrade => upgrade.category === selectedCategory);
  
  // Funkcja do zakupu ulepszenia
  const purchaseUpgrade = (upgradeId) => {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    const nextLevel = upgrade.currentLevel + 1;
    if (nextLevel > upgrade.levels.length) return;
    
    const cost = upgrade.levels[nextLevel - 1].cost;
    
    // Sprawdzenie czy gracz ma wystarczające środki
    if (playerState.cash < cost) {
      alert('Niewystarczające środki!');
      return;
    }
    
    // Aktualizacja stanu gracza
    playerDispatch({
      type: 'PURCHASE_COMPANY_UPGRADE',
      payload: {
        upgradeId,
        level: nextLevel,
        cost
      }
    });
  };
  
  return (
    <div className="company-upgrades">
      <h3>Ulepszenia firmowe</h3>
      <p className="upgrades-description">
        Inwestuj w rozwój swojej firmy, aby zwiększyć wydajność i skuteczność twoich pracowników.
        Każde ulepszenie można rozwijać do trzeciego poziomu, zwiększając efekty.
      </p>
      
      <div className="upgrades-filters">
        <button 
          className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          Wszystkie
        </button>
        <button 
          className={`filter-btn ${selectedCategory === 'scout' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('scout')}
        >
          Dzierżawcy
        </button>
        <button 
          className={`filter-btn ${selectedCategory === 'developer' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('developer')}
        >
          Developerzy
        </button>
        <button 
          className={`filter-btn ${selectedCategory === 'gis' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('gis')}
        >
          GIS
        </button>
        <button 
          className={`filter-btn ${selectedCategory === 'lawyer' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('lawyer')}
        >
          Prawnicy
        </button>
        <button 
          className={`filter-btn ${selectedCategory === 'lobbyist' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('lobbyist')}
        >
          Lobbyści
        </button>
        <button 
          className={`filter-btn ${selectedCategory === 'company' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('company')}
        >
          Firma
        </button>
      </div>
      
      <div className="upgrades-grid">
        {filteredUpgrades.map(upgrade => {
          const nextLevel = upgrade.currentLevel + 1;
          const isMaxLevel = nextLevel > upgrade.levels.length;
          const nextLevelData = isMaxLevel ? null : upgrade.levels[nextLevel - 1];
          
          return (
            <div key={upgrade.id} className="upgrade-card">
              <div className="upgrade-header">
                <div className="upgrade-title">{upgrade.name}</div>
                <div className="upgrade-level">
                  Poziom {upgrade.currentLevel}/{upgrade.levels.length}
                </div>
              </div>
              
              <div className="upgrade-description">
                {upgrade.description}
              </div>
              
              <div className="upgrade-current-benefits">
                <div className="upgrade-benefit-title">Obecne korzyści:</div>
                {upgrade.currentLevel === 0 ? (
                  <div className="upgrade-no-benefits">Brak (ulepszenie nie zakupione)</div>
                ) : (
                  <div className="upgrade-benefit">
                    <FaCheck className="upgrade-benefit-icon" />
                    <span>{upgrade.levels[upgrade.currentLevel - 1].benefit}</span>
                  </div>
                )}
              </div>
              
              {!isMaxLevel && (
                <div className="upgrade-next-level">
                  <div className="upgrade-benefit-title">Następny poziom:</div>
                  <div className="upgrade-benefit">
                    <FaInfoCircle className="upgrade-benefit-icon" />
                    <span>{nextLevelData.benefit}</span>
                  </div>
                </div>
              )}
              
              <div className="upgrade-cost">
                {isMaxLevel ? (
                  <div className="upgrade-max-level">
                    Osiągnięto maksymalny poziom
                  </div>
                ) : (
                  <>
                    <div className="upgrade-price">
                      Koszt: {nextLevelData.cost.toLocaleString()} PLN
                    </div>
                    <button 
                      className="upgrade-button"
                      onClick={() => purchaseUpgrade(upgrade.id)}
                      disabled={playerState.cash < nextLevelData.cost}
                    >
                      {playerState.cash >= nextLevelData.cost ? 'Ulepsz' : 'Za mało środków'}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompanyUpgrades; 