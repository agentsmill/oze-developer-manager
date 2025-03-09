import { useCallback } from 'react';
import { generateStaffEvent } from '../models/Staff';
import { translateStage } from '../utils/translators';
import { useEventsContext } from '../store/EventContext';

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
 * @param {Function} params.eventsDispatch - Funkcja dispatch do aktualizacji stanu wydarzeń
 */
const useGameDay = () => {
  // Pobieramy dispatch z EventContext
  const { dispatch: eventsContextDispatch } = useEventsContext();
  
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
   * @param {Function} eventsDispatch - Funkcja dispatch wydarzeń
   */
  const performAudit = useCallback((playerState, gameState, playerDispatch, eventsDispatch) => {
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
      
      // Dodajemy wydarzenie
      eventsDispatch({
        type: 'ADD_EVENT',
        payload: {
          id: Date.now() + Math.random(),
          type: 'audit',
          title: 'Audyt zakończony sukcesem',
          description: 'Audyt kontrolny nie wykazał nieprawidłowości. Ryzyko kolejnych kontroli tymczasowo zmniejszone.',
          severity: 'positive',
          turn: gameState.turn,
          expires: gameState.turn + 10
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
      
      // Dodajemy wydarzenie
      eventsDispatch({
        type: 'ADD_EVENT',
        payload: {
          id: Date.now() + Math.random(),
          type: 'audit',
          title: 'Audyt wykazał nieprawidłowości',
          description: `Kontrola wykazała naruszenie przepisów. Nałożono karę w wysokości ${totalFine.toLocaleString()} zł i utracono ${reputationLoss} punktów reputacji.`,
          severity: 'negative',
          turn: gameState.turn,
          expires: gameState.turn + 15,
          fine: totalFine
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
      
      // Znajdujemy przypisanego developera
      const developer = assignedStaff.developer 
        ? playerState.staff.developers?.find(d => d.id === assignedStaff.developer)
        : null;
      
      // Bazowy postęp zależny od umiejętności developera
      let progressIncrement = developer ? 1 + (developer.skill / 10) : 1;
      
      // Modyfikatory postępu w zależności od etapu i przypisanych pracowników
      switch(project.status) {
        case 'land_acquisition':
          // Znajdujemy przypisanego skauta
          const scout = assignedStaff.scout
            ? playerState.staff.scouts?.find(s => s.id === assignedStaff.scout)
            : null;
          
          if (scout) {
            // Skauti znacząco przyspieszają pozyskiwanie gruntów
            progressIncrement += scout.skill / 5; // Bonus od 0.2 do 2.0 punktów
            
            // Jeśli scout ma specjalizację "land_acquisition", dajemy dodatkowy bonus
            if (scout.specialization === "land_acquisition") {
              progressIncrement *= 1.5;
            }
          }
          break;
          
        case 'environmental_decision':
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
          // Znajdujemy przypisanego prawnika
          const lawyer = assignedStaff.lawyer
            ? playerState.staff.lawyers?.find(l => l.id === assignedStaff.lawyer)
            : null;
          
          // Znajdujemy przypisanego lobbystę
          const lobbyist = assignedStaff.lobbyist
            ? playerState.staff.lobbyists?.find(l => l.id === assignedStaff.lobbyist)
            : null;
          
          if (lawyer) {
            // Prawnicy przyspieszają uzyskiwanie warunków zabudowy
            progressIncrement += lawyer.skill / 7;
            
            // Specjalizacja w obszarze zoning_conditions
            if (lawyer.specialization === "zoning") {
              progressIncrement *= 1.4;
            }
          }
          
          if (lobbyist) {
            // Lobbyści pomagają w uzyskiwaniu warunków zabudowy poprzez naciski
            progressIncrement += lobbyist.skill / 8;
          }
          break;
          
        case 'grid_connection':
          // Znajdujemy przypisanego lobbystę
          const gridLobbyist = assignedStaff.lobbyist
            ? playerState.staff.lobbyists?.find(l => l.id === assignedStaff.lobbyist)
            : null;
          
          // Znajdujemy przypisanego prawnika
          const gridLawyer = assignedStaff.lawyer
            ? playerState.staff.lawyers?.find(l => l.id === assignedStaff.lawyer)
            : null;
          
          if (gridLobbyist) {
            // Lobbyści znacząco przyspieszają przyłączenie do sieci
            progressIncrement += gridLobbyist.skill / 6;
            
            // Specjalizacja w grid_connection
            if (gridLobbyist.specialization === "grid") {
              progressIncrement *= 1.6;
            }
          }
          
          if (gridLawyer) {
            // Prawnicy pomagają z dokumentacją przyłączeniową
            progressIncrement += gridLawyer.skill / 10;
          }
          break;
          
        default:
          // Domyślny przypadek - brak dodatkowych modyfikatorów
          break;
      }
      
      // Jeśli developer ma odpowiednią specjalizację dla bieżącego etapu, dajemy dodatkowy bonus
      if (developer) {
        const stageToSpecialization = {
          'land_acquisition': 'acquisition',
          'environmental_decision': 'environmental',
          'zoning_conditions': 'zoning',
          'grid_connection': 'grid'
        };
        
        if (developer.specialization === stageToSpecialization[project.status]) {
          progressIncrement *= 1.3; // 30% bonus za odpowiednią specjalizację
        }
      }
      
      // Wpływ reputacji na postęp
      const reputationMultiplier = 1 / getReputationTimeMultiplier(playerState.reputation);
      progressIncrement *= reputationMultiplier;
      
      // Wpływ działań niejawnych (jeśli użyte)
      const illegalMultiplier = getIllegalActionMultiplier(project, playerState);
      progressIncrement *= illegalMultiplier;
      
      // Aktualizujemy postęp projektu
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
        
        // Dodajemy wydarzenie
        eventsContextDispatch({
          type: 'ADD_EVENT',
          payload: {
            id: Date.now() + Math.random(),
            type: 'illegal_activity',
            title: 'Wykrycie nielegalnych działań',
            description: `W projekcie ${project.name} wykryto nielegalne działania, co wpłynęło negatywnie na reputację firmy.`,
            severity: 'negative',
            turn: gameState.turn,
            expires: gameState.turn + 10,
            projectId: project.id
          }
        });
      }
    });
    
    // Sprawdzamy, czy powinniśmy wyzwolić audit
    if (shouldTriggerAudit(playerState, gameState)) {
      performAudit(playerState, gameState, playerDispatch, eventsContextDispatch);
    }
  }, [getReputationTimeMultiplier, getIllegalActionMultiplier, shouldTriggerAudit, performAudit]);

  /**
   * Generowanie wydarzeń związanych z pracownikami
   * 
   * @param {Object} playerState - Stan gracza
   * @param {Object} gameState - Stan gry
   * @param {Function} playerDispatch - Funkcja dispatch gracza
   * @param {Function} eventsDispatch - Funkcja dispatch wydarzeń
   */
  const generateStaffEvents = useCallback((playerState, gameState, playerDispatch, eventsDispatch) => {
    if (!playerState || !gameState) return;
    
    // Aktualizujemy tylko, gdy zmienia się tura (co dwa dni)
    if (gameState.day % 2 !== 0) return;
    
    // Przechodzimy przez wszystkie kategorie pracowników
    Object.keys(playerState.staff).forEach(staffType => {
      const staffList = playerState.staff[staffType];
      if (!staffList || !Array.isArray(staffList) || staffList.length === 0) return;
      
      staffList.forEach(staff => {
        // Szansa na zdarzenie: 5% na turę
        if (Math.random() < 0.05) {
          const event = generateStaffEvent(staff);
          if (event) {
            // Dodajemy wydarzenie do systemu wydarzeń
            eventsDispatch({
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
      });
    });
  }, []);

  /**
   * Generuje globalne wydarzenia ekonomiczne
   * @param {Object} playerState - Stan gracza
   * @param {Object} gameState - Stan gry
   * @param {Function} gameDispatch - Funkcja dispatch gry
   * @param {Function} eventsDispatch - Funkcja dispatch wydarzeń
   */
  const generateEconomicEvents = useCallback((playerState, gameState, gameDispatch, eventsDispatch) => {
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
      eventsDispatch({
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

  return {
    updateProjects,
    generateStaffEvents,
    generateEconomicEvents,
    getReputationCostMultiplier,
    getReputationTimeMultiplier,
    getIllegalActionMultiplier,
    shouldTriggerAudit,
    performAudit
  };
};

export default useGameDay; 