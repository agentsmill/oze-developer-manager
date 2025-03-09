import { useCallback } from 'react';
import { generateStaffEvent } from '../models/Staff';
import { translateStage, translateStaffLevel } from '../utils/translators';
import { calculateDailyIncome } from '../utils/finance';

/**
 * Hook do zarządzania aktualizacją stanu gry przy zmianie dnia
 * Zawiera funkcje aktualizujące projekty, pracowników i generujące wydarzenia
 * 
 * Zamiast używać kontekstów bezpośrednio, przyjmujemy je jako parametry wywołania.
 * co pozwala uniknąć cyklu zależności
 * 
 * @param {Object} params - Parametry hooka
 * @param {Object} params.playerState - Stan gracza
 * @param {Function} params.playerDispatch - Funkcja dispatch do aktualizacji stanu gracza
 * @param {Object} params.gameState - Stan gry
 * @param {Function} params.gameDispatch - Funkcja dispatch do aktualizacji stanu gry
 */
const useGameDay = () => {
  /**
   * Sprawdza wpływ reputacji na koszty projektu
   * @param {number} reputation - Poziom reputacji
   * @returns {number} - Mnożnik kosztów
   */
  const getReputationCostMultiplier = useCallback((reputation) => {
    // Im niższa reputacja, tym wyższe koszty
    if (reputation >= 100) return 1.0; // Neutralny wpływ
    
    // Każde 20 punktów poniżej 100 zwiększa koszty o 7.5%
    const reputationMultiplier = 1 + Math.max(0, (100 - reputation) / 20) * 0.075;
    return reputationMultiplier;
  }, []);
  
  /**
   * Sprawdza wpływ reputacji na czas trwania projektów
   * @param {number} reputation - Poziom reputacji
   * @returns {number} - Mnożnik czasu
   */
  const getReputationTimeMultiplier = useCallback((reputation) => {
    // Im niższa reputacja, tym dłuższy czas
    if (reputation >= 100) return 1.0; // Neutralny wpływ
    
    // Każde 20 punktów poniżej 100 zwiększa czas o 5%
    const reputationMultiplier = 1 + Math.max(0, (100 - reputation) / 20) * 0.05;
    return reputationMultiplier;
  }, []);
  
  /**
   * Oblicza wpływ działań niejawnych na postęp projektu
   * @param {Object} project - Projekt
   * @param {Object} playerState - Stan gracza
   * @returns {number} - Mnożnik postępu
   */
  const getIllegalActionMultiplier = useCallback((project, playerState) => {
    // Jeśli projekt ma flagę użycia nielegalnych metod
    if (project.useIllegalMethods) {
      // Ustalamy bazowy boost prędkości
      let baseSpeedBoost = 1.4; // 40% więcej postępu
      
      // Zwiększamy boost w zależności od poziomu sieci korupcyjnej
      if (playerState.illegals.corruptionNetwork > 0) {
        baseSpeedBoost += (playerState.illegals.corruptionNetwork / 100) * 0.3; // Do 30% więcej
      }
      
      // Zwiększamy ryzyko audytu
      return baseSpeedBoost;
    }
    
    return 1.0; // Brak wpływu
  }, []);
  
  /**
   * Sprawdza, czy należy wywołać audyt
   * @param {Object} playerState - Stan gracza
   * @param {Object} gameState - Stan gry
   * @returns {boolean} - Czy wywołać audyt
   */
  const shouldTriggerAudit = useCallback((playerState, gameState) => {
    // Bazowa szansa na audit
    const baseAuditChance = playerState.illegals.auditRisk / 100;
    
    // Dodatkowe czynniki zwiększające szansę:
    // 1. Czas od ostatniego audytu (co 10 tur zwiększa szansę o 5%)
    const turnsSinceLastAudit = gameState.turn - playerState.illegals.lastAuditTurn;
    const timeFactorBoost = Math.min(0.2, Math.floor(turnsSinceLastAudit / 10) * 0.05);
    
    // 2. Poziom reputacji (poniżej 50 zwiększa szansę)
    const reputationBoost = playerState.reputation < 50 ? 0.1 : 0;
    
    // 3. Liczba aktywnych działań niejawnych
    const illegalProjects = playerState.projects.filter(p => p.useIllegalMethods).length;
    const illegalProjectsBoost = Math.min(0.3, illegalProjects * 0.03); // 3% za każdy nielegalny projekt, max 30%
    
    // Całkowita szansa na audit
    const totalAuditChance = baseAuditChance + timeFactorBoost + reputationBoost + illegalProjectsBoost;
    
    // Losujemy czy wywołać audyt
    return Math.random() < totalAuditChance;
  }, []);
  
  /**
   * Przeprowadza audit i nalicza kary
   * @param {Object} playerState - Stan gracza
   * @param {Object} gameState - Stan gry
   * @param {Function} playerDispatch - Funkcja dispatch
   */
  const performAudit = useCallback((playerState, gameState, playerDispatch) => {
    // Sprawdzamy wynik audytu (w oparciu o ilość nielegalnych działań)
    const illegalProjects = playerState.projects.filter(p => p.useIllegalMethods).length;
    const illegalActionsHistory = playerState.illegals.illegalActionHistory.length;
    
    // Szansa na pozytywny wynik audytu zmniejsza się z liczbą nielegalnych działań
    const passChance = Math.max(0.1, 1 - (illegalProjects * 0.1) - (illegalActionsHistory * 0.05));
    const auditPassed = Math.random() < passChance;
    
    if (auditPassed) {
      // Audyt zaliczony - mniejszy wpływ
      playerDispatch({
        type: 'TRIGGER_AUDIT',
        payload: {
          turn: gameState.turn,
          passed: true,
          riskReduction: 10, // Zmniejszenie ryzyka audytu
          fine: 0,
          reputationLoss: 0
        }
      });
    } else {
      // Audyt niezaliczony - kary
      
      // Obliczamy wysokość kary (w oparciu o nielegalne działania i łapówki)
      const baseFine = 50000 * illegalProjects; // 50 000 zł za każdy nielegalny projekt
      const bribeFine = playerState.illegals.totalBribes * 0.5; // 50% łapówek
      const totalFine = baseFine + bribeFine;
      
      // Strata reputacji
      const reputationLoss = 10 + (illegalProjects * 5) + (illegalActionsHistory * 2);
      
      // Aktualizujemy stan
      playerDispatch({
        type: 'TRIGGER_AUDIT',
        payload: {
          turn: gameState.turn,
          passed: false,
          riskReduction: 5, // Mniejsze zmniejszenie ryzyka
          fine: totalFine,
          reputationLoss: reputationLoss
        }
      });
      
      // Aktualizujemy reputację
      playerDispatch({
        type: 'UPDATE_REPUTATION',
        payload: {
          change: -reputationLoss,
          reason: 'Nieudany audyt kontrolny',
          turn: gameState.turn
        }
      });
    }
  }, []);
  
  /**
   * Aktualizacja postępu projektów
   * Funkcja wywoływana co turę, zwiększająca postęp projektów
   * 
   * @param {Object} playerState - Stan gracza
   * @param {Object} gameState - Stan gry
   * @param {Function} playerDispatch - Funkcja dispatch gracza
   * @param {Function} gameDispatch - Funkcja dispatch gry
   */
  const updateProjects = useCallback((playerState, gameState, playerDispatch, gameDispatch) => {
    if (!playerState || !gameState) return;
    
    // Aktualizujemy tylko, gdy zmienia się tura (co dwa dni)
    if (gameState.day % 2 !== 0) return;

    playerState.projects.forEach(project => {
      // Jeśli projekt jest już gotowy, nie aktualizujemy go
      if (project.status === 'ready_to_build') return;
      
      // Pobieramy przypisanych pracowników do projektu
      const assignedStaff = project.assignedStaff || {};
      
      // Bazowy postęp zależny od umiejętności developera - zwiększony 2.5x
      let progressIncrement = 2.5;
      
      // Modyfikatory postępu w zależności od etapu i przypisanych pracowników
      switch(project.status) {
        case 'land_acquisition':
          // Etap dzierżawy jest obsługiwany przez dzierżawców przypisanych do powiatu
          // Nie przez developera
          
          // Znajdujemy dzierżawcę przypisanego do miski dzierżawy w powiecie
          let lessorBonus = 0;
          
          if (project.county) {
            const county = playerState.counties.find(
              c => c.voivodeship === project.county.voivodeship && c.id === project.county.id
            );
            
            if (county && county.leasePools && county.leasePools[project.technology]) {
              const lessorIds = county.leasePools[project.technology].lessors || [];
              
              // Dla każdego dzierżawcy w puli, dodajemy jego bonus do postępu
              lessorIds.forEach(lessorId => {
                const lessor = playerState.staff.lessors?.find(l => l.id === lessorId);
                if (lessor) {
                  // Podstawowy bonus od umiejętności dzierżawcy
                  let lessorSkillBonus = lessor.skill / 5;
                  
                  // Dodatkowy bonus za specjalizację pasującą do technologii
                  const specialization = lessor.specialization?.toLowerCase() || '';
                  if (
                    (project.technology === 'PV' && specialization.includes('fotowoltaika')) ||
                    (project.technology === 'WF' && specialization.includes('wiatrowe')) ||
                    (project.technology === 'BESS' && specialization.includes('magazyn')) ||
                    (project.technology.includes('+') && specialization.includes('hybrydowe'))
                  ) {
                    lessorSkillBonus *= 1.5;
                  }
                  
                  lessorBonus += lessorSkillBonus;
                }
              });
            }
          }
          
          // Dodajemy bonus od dzierżawców do postępu
          progressIncrement += lessorBonus;
          
          // Dzierżawa powinna być najszybszym etapem
          progressIncrement *= 1.5;
          break;
          
        case 'environmental_decision':
          // Od tego etapu developer jest wymagany
          const developer = assignedStaff.developer 
            ? playerState.staff.developers?.find(d => d.id === assignedStaff.developer)
            : null;
          
          if (developer) {
            // Dodajemy bonus od developera
            progressIncrement += developer.skill / 5;
          } else {
            // Brak developera mocno spowalnia postęp
            progressIncrement *= 0.3;
          }
          
          // Znajdujemy przypisanego specjalistę ds. środowiska
          const envSpecialist = assignedStaff.envSpecialist
            ? playerState.staff.envSpecialists?.find(s => s.id === assignedStaff.envSpecialist)
            : null;
          
          if (envSpecialist) {
            // Specjaliści ds. środowiska znacząco przyspieszają decyzje środowiskowe
            progressIncrement += envSpecialist.skill / 5;
            
            // Jeśli specjalista ma specjalizację "environmental", dajemy dodatkowy bonus
            if (envSpecialist.specialization === "environmental") {
              progressIncrement *= 1.5;
            }
          }
          break;
          
        case 'zoning_conditions':
          // Od tego etapu developer jest wymagany
          const developer2 = assignedStaff.developer 
            ? playerState.staff.developers?.find(d => d.id === assignedStaff.developer)
            : null;
          
          if (developer2) {
            // Dodajemy bonus od developera
            progressIncrement += developer2.skill / 5;
          } else {
            // Brak developera mocno spowalnia postęp
            progressIncrement *= 0.3;
          }
          
          // Przyspieszone warunki zabudowy
          progressIncrement *= 1.2;
          break;
          
        case 'grid_connection':
          // Od tego etapu developer jest wymagany
          const developer3 = assignedStaff.developer 
            ? playerState.staff.developers?.find(d => d.id === assignedStaff.developer)
            : null;
          
          if (developer3) {
            // Dodajemy bonus od developera
            progressIncrement += developer3.skill / 5;
          } else {
            // Brak developera mocno spowalnia postęp
            progressIncrement *= 0.3;
          }
          
          // Znajdujemy przypisanego lobbystę ds. sieci
          const gridLobbyist = assignedStaff.lobbyist
            ? playerState.staff.lobbyists?.find(l => l.id === assignedStaff.lobbyist)
            : null;
          
          // Znajdujemy przypisanego prawnika ds. sieci
          const gridLawyer = assignedStaff.lawyer
            ? playerState.staff.lawyers?.find(l => l.id === assignedStaff.lawyer)
            : null;
          
          if (gridLobbyist) {
            // Lobbyści znacząco przyspieszają przyłączenie do sieci
            progressIncrement += gridLobbyist.skill / 4;
          }
          
          if (gridLawyer) {
            // Prawnicy pomagają w uzyskaniu warunków przyłączenia
            progressIncrement += gridLawyer.skill / 5;
          }
          break;
          
        default:
          break;
      }
      
      // Wpływ reputacji na postęp
      const reputationMultiplier = 1 / getReputationTimeMultiplier(playerState.reputation);
      progressIncrement *= reputationMultiplier;
      
      // Wpływ działań niejawnych (jeśli użyte)
      const illegalMultiplier = getIllegalActionMultiplier(project, playerState);
      progressIncrement *= illegalMultiplier;
      
      // Aktualizujemy postęp projektu - dodatkowy mnożnik 1.5 dla wszystkich etapów
      progressIncrement *= 1.5;
      const newProgress = Math.min(100, project.progress + progressIncrement);
      
      // Aktualizujemy projekt
      playerDispatch({
        type: 'UPDATE_PROJECT',
        payload: {
          id: project.id,
          changes: {
            progress: newProgress
          }
        }
      });
      
      // Dodajemy powiadomienie o ukończeniu etapu
      if (newProgress >= 100 && project.progress < 100) {
        gameDispatch({
          type: 'SET_NOTIFICATION',
          payload: {
            text: `Projekt ${project.name} ukończył etap ${translateStage(project.status)}! Możesz teraz przejść do następnego etapu.`,
            type: 'success'
          }
        });
        
        // Dodajemy zdarzenie ukończenia etapu
        playerDispatch({
          type: 'ADD_PROJECT_EVENT',
          payload: {
            projectId: project.id,
            event: {
              turn: gameState.turn,
              text: `Ukończono etap: ${translateStage(project.status)}`
            }
          }
        });
        
        // Potencjalny zysk reputacji za ukończenie etapu (legalnie)
        if (!project.useIllegalMethods) {
          playerDispatch({
            type: 'UPDATE_REPUTATION',
            payload: {
              change: 5, // +5 do reputacji za legalny etap
              reason: `Ukończenie etapu ${translateStage(project.status)} legalnie`,
              turn: gameState.turn
            }
          });
        }
      }
      
      // Aktualizacja wartości rynkowej projektu
      // Obliczamy nową wartość rynkową
      const baseValue = project.power * 150000; // 150 000 PLN za 1 MW
      
      // Mnożniki w zależności od etapu
      const stagePriceMultipliers = {
        land_acquisition: 0.15,         // 15% wartości
        environmental_decision: 0.35,    // 35% wartości
        zoning_conditions: 0.55,         // 55% wartości
        grid_connection: 0.85,           // 85% wartości
        ready_to_build: 1.0,            // 100% wartości
      };
      
      // Obliczamy mnożnik etapu + postępu
      const stageMultiplier = stagePriceMultipliers[project.status] || 0.1;
      const progressMultiplier = (project.progress / 100) * 
                               (stagePriceMultipliers[project.status === 'land_acquisition' ? 'environmental_decision' : project.status] - 
                                stagePriceMultipliers[project.status]);
      const totalStageMultiplier = stageMultiplier + progressMultiplier;
      
      // Obliczamy wartość rynkową
      const marketValue = baseValue * totalStageMultiplier;
      
      // Aktualizujemy wartość rynkową
      playerDispatch({
        type: 'UPDATE_PROJECT_MARKET_VALUE',
        payload: {
          projectId: project.id,
          value: marketValue
        }
      });
      
      // Jeśli projekt używa nielegalnych metod, jest szansa na wykrycie i karę
      if (project.useIllegalMethods && Math.random() < 0.1) { // 10% szans na wykrycie
        // Utrata reputacji
        playerDispatch({
          type: 'UPDATE_REPUTATION',
          payload: {
            change: -10, // -10 do reputacji za nielegalne działanie
            reason: `Wykrycie nielegalnych działań w projekcie ${project.name}`,
            turn: gameState.turn
          }
        });
      }
    });
    
    // Sprawdzamy, czy powinniśmy wyzwolić audit
    if (shouldTriggerAudit(playerState, gameState)) {
      performAudit(playerState, gameState, playerDispatch);
    }
  }, [getReputationTimeMultiplier, getIllegalActionMultiplier, shouldTriggerAudit, performAudit]);

  /**
   * Generuje wydarzenia dla pracowników każdego dnia
   * @param {Object} playerState - Stan gracza
   * @param {Object} gameState - Stan gry
   * @param {Function} playerDispatch - Funkcja dispatch stanu gracza
   */
  const generateStaffEvents = useCallback((playerState, gameState, playerDispatch) => {
    if (!playerState || !gameState) return;
    
    // Aktualizujemy tylko, gdy zmienia się tura (co dwa dni)
    if (gameState.day % 2 !== 0) return;
    
    // Tworzymy listę wszystkich typów pracowników
    const staffTypes = Object.keys(playerState.staff || {});
    
    // Dla każdego typu pracowników
    staffTypes.forEach(staffType => {
      const staffList = playerState.staff[staffType] || [];
      
      // Dla każdego pracownika
      staffList.forEach(staff => {
        // Generowanie wydarzeń losowych
        // Szansa na zdarzenie: 5% na turę
        if (Math.random() < 0.05) {
          const event = generateStaffEvent(staff);
          if (event) {
            // Dodajemy wydarzenie do systemu wydarzeń
            playerDispatch({
              type: 'ADD_EVENT',
              payload: {
                id: Date.now() + Math.random(),
                type: 'staff_event',
                title: event.title,
                description: event.description,
                severity: event.severity,
                staffId: staff.id,
                staffName: staff.name,
                staffType: staffType,
                turn: gameState.turn,
                expires: gameState.turn + 5
              }
            });
            
            // Aktualizujemy stan pracownika na podstawie efektów wydarzenia
            if (event.effects) {
              playerDispatch({
                type: 'UPDATE_STAFF',
                payload: {
                  staffType,
                  staffId: staff.id,
                  changes: {
                    morale: Math.max(0, Math.min(100, staff.morale + (event.effects.morale || 0))),
                    energy: Math.max(0, Math.min(100, staff.energy + (event.effects.energy || 0))),
                    skill: Math.max(0, Math.min(10, staff.skill + (event.effects.skill || 0))),
                    experience: Math.max(0, staff.experience + (event.effects.experience || 0))
                  }
                }
              });
            }
            
            // Wpływ na reputację, jeśli wydarzenie jest pozytywne lub negatywne
            if (event.severity === 'positive' || event.severity === 'negative') {
              const reputationChange = event.severity === 'positive' ? 2 : -2;
              
              playerDispatch({
                type: 'UPDATE_REPUTATION',
                payload: {
                  change: reputationChange,
                  reason: event.title,
                  turn: gameState.turn
                }
              });
            }
          }
        }
        
        // Automatyczne zwiększanie doświadczenia
        // Bazowa wartość doświadczenia zdobywanego co turę
        let baseExperience = 10;
        
        // Sprawdzamy, czy firma ma ulepszenie przyspieszające zdobywanie doświadczenia
        const trainingProgramLevel = playerState.companyUpgrades?.training_program || 0;
        
        // Mnożniki w zależności od poziomu ulepszenia
        const experienceMultipliers = [1, 1.1, 1.2, 1.35]; // 0, 1, 2, 3 poziom
        
        // Zwiększamy doświadczenie na podstawie ulepszenia
        baseExperience *= experienceMultipliers[trainingProgramLevel];
        
        // Aktualizujemy doświadczenie pracownika
        playerDispatch({
          type: 'UPDATE_STAFF',
          payload: {
            staffType,
            staffId: staff.id,
            changes: {
              experience: staff.experience + baseExperience
            }
          }
        });
        
        // Sprawdzamy czy pracownik powinien awansować
        checkStaffForLevelUp(staff, staffType, playerDispatch);
        
        // Aktualizacja morale i energii
        // ...existing code...
      });
    });
  }, []);

  /**
   * Sprawdza czy pracownik powinien awansować
   * @param {Object} staff - Pracownik
   * @param {string} staffType - Typ pracownika
   * @param {Function} playerDispatch - Funkcja dispatch
   */
  const checkStaffForLevelUp = (staff, staffType, playerDispatch) => {
    // Definiujemy progi doświadczenia dla poszczególnych poziomów
    const experienceThresholds = {
      junior: { min: 0, max: 3000, next: 'mid' },
      mid: { min: 3001, max: 8000, next: 'senior' },
      senior: { min: 8001, max: Infinity, next: null }
    };
    
    // Aktualne poziomy
    const currentLevel = staff.level;
    const currentExp = staff.experience;
    
    // Sprawdzamy, czy pracownik przekroczył próg doświadczenia dla swojego poziomu
    if (currentExp > experienceThresholds[currentLevel].max && experienceThresholds[currentLevel].next) {
      const newLevel = experienceThresholds[currentLevel].next;
      
      // Aktualizujemy poziom pracownika
      playerDispatch({
        type: 'UPDATE_STAFF',
        payload: {
          staffType,
          staffId: staff.id,
          changes: {
            level: newLevel,
            historia: [...(staff.historia || []), {
              data: new Date().toISOString(),
              typ: 'awans',
              opis: `Awansował na pozycję ${translateStaffLevel(newLevel)}`
            }]
          }
        }
      });
      
      // Zwiększamy też umiejętności
      if (newLevel === 'mid') {
        // Przejście z junior na mid
        const skillIncrease = Math.max(1, Math.floor(Math.random() * 3) + 1); // Wzrost o 1-3 punkty
        
        playerDispatch({
          type: 'UPDATE_STAFF',
          payload: {
            staffType,
            staffId: staff.id,
            changes: {
              skill: Math.min(10, staff.skill + skillIncrease)
            }
          }
        });
      } else if (newLevel === 'senior') {
        // Przejście z mid na senior
        const skillIncrease = Math.max(2, Math.floor(Math.random() * 3) + 2); // Wzrost o 2-4 punkty
        
        playerDispatch({
          type: 'UPDATE_STAFF',
          payload: {
            staffType,
            staffId: staff.id,
            changes: {
              skill: Math.min(10, staff.skill + skillIncrease)
            }
          }
        });
      }
    }
  };

  /**
   * Generuje globalne wydarzenia ekonomiczne
   * @param {Object} playerState - Stan gracza
   * @param {Object} gameState - Stan gry
   * @param {Function} gameDispatch - Funkcja dispatch gry
   */
  const generateEconomicEvents = useCallback((playerState, gameState, gameDispatch) => {
    // Generujemy wydarzenia tylko przy turach podzielnych przez 5
    if (gameState.turn % 5 !== 0) return;
    
    // Szansa na wydarzenie ekonomiczne: 30%
    if (Math.random() < 0.3) {
      const economicEvents = [
        {
          id: 'energy_price_rise',
          title: 'Wzrost cen energii',
          description: 'Ceny energii na rynku wzrosły o 15%, zwiększając potencjalną wartość projektów OZE.',
          severity: 'positive',
          effect: {
            type: 'market_price_modifier',
            technology: 'all',
            value: 1.15,
            duration: 10 // 10 tur
          }
        },
        {
          id: 'energy_price_drop',
          title: 'Spadek cen energii',
          description: 'Ceny energii na rynku spadły o 10%, obniżając wartość projektów OZE.',
          severity: 'negative',
          effect: {
            type: 'market_price_modifier',
            technology: 'all',
            value: 0.9,
            duration: 8 // 8 tur
          }
        },
        {
          id: 'pv_boom',
          title: 'Boom na fotowoltaikę',
          description: 'Zwiększony popyt na projekty fotowoltaiczne zwiększył ich wartość rynkową o 20%.',
          severity: 'positive',
          effect: {
            type: 'market_price_modifier',
            technology: 'PV',
            value: 1.2,
            duration: 12 // 12 tur
          }
        },
        {
          id: 'wind_regulations',
          title: 'Nowe regulacje dla farm wiatrowych',
          description: 'Nowe regulacje ułatwiają rozwój projektów wiatrowych, zwiększając ich wartość o 15%.',
          severity: 'positive',
          effect: {
            type: 'market_price_modifier',
            technology: 'WF',
            value: 1.15,
            duration: 15 // 15 tur
          }
        },
        {
          id: 'regulatory_changes',
          title: 'Zmiany regulacyjne',
          description: 'Zmiany w przepisach spowodowały opóźnienia w procesach administracyjnych.',
          severity: 'negative',
          effect: {
            type: 'project_speed',
            value: 0.85, // 15% wolniej
            duration: 8 // 8 tur
          }
        }
      ];
      
      // Losujemy wydarzenie
      const selectedEvent = economicEvents[Math.floor(Math.random() * economicEvents.length)];
      
      // Dodajemy wydarzenie
      playerDispatch({
        type: 'ADD_EVENT',
        payload: {
          id: Date.now() + Math.random(),
          type: 'economic_event',
          title: selectedEvent.title,
          description: selectedEvent.description,
          severity: selectedEvent.severity,
          turn: gameState.turn,
          expires: gameState.turn + selectedEvent.effect.duration,
          effect: selectedEvent.effect
        }
      });
      
      // Aktualizujemy ceny rynkowe
      if (selectedEvent.effect.type === 'market_price_modifier') {
        if (selectedEvent.effect.technology === 'all') {
          gameDispatch({
            type: 'UPDATE_MARKET_PRICE_MODIFIERS',
            payload: {
              PV: selectedEvent.effect.value,
              WF: selectedEvent.effect.value,
              BESS: selectedEvent.effect.value
            }
          });
        } else {
          gameDispatch({
            type: 'UPDATE_MARKET_PRICE_MODIFIERS',
            payload: {
              [selectedEvent.effect.technology]: selectedEvent.effect.value
            }
          });
        }
      }
    }
  }, []);

  /**
   * Generowanie wydarzeń związanych z projektami
   * Ta funkcja losowo generuje zarówno pozytywne jak i negatywne wydarzenia
   * wpływające na projekty gracza
   * 
   * @param {Object} playerState - Stan gracza
   * @param {Object} gameState - Stan gry
   * @param {Function} playerDispatch - Funkcja dispatch gracza
   * @param {Function} gameDispatch - Funkcja dispatch gry
   */
  const generateProjectEvents = useCallback((playerState, gameState, playerDispatch, gameDispatch) => {
    if (!playerState || !gameState) return;
    
    // Generujemy wydarzenia projektowe co 3 dni
    if (gameState.day % 3 !== 0) return;
    
    // Sprawdzamy każdy aktywny projekt
    playerState.projects.forEach(project => {
      // Losowa szansa na wydarzenie: 30% dla każdego projektu
      if (Math.random() < 0.3) {
        // Określamy typ wydarzenia (pozytywne/negatywne)
        const isPositive = Math.random() < 0.5;
        
        let eventData = {
          id: `proj_event_${Date.now()}_${Math.random()}`,
          type: 'project_event',
          projectId: project.id,
          title: '',
          description: '',
          severity: isPositive ? 'positive' : 'negative',
          turn: gameState.turn,
          expires: gameState.turn + Math.floor(Math.random() * 6) + 3, // 3-8 tur
          effects: {}
        };
        
        // Wybieramy rodzaj wydarzenia w zależności od etapu projektu
        switch(project.status) {
          case 'land_acquisition':
            if (isPositive) {
              // Pozytywne wydarzenia dla etapu pozyskiwania gruntów
              const positiveEvents = [
                {
                  title: 'Wsparcie lokalnej społeczności',
                  description: `Mieszkańcy gminy wyrazili poparcie dla projektu ${project.name}, co przyspiesza proces pozyskiwania gruntów.`,
                  progressBonus: Math.floor(Math.random() * 10) + 5, // +5-15%
                  reputationChange: 2
                },
                {
                  title: 'Spadek cen dzierżawy',
                  description: `Właściciele gruntów obniżyli stawki dzierżawy dla projektu ${project.name} o 15%.`,
                  costModifier: 0.85,
                  progressBonus: Math.floor(Math.random() * 5) + 3 // +3-8%
                },
                {
                  title: 'Preferencyjne warunki dzierżawy',
                  description: `Udało się wynegocjować korzystniejsze warunki umowy dla projektu ${project.name}.`,
                  costModifier: 0.9,
                  progressBonus: Math.floor(Math.random() * 7) + 4 // +4-11%
                }
              ];
              
              const selectedEvent = positiveEvents[Math.floor(Math.random() * positiveEvents.length)];
              eventData = { ...eventData, ...selectedEvent };
              
              // Aplikujemy efekty
              if (selectedEvent.progressBonus) {
                playerDispatch({
                  type: 'UPDATE_PROJECT',
                  payload: {
                    id: project.id,
                    changes: {
                      progress: Math.min(100, project.progress + selectedEvent.progressBonus)
                    }
                  }
                });
              }
              
              if (selectedEvent.costModifier && project.etapCosts) {
                const newCost = Math.round(project.etapCosts.land_acquisition * selectedEvent.costModifier);
                playerDispatch({
                  type: 'UPDATE_PROJECT_STAGE_COST',
                  payload: {
                    projectId: project.id,
                    stage: 'land_acquisition',
                    cost: newCost
                  }
                });
              }
              
              if (selectedEvent.reputationChange) {
                playerDispatch({
                  type: 'UPDATE_REPUTATION',
                  payload: {
                    change: selectedEvent.reputationChange,
                    reason: selectedEvent.title,
                    turn: gameState.turn
                  }
                });
              }
            } else {
              // Negatywne wydarzenia dla etapu pozyskiwania gruntów
              const negativeEvents = [
                {
                  title: 'Konflikt o granice działek',
                  description: `Odkryto nieścisłości w dokumentacji gruntów dla projektu ${project.name}, co opóźnia proces.`,
                  progressPenalty: Math.floor(Math.random() * 8) + 3 // -3-11%
                },
                {
                  title: 'Wzrost oczekiwań cenowych',
                  description: `Właściciele gruntów żądają wyższych stawek dzierżawy dla projektu ${project.name}.`,
                  costModifier: 1.2,
                  progressPenalty: Math.floor(Math.random() * 5) + 2 // -2-7%
                },
                {
                  title: 'Problemy z dostępem do terenu',
                  description: `Trudności z dostępem do działek opóźniają analizy terenowe dla projektu ${project.name}.`,
                  progressPenalty: Math.floor(Math.random() * 10) + 5 // -5-15%
                }
              ];
              
              const selectedEvent = negativeEvents[Math.floor(Math.random() * negativeEvents.length)];
              eventData = { ...eventData, ...selectedEvent };
              
              // Aplikujemy efekty
              if (selectedEvent.progressPenalty) {
                playerDispatch({
                  type: 'UPDATE_PROJECT',
                  payload: {
                    id: project.id,
                    changes: {
                      progress: Math.max(0, project.progress - selectedEvent.progressPenalty)
                    }
                  }
                });
              }
              
              if (selectedEvent.costModifier && project.etapCosts) {
                const newCost = Math.round(project.etapCosts.land_acquisition * selectedEvent.costModifier);
                playerDispatch({
                  type: 'UPDATE_PROJECT_STAGE_COST',
                  payload: {
                    projectId: project.id,
                    stage: 'land_acquisition',
                    cost: newCost
                  }
                });
              }
            }
            break;
            
          case 'environmental_decision':
            if (isPositive) {
              // Pozytywne wydarzenia dla etapu decyzji środowiskowej
              const positiveEvents = [
                {
                  title: 'Pozytywna opinia środowiskowa',
                  description: `Projekt ${project.name} otrzymał pozytywną opinię od lokalnych organizacji ekologicznych.`,
                  progressBonus: Math.floor(Math.random() * 12) + 8, // +8-20%
                  reputationChange: 3
                },
                {
                  title: 'Przyspieszona procedura środowiskowa',
                  description: `Urząd zastosował tryb przyspieszony dla projektu ${project.name} ze względu na jego znaczenie.`,
                  progressBonus: Math.floor(Math.random() * 15) + 10, // +10-25%
                },
                {
                  title: 'Korzystne warunki środowiskowe',
                  description: `Analizy wykazały wyjątkowo korzystne warunki środowiskowe dla projektu ${project.name}.`,
                  progressBonus: Math.floor(Math.random() * 10) + 5, // +5-15%
                  costModifier: 0.9
                }
              ];
              
              const selectedEvent = positiveEvents[Math.floor(Math.random() * positiveEvents.length)];
              eventData = { ...eventData, ...selectedEvent };
              
              // Aplikujemy efekty
              if (selectedEvent.progressBonus) {
                playerDispatch({
                  type: 'UPDATE_PROJECT',
                  payload: {
                    id: project.id,
                    changes: {
                      progress: Math.min(100, project.progress + selectedEvent.progressBonus)
                    }
                  }
                });
              }
              
              if (selectedEvent.costModifier && project.etapCosts) {
                const newCost = Math.round(project.etapCosts.environmental_decision * selectedEvent.costModifier);
                playerDispatch({
                  type: 'UPDATE_PROJECT_STAGE_COST',
                  payload: {
                    projectId: project.id,
                    stage: 'environmental_decision',
                    cost: newCost
                  }
                });
              }
              
              if (selectedEvent.reputationChange) {
                playerDispatch({
                  type: 'UPDATE_REPUTATION',
                  payload: {
                    change: selectedEvent.reputationChange,
                    reason: selectedEvent.title,
                    turn: gameState.turn
                  }
                });
              }
            } else {
              // Negatywne wydarzenia dla etapu decyzji środowiskowej
              const negativeEvents = [
                {
                  title: 'Protesty ekologów',
                  description: `Lokalne organizacje ekologiczne protestują przeciwko projektowi ${project.name}.`,
                  progressPenalty: Math.floor(Math.random() * 12) + 8, // -8-20%
                  reputationChange: -2
                },
                {
                  title: 'Dodatkowe badania środowiskowe',
                  description: `Urząd wymaga przeprowadzenia dodatkowych badań dla projektu ${project.name}.`,
                  progressPenalty: Math.floor(Math.random() * 8) + 5, // -5-13%
                  costModifier: 1.15
                },
                {
                  title: 'Odkrycie chronionego gatunku',
                  description: `Na terenie projektu ${project.name} odkryto chroniony gatunek, co komplikuje proces.`,
                  progressPenalty: Math.floor(Math.random() * 15) + 10, // -10-25%
                  costModifier: 1.2,
                  reputationChange: -1
                }
              ];
              
              const selectedEvent = negativeEvents[Math.floor(Math.random() * negativeEvents.length)];
              eventData = { ...eventData, ...selectedEvent };
              
              // Aplikujemy efekty
              if (selectedEvent.progressPenalty) {
                playerDispatch({
                  type: 'UPDATE_PROJECT',
                  payload: {
                    id: project.id,
                    changes: {
                      progress: Math.max(0, project.progress - selectedEvent.progressPenalty)
                    }
                  }
                });
              }
              
              if (selectedEvent.costModifier && project.etapCosts) {
                const newCost = Math.round(project.etapCosts.environmental_decision * selectedEvent.costModifier);
                playerDispatch({
                  type: 'UPDATE_PROJECT_STAGE_COST',
                  payload: {
                    projectId: project.id,
                    stage: 'environmental_decision',
                    cost: newCost
                  }
                });
              }
              
              if (selectedEvent.reputationChange) {
                playerDispatch({
                  type: 'UPDATE_REPUTATION',
                  payload: {
                    change: selectedEvent.reputationChange,
                    reason: selectedEvent.title,
                    turn: gameState.turn
                  }
                });
              }
            }
            break;
            
          case 'zoning_conditions':
          case 'grid_connection':
            // Podobne implementacje dla pozostałych etapów...
            if (isPositive) {
              const positiveEvents = [
                {
                  title: 'Przychylne władze lokalne',
                  description: `Władze lokalne wspierają projekt ${project.name}, co przyspiesza proces wydawania pozwoleń.`,
                  progressBonus: Math.floor(Math.random() * 15) + 10, // +10-25%
                  reputationChange: 2
                },
                {
                  title: 'Szybkie uzgodnienia sieciowe',
                  description: `Operator przyłączy przyznał priorytet dla projektu ${project.name}.`,
                  progressBonus: Math.floor(Math.random() * 20) + 15, // +15-35%
                },
                {
                  title: 'Wsparcie techniczne',
                  description: `Eksperci branżowi zaoferowali wsparcie dla projektu ${project.name}.`,
                  progressBonus: Math.floor(Math.random() * 10) + 8, // +8-18%
                  costModifier: 0.85
                }
              ];
              
              const selectedEvent = positiveEvents[Math.floor(Math.random() * positiveEvents.length)];
              eventData = { ...eventData, ...selectedEvent };
              
              // Aplikujemy efekty
              if (selectedEvent.progressBonus) {
                playerDispatch({
                  type: 'UPDATE_PROJECT',
                  payload: {
                    id: project.id,
                    changes: {
                      progress: Math.min(100, project.progress + selectedEvent.progressBonus)
                    }
                  }
                });
              }
              
              if (selectedEvent.costModifier && project.etapCosts) {
                const stage = project.status;
                const newCost = Math.round(project.etapCosts[stage] * selectedEvent.costModifier);
                playerDispatch({
                  type: 'UPDATE_PROJECT_STAGE_COST',
                  payload: {
                    projectId: project.id,
                    stage: stage,
                    cost: newCost
                  }
                });
              }
              
              if (selectedEvent.reputationChange) {
                playerDispatch({
                  type: 'UPDATE_REPUTATION',
                  payload: {
                    change: selectedEvent.reputationChange,
                    reason: selectedEvent.title,
                    turn: gameState.turn
                  }
                });
              }
            } else {
              const negativeEvents = [
                {
                  title: 'Opóźnienia administracyjne',
                  description: `Biurokracja spowalnia proces wydawania pozwoleń dla projektu ${project.name}.`,
                  progressPenalty: Math.floor(Math.random() * 15) + 10, // -10-25%
                },
                {
                  title: 'Problemy z przyłączeniem',
                  description: `Operator sieci zgłasza trudności z przyłączeniem projektu ${project.name}.`,
                  progressPenalty: Math.floor(Math.random() * 20) + 15, // -15-35%
                  costModifier: 1.2
                },
                {
                  title: 'Protesty mieszkańców',
                  description: `Lokalna społeczność protestuje przeciwko projektowi ${project.name}.`,
                  progressPenalty: Math.floor(Math.random() * 25) + 15, // -15-40%
                  reputationChange: -3
                }
              ];
              
              const selectedEvent = negativeEvents[Math.floor(Math.random() * negativeEvents.length)];
              eventData = { ...eventData, ...selectedEvent };
              
              // Aplikujemy efekty
              if (selectedEvent.progressPenalty) {
                playerDispatch({
                  type: 'UPDATE_PROJECT',
                  payload: {
                    id: project.id,
                    changes: {
                      progress: Math.max(0, project.progress - selectedEvent.progressPenalty)
                    }
                  }
                });
              }
              
              if (selectedEvent.costModifier && project.etapCosts) {
                const stage = project.status;
                const newCost = Math.round(project.etapCosts[stage] * selectedEvent.costModifier);
                playerDispatch({
                  type: 'UPDATE_PROJECT_STAGE_COST',
                  payload: {
                    projectId: project.id,
                    stage: stage,
                    cost: newCost
                  }
                });
              }
              
              if (selectedEvent.reputationChange) {
                playerDispatch({
                  type: 'UPDATE_REPUTATION',
                  payload: {
                    change: selectedEvent.reputationChange,
                    reason: selectedEvent.title,
                    turn: gameState.turn
                  }
                });
              }
            }
            break;
            
          default:
            return; // Dla ready_to_build nie generujemy wydarzeń
        }
        
        // Dodajemy wydarzenie do systemu
        playerDispatch({
          type: 'ADD_EVENT',
          payload: eventData
        });
        
        // Pokazujemy powiadomienie o nowym wydarzeniu
        gameDispatch({
          type: 'SET_NOTIFICATION',
          payload: {
            text: `${eventData.title}: ${eventData.description}`,
            type: eventData.severity === 'positive' ? 'success' : 'warning'
          }
        });
        
        // Dodajemy wydarzenie do historii projektu
        playerDispatch({
          type: 'ADD_PROJECT_EVENT',
          payload: {
            projectId: project.id,
            event: {
              turn: gameState.turn,
              text: `${eventData.title}: ${eventData.description}`
            }
          }
        });
      }
    });
  }, []);

  return {
    updateProjects,
    generateStaffEvents,
    generateEconomicEvents,
    generateProjectEvents,
    getReputationCostMultiplier,
    getReputationTimeMultiplier,
    getIllegalActionMultiplier,
    shouldTriggerAudit,
    performAudit
  };
};

export default useGameDay; 