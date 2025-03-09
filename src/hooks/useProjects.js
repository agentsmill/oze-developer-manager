import { useCallback } from "react";
import { usePlayerContext } from "../store/PlayerContext";
import { useRegionsContext } from "../store/RegionContext";
import { useCountyContext } from "../store/CountyContext";
import { useGameContext } from "../store/GameContext";
import { useEventsContext } from "../store/EventContext";
import { createProject } from "../data/technologies";
import { translateStage } from "../utils/translators";

// Maksymalna liczba projektów na jednego pozyskiwacza
const MAX_PROJECTS_PER_SCOUT = 10;

export const useProjects = () => {
  const { state: player, dispatch: playerDispatch } = usePlayerContext();
  const { state: regions, dispatch: regionsDispatch } = useRegionsContext();
  const { state: counties, dispatch: countyDispatch } = useCountyContext();
  const { state: gameState, dispatch: gameDispatch, showNotification } = useGameContext();
  const { dispatch: eventsDispatch } = useEventsContext();

  // Sprawdza, ile projektów obsługuje dany pozyskiwacz
  const getScoutProjectCount = useCallback((scoutId) => {
    return player.projects.filter(p => p.assignedScout === scoutId).length;
  }, [player.projects]);

  // Znajduje pozyskiwacza z najmniejszą liczbą przypisanych projektów
  const findLeastBusyScout = useCallback(() => {
    const scouts = player.staff.scouts;
    if (scouts.length === 0) return null;

    let leastBusyScout = null;
    let minProjects = Infinity;

    for (const scout of scouts) {
      const projectCount = getScoutProjectCount(scout.id);
      if (projectCount < minProjects) {
        minProjects = projectCount;
        leastBusyScout = scout;
      }
    }

    // Sprawdź, czy pozyskiwacz nie ma już maksymalnej liczby projektów
    if (minProjects >= MAX_PROJECTS_PER_SCOUT) {
      return null;
    }

    return leastBusyScout;
  }, [player.staff.scouts, getScoutProjectCount]);

  // Rozpocznij nowy projekt
  const startNewProject = useCallback(
    (regionId, technology = "PV", countyId = null) => {
      const region = regions.find((r) => r.id === regionId);
      if (!region) return null;

      // Sprawdzenie czy gracz ma wystarczających pozyskiwaczy i developerów
      if (
        player.staff.scouts.length === 0 ||
        player.staff.developers.length === 0
      ) {
        showNotification('Potrzebujesz zatrudnić przynajmniej jednego pozyskiwacza i jednego developera!', 'error');
        return null;
      }

      // Sprawdź, czy jest dostępny pozyskiwacz, który może obsłużyć nowy projekt
      const availableScout = findLeastBusyScout();
      if (!availableScout) {
        showNotification('Wszyscy twoi pozyskiwacze obsługują już maksymalną liczbę projektów (10). Zatrudnij więcej pozyskiwaczy!', 'error');
        return null;
      }

      // Tworzenie nowego projektu
      const newProject = createProject(technology, regionId, {
        turn: gameState.turn,
        countyId: countyId // Dodajemy ID powiatu, jeśli został wybrany
      });

      // Przydzielamy pozyskiwacza do projektu
      newProject.assignedScout = availableScout.id;

      // Jeśli projekt jest tworzony w powiecie, używamy jego parametrów
      let landCost = 0;
      let countyModifier = 1.0;
      
      if (countyId) {
        const county = counties.find(
          c => c.voivodeship === regionId && c.id === countyId
        );
        
        if (county) {
          // Używamy parametrów powiatu do obliczenia kosztu gruntu
          countyModifier = county.propertyPrices;
          
          // Sprawdzamy, czy w powiecie jest wystarczająca ilość gruntów
          if (county.availableLand < newProject.size) {
            showNotification(`W tym powiecie nie ma wystarczającej ilości gruntów na projekt o mocy ${newProject.power} MW!`, 'error');
            return null;
          }
          
          // Sprawdzamy, czy w powiecie jest wystarczająca moc przyłączeniowa
          if (county.gridCapacity < newProject.power) {
            showNotification(`W tym powiecie nie ma wystarczającej mocy przyłączeniowej dla projektu o mocy ${newProject.power} MW!`, 'error');
            return null;
          }
          
          // Dodajemy informacje o powiecie do projektu
          newProject.county = {
            id: county.id,
            name: county.name,
            voivodeship: county.voivodeship
          };
          
          // Uwzględniamy warunki lokalne w koszcie i harmonogramie projektu
          if (technology === "PV") {
            // Dla fotowoltaiki uwzględniamy przede wszystkim potencjał słoneczny
            newProject.productionFactor = county.solarPotential / 100;
          } else if (technology === "WF") {
            // Dla elektrowni wiatrowych uwzględniamy przede wszystkim potencjał wiatrowy
            newProject.productionFactor = county.windPotential / 100;
          }
          
          // Wpływ ograniczeń środowiskowych na czas realizacji projektu
          const environmentalDelayFactor = 1 + (county.environmentalRestrictions / 100) * 0.5;
          newProject.environmentalDelayFactor = environmentalDelayFactor;
          
          // Wpływ lokalnej opozycji na czas realizacji
          const oppositionDelayFactor = 1 + (county.localOpposition / 100) * 0.3;
          newProject.oppositionDelayFactor = oppositionDelayFactor;
          
          // Wpływ efektywności administracji na czas realizacji
          const administrationEfficiencyFactor = 2 - (county.administrativeEfficiency / 100);
          newProject.administrationEfficiencyFactor = administrationEfficiencyFactor;
          
          // Całkowity modyfikator czasu projektu
          newProject.totalDelayFactor = (environmentalDelayFactor + oppositionDelayFactor + administrationEfficiencyFactor) / 3;
        }
      }
      
      // Koszt pozyskania gruntu
      landCost = newProject.etapCosts.land_acquisition * countyModifier;
      newProject.etapCosts.land_acquisition = landCost;
      newProject.totalCost = 0; // Początkowo nie ma żadnych kosztów, dzierżawa jest płacona później
      
      // Aktualizacja parametrów formalnych
      newProject.formalParams = {
        leaseAgreement: {
          period: 29 + Math.floor(Math.random() * 2), // 29-30 lat
          annualRent: Math.floor(30000 + Math.random() * 20000), // 30-50 tys zł/ha
          securityDeposit: Math.floor(newProject.power * 30000), // 30 tys zł/MW
        },
        dueDiligenceCost: Math.floor(15000 + Math.random() * 10000), // 15-25 tys zł
        // Dodajemy flagę użycia nielegalnych metod, domyślnie false
        useIllegalMethods: false,
      };
      
      // Etapy płatności
      newProject.etapPaid = {
        land_acquisition: false, // Dzierżawa nie jest płacona na początku
        environmental_decision: false,
        zoning_conditions: false,
        grid_connection: false,
        construction: false,
      };

      // Sprawdzenie czy gracz ma wystarczające środki
      if (player.cash < landCost) {
        showNotification(`Nie masz wystarczających środków! Potrzebujesz ${landCost.toLocaleString()} PLN.`, 'error');
        return null;
      }

      // Aktualizacja stanu gracza
      playerDispatch({
        type: "ADD_PROJECT",
        payload: newProject,
      });

      // Aktualizacja stanu regionu
      regionsDispatch({
        type: "ADD_PROJECT_TO_REGION",
        payload: {
          regionId,
          project: newProject,
        },
      });
      
      // Jeśli projekt jest w powiecie, aktualizujemy dane powiatu
      if (countyId) {
        countyDispatch({
          type: "ADD_PROJECT_TO_COUNTY",
          payload: {
            voivodeship: regionId,
            countyId,
            project: newProject,
          },
        });
      }

      // Aktualizacja kasy gracza
      playerDispatch({
        type: "UPDATE_CASH",
        payload: -landCost,
      });

      // Powiadomienie
      showNotification(`Rozpoczęto nowy projekt: ${newProject.name} (${newProject.power} MW)`, 'success');

      return newProject.id;
    },
    [player, regions, counties, gameState, playerDispatch, regionsDispatch, countyDispatch, gameDispatch]
  );

  // Przejdź do następnego etapu projektu
  const advanceProject = useCallback(
    (projectId) => {
      const project = player.projects.find((p) => p.id === projectId);
      if (!project || project.status === "ready_to_build") return false;

      // Etapy projektu
      const stages = [
        "land_acquisition",
        "environmental_decision",
        "zoning_conditions",
        "grid_connection",
        "ready_to_build", // Usuwamy etap "construction" - nie wchodzimy w fazę EPC
      ];

      // Indeks aktualnego etapu
      const currentStageIndex = stages.indexOf(project.status);

      // Następny etap
      const nextStage = stages[currentStageIndex + 1];

      // Koszt następnego etapu
      const stageCost = project.etapCosts[nextStage] || 0;

      // Koszt dzierżawy (płatność po zakończeniu etapu land_acquisition)
      const landAcquisitionCost = project.status === "land_acquisition" ? project.etapCosts.land_acquisition : 0;
      const totalCost = stageCost + landAcquisitionCost;

      // Sprawdzenie środków
      if (player.cash < totalCost) {
        showNotification(`Nie masz wystarczających środków! Potrzebujesz ${totalCost.toLocaleString()} PLN.`, 'error');
        return false;
      }

      // Aktualizacja projektu
      playerDispatch({
        type: "UPDATE_PROJECT",
        payload: {
          id: projectId,
          changes: {
            status: nextStage,
            statusIndex: currentStageIndex + 1,
            progress: 0,
            etapPaid: {
              ...project.etapPaid,
              [nextStage]: true,
              land_acquisition: true, // Oznaczamy, że dzierżawa została opłacona
            },
            totalCost: project.totalCost + totalCost,
            events: [
              ...project.events,
              {
                turn: gameState.turn,
                text: `Rozpoczęto etap: ${translateStage(nextStage)}${landAcquisitionCost > 0 ? ` i opłacono dzierżawę (${landAcquisitionCost.toLocaleString()} PLN)` : ''}`,
              },
            ],
          },
        },
      });

      // Aktualizacja kasy
      playerDispatch({
        type: "UPDATE_CASH",
        payload: -totalCost,
      });
      
      // Aktualizacja całkowitego kosztu projektu
      playerDispatch({
        type: "UPDATE_PROJECT_TOTAL_COST",
        payload: {
          projectId: project.id,
          cost: totalCost
        }
      });

      // Aktualizacja mocy RTB
      if (nextStage === "ready_to_build") {
        // Aktualizujemy moc RTB w kontekście gracza
        playerDispatch({
          type: "UPDATE_RTB_POWER",
          payload: project.power,
        });
        
        // Aktualizujemy moc RTB w celach gry
        gameDispatch({
          type: "UPDATE_GAME_GOALS",
          payload: {
            currentRtbPower: gameState.gameGoals.currentRtbPower + project.power,
          },
        });
        
        // Jeśli projekt został zrealizowany legalnie, zwiększamy reputację
        if (!project.useIllegalMethods) {
          playerDispatch({
            type: "UPDATE_REPUTATION",
            payload: {
              change: 10, // +10 punktów reputacji za legalny projekt RTB
              reason: `Ukończenie projektu ${project.name} zgodnie z przepisami`,
              turn: gameState.turn
            }
          });
          
          showNotification(`Wzrost reputacji (+10) za ukończenie projektu ${project.name} zgodnie z przepisami.`, 'success');
        }
      }

      // Powiadomienie
      showNotification(`Projekt ${project.name} przeszedł do etapu ${translateStage(nextStage)}!`, 'success');

      return true;
    },
    [player, gameState, playerDispatch, gameDispatch]
  );
  
  // Przyspiesz projekt za dodatkową opłatą
  const accelerateProject = useCallback(
    (projectId, amount = null) => {
      const project = player.projects.find(p => p.id === projectId);
      if (!project) {
        showNotification('Nie znaleziono projektu', 'error');
        return false;
      }
      
      // Jeśli projekt jest już w fazie RTB, nie można go przyspieszyć
      if (project.status === 'ready_to_build') {
        showNotification('Projekt jest już gotowy do budowy', 'warning');
        return false;
      }
      
      // Obliczamy koszt przyspieszenia - 10% wartości projektu lub podana kwota
      const baseValue = project.power * 50000; // Podstawowa wartość projektu
      const accelerationCost = amount || Math.round(baseValue * 0.1);
      
      // Sprawdzamy, czy gracz ma wystarczająco pieniędzy
      if (player.cash < accelerationCost) {
        showNotification('Niewystarczająca ilość gotówki', 'error');
        return false;
      }
      
      // Obliczamy postęp, który zostanie dodany - zależny od kwoty
      // Bazowo 20% postępu za 10% wartości projektu
      const progressGain = Math.min(30, Math.round((accelerationCost / baseValue) * 200));
      
      // Aktualizacja projektu
      playerDispatch({
        type: 'UPDATE_PROJECT',
        payload: {
          id: projectId,
          changes: {
            progress: Math.min(100, (project.progress || 0) + progressGain),
            events: [
              ...project.events,
              {
                turn: gameState.turn,
                text: `Przyspieszono projekt o ${progressGain}% za ${accelerationCost.toLocaleString()} PLN`,
              },
            ],
          },
        },
      });
      
      // Aktualizacja kasy
      playerDispatch({
        type: 'UPDATE_CASH',
        payload: -accelerationCost,
      });
      
      // Aktualizacja całkowitego kosztu projektu
      playerDispatch({
        type: 'UPDATE_PROJECT_TOTAL_COST',
        payload: {
          projectId: project.id,
          cost: accelerationCost
        }
      });
      
      showNotification(`Przyspieszono projekt o ${progressGain}% za ${accelerationCost.toLocaleString()} PLN`, 'success');
      return true;
    },
    [player, gameState, playerDispatch, showNotification]
  );
  
  // Wystaw projekt na rynek
  const sendProjectToMarket = useCallback(
    (projectId, price = null) => {
      const project = player.projects.find(p => p.id === projectId);
      if (!project) {
        showNotification('Nie znaleziono projektu', 'error');
        return false;
      }
      
      // Tylko projekty RTB mogą być wystawione na rynek
      if (project.status !== 'ready_to_build') {
        showNotification('Tylko projekty gotowe do budowy mogą być wystawione na rynek', 'warning');
        return false;
      }
      
      // Obliczamy sugerowaną cenę projektu
      const baseValue = project.power * 150000; // Wartość projektu RTB
      const suggestedPrice = price || baseValue;
      
      // Wysyłamy akcję do reducera
      playerDispatch({
        type: 'SEND_PROJECT_TO_MARKET',
        payload: {
          projectId,
          price: suggestedPrice
        }
      });
      
      showNotification(`Projekt "${project.name}" został wystawiony na rynek za ${suggestedPrice.toLocaleString()} PLN`, 'success');
      return true;
    },
    [player, playerDispatch, showNotification]
  );
  
  // Użyj nielegalnych metod do przyspieszenia projektu
  const applyIllegalMethod = useCallback(
    (projectId, method = 'bribery') => {
      const project = player.projects.find(p => p.id === projectId);
      if (!project) {
        showNotification('Nie znaleziono projektu', 'error');
        return false;
      }
      
      // Sprawdzamy, czy gracz ma wystarczającą reputację
      if (player.reputation < 120) {
        showNotification('Niewystarczająca reputacja do wykonania nielegalnych działań', 'error');
        return false;
      }
      
      // Koszty i efekty różnych metod
      const methods = {
        bribery: {
          cost: Math.round(project.power * 25000),
          progressGain: 25,
          reputationLoss: 10,
          riskOfExposure: 0.3
        },
        forgery: {
          cost: Math.round(project.power * 15000),
          progressGain: 15,
          reputationLoss: 15,
          riskOfExposure: 0.4
        },
        intimidation: {
          cost: Math.round(project.power * 10000),
          progressGain: 10,
          reputationLoss: 20,
          riskOfExposure: 0.5
        }
      };
      
      const selectedMethod = methods[method] || methods.bribery;
      
      // Sprawdzamy, czy gracz ma wystarczająco pieniędzy
      if (player.cash < selectedMethod.cost) {
        showNotification('Niewystarczająca ilość gotówki', 'error');
        return false;
      }
      
      // Sprawdzamy, czy akcja zostanie wykryta
      const isExposed = Math.random() < selectedMethod.riskOfExposure;
      
      // Aktualizacja projektu
      playerDispatch({
        type: 'UPDATE_PROJECT',
        payload: {
          id: projectId,
          changes: {
            progress: Math.min(100, (project.progress || 0) + selectedMethod.progressGain),
            useIllegalMethods: true,
            events: [
              ...project.events,
              {
                turn: gameState.turn,
                text: `Użyto nielegalnych metod (${method}) do przyspieszenia projektu o ${selectedMethod.progressGain}%`,
                isIllegal: true
              },
            ],
          },
        },
      });
      
      // Aktualizacja kasy
      playerDispatch({
        type: 'UPDATE_CASH',
        payload: -selectedMethod.cost,
      });
      
      // Aktualizacja reputacji, jeśli akcja została wykryta
      if (isExposed) {
        playerDispatch({
          type: 'UPDATE_REPUTATION',
          payload: {
            change: -selectedMethod.reputationLoss,
            reason: `Wykryto nielegalne działania w projekcie ${project.name}`
          }
        });
      }
      
      // Dodanie do historii nielegalnych działań
      playerDispatch({
        type: 'ADD_ILLEGAL_ACTION',
        payload: {
          type: method,
          target: project.name,
          cost: selectedMethod.cost,
          turn: gameState.turn,
          exposed: isExposed
        }
      });
      
      if (isExposed) {
        showNotification(`Twoje nielegalne działania zostały wykryte! Strata reputacji: ${selectedMethod.reputationLoss}`, 'error');
      } else {
        showNotification(`Użyto nielegalnych metod do przyspieszenia projektu o ${selectedMethod.progressGain}%`, 'success');
      }
      
      return true;
    },
    [player, gameState, playerDispatch, showNotification]
  );

  return {
    projects: player.projects,
    startNewProject,
    advanceProject,
    accelerateProject,
    sendProjectToMarket,
    applyIllegalMethod,
    translateStage,
  };
};
