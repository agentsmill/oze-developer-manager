import { useCallback } from "react";
import { usePlayerContext } from "../store/PlayerContext";
import { useRegionsContext } from "../store/RegionContext";
import { useCountyContext } from "../store/CountyContext";
import { useGameContext } from "../store/GameContext";
import { useEventsContext } from "../store/EventsContext";
import { createProject } from "../data/technologies";
import { translateStage } from "../utils/translators";

// Maksymalna liczba powiatów dla jednego dzierżawcy
const MAX_COUNTIES_PER_LESSOR = 5;

// Typy hybrydowych technologii
export const HYBRID_TECHNOLOGIES = {
  "PV+BESS": { name: "Hybrydowa PV z magazynem", baseTechnologies: ["PV", "BESS"] },
  "WF+BESS": { name: "Hybrydowa wiatrowa z magazynem", baseTechnologies: ["WF", "BESS"] },
  "PV+WF": { name: "Hybrydowa PV i wiatrowa", baseTechnologies: ["PV", "WF"] },
  "PV+WF+BESS": { name: "Hybrydowa PV, wiatrowa i magazyn", baseTechnologies: ["PV", "WF", "BESS"] }
};

export const useProjects = () => {
  const { state: player, dispatch: playerDispatch } = usePlayerContext();
  const { state: regions, dispatch: regionsDispatch } = useRegionsContext();
  const { state: counties, dispatch: countyDispatch } = useCountyContext();
  const { state: gameState, dispatch: gameDispatch, showNotification } = useGameContext();
  const { dispatch: eventsDispatch } = useEventsContext();

  // Sprawdza, ile powiatów obsługuje dany dzierżawca
  const getLessorCountyCount = useCallback((lessorId) => {
    // Sprawdzamy, w ilu powiatach jest przypisany dzierżawca
    let countyCount = 0;
    
    // Sprawdzamy miski dzierżawy w powiatach
    counties.forEach(county => {
      if (county.leasePools) {
        Object.values(county.leasePools).forEach(pool => {
          if (pool.lessors && pool.lessors.includes(lessorId)) {
            countyCount++;
          }
        });
      }
    });
    
    return countyCount;
  }, [counties]);

  // Znajduje dzierżawcę z najmniejszą liczbą przypisanych powiatów
  const findLeastBusyLessor = useCallback(() => {
    const lessors = player.staff.lessors;
    if (lessors.length === 0) return null;

    let leastBusyLessor = null;
    let minCounties = Infinity;

    for (const lessor of lessors) {
      const countyCount = getLessorCountyCount(lessor.id);
      if (countyCount < minCounties) {
        minCounties = countyCount;
        leastBusyLessor = lessor;
      }
    }

    // Sprawdź, czy dzierżawca nie ma już maksymalnej liczby powiatów
    if (minCounties >= MAX_COUNTIES_PER_LESSOR) {
      return null;
    }

    return leastBusyLessor;
  }, [player.staff.lessors, getLessorCountyCount]);

  // Sprawdza, czy dzierżawca ma specjalizację zgodną z daną technologią
  const hasMatchingSpecialization = useCallback((lessor, technology) => {
    if (!lessor || !lessor.specialization) return false;
    
    // Sprawdzamy, czy specjalizacja dzierżawcy pasuje do technologii
    const specialization = lessor.specialization.toLowerCase();
    
    if (technology === "PV" && specialization.includes("fotowoltaika")) {
      return true;
    } else if (technology === "WF" && specialization.includes("wiatrowe")) {
      return true;
    } else if (technology === "BESS" && specialization.includes("magazyn")) {
      return true;
    } else if (technology.includes("+") && specialization.includes("hybrydowe")) {
      // Sprawdzamy, czy mamy wszystkie technologie z hybrydowego projektu
      const techComponents = technology.split("+");
      
      if (technology === "PV+BESS" && specialization.includes("pv+bess")) {
        return true;
      } else if (technology === "WF+BESS" && specialization.includes("fw+bess")) {
        return true;
      } else if (technology === "PV+WF" && specialization.includes("pv+wf")) {
        return true;
      } else if (technology === "PV+WF+BESS" && specialization.includes("pv+wf+bess")) {
        return true;
      }
    }
    
    return false;
  }, []);

  // Funkcja inicjująca pulę dzierżawy w powiecie, jeśli nie istnieje
  const initializeLeasePool = useCallback((voivodeshipId, countyId, technology) => {
    const county = counties.find(c => c.voivodeship === voivodeshipId && c.id === countyId);
    if (!county) return false;
    
    // Jeśli powiat nie ma jeszcze puli dzierżawy, tworzymy ją
    if (!county.leasePools) {
      // Aktualizujemy powiat, dodając pule dzierżawy dla każdej technologii
      countyDispatch({
        type: "UPDATE_COUNTY",
        payload: {
          id: countyId,
          voivodeship: voivodeshipId,
          changes: {
            leasePools: {
              PV: { lessors: [], projects: [] },
              WF: { lessors: [], projects: [] },
              BESS: { lessors: [], projects: [] },
              "PV+BESS": { lessors: [], projects: [] },
              "WF+BESS": { lessors: [], projects: [] },
              "PV+WF": { lessors: [], projects: [] },
              "PV+WF+BESS": { lessors: [], projects: [] }
            }
          }
        }
      });
      return true;
    }
    
    // Jeśli powiat ma już pule dzierżawy, ale nie dla naszej technologii, dodajemy ją
    if (!county.leasePools[technology]) {
      const updatedLeasePools = { ...county.leasePools };
      updatedLeasePools[technology] = { lessors: [], projects: [] };
      
      countyDispatch({
        type: "UPDATE_COUNTY",
        payload: {
          id: countyId,
          voivodeship: voivodeshipId,
          changes: {
            leasePools: updatedLeasePools
          }
        }
      });
    }
    
    return true;
  }, [counties, countyDispatch]);

  // Przypisanie dzierżawcy do puli dzierżawy w powiecie
  const assignLessorToLeasePool = useCallback((lessorId, voivodeshipId, countyId, technology) => {
    const county = counties.find(c => c.voivodeship === voivodeshipId && c.id === countyId);
    if (!county || !county.leasePools || !county.leasePools[technology]) return false;
    
    // Sprawdzamy, czy dzierżawca jest już przypisany do tej puli
    if (county.leasePools[technology].lessors.includes(lessorId)) return true;
    
    // Aktualizujemy pulę dzierżawy
    const updatedLeasePools = { ...county.leasePools };
    updatedLeasePools[technology] = {
      ...updatedLeasePools[technology],
      lessors: [...updatedLeasePools[technology].lessors, lessorId]
    };
    
    countyDispatch({
      type: "UPDATE_COUNTY",
      payload: {
        id: countyId,
        voivodeship: voivodeshipId,
        changes: {
          leasePools: updatedLeasePools
        }
      }
    });
    
    return true;
  }, [counties, countyDispatch]);

  // Sprawdza, czy w powiecie jest dzierżawca dla danej technologii
  const hasLessorForTechnology = useCallback((voivodeshipId, countyId, technology) => {
    const county = counties.find(c => c.voivodeship === voivodeshipId && c.id === countyId);
    if (!county || !county.leasePools || !county.leasePools[technology]) return false;
    
    return county.leasePools[technology].lessors.length > 0;
  }, [counties]);

  // Znajduje dzierżawcę przypisanego do puli dzierżawy
  const findLessorForLeasePool = useCallback((voivodeshipId, countyId, technology) => {
    const county = counties.find(c => c.voivodeship === voivodeshipId && c.id === countyId);
    if (!county || !county.leasePools || !county.leasePools[technology]) return null;
    
    // Jeśli nie ma dzierżawców w puli, zwracamy null
    if (county.leasePools[technology].lessors.length === 0) return null;
    
    // Znajdujemy dzierżawcę ze specjalizacją pasującą do technologii
    const lessorId = county.leasePools[technology].lessors[0];
    return player.staff.lessors.find(l => l.id === lessorId);
  }, [counties, player.staff.lessors]);

  // Rozpocznij nowy projekt
  const startNewProject = useCallback(
    (regionId, technology = "PV", countyId = null) => {
      const region = regions.find((r) => r.id === regionId);
      if (!region) return null;

      // Sprawdzenie czy gracz ma wystarczających dzierżawców
      if (player.staff.lessors.length === 0) {
        showNotification('Potrzebujesz zatrudnić przynajmniej jednego dzierżawcę, aby rozpocząć projekt!', 'error');
        return null;
      }
      
      // Sprawdzenie czy wybrano powiat
      if (!countyId) {
        showNotification('Wybierz powiat, w którym chcesz rozpocząć projekt!', 'error');
        return null;
      }
      
      // Sprawdzenie czy istnieje pula dzierżawy dla wybranej technologii
      if (!initializeLeasePool(regionId, countyId, technology)) {
        showNotification('Nie udało się zainicjować puli dzierżawy dla powiatu!', 'error');
        return null;
      }
      
      // Sprawdzmy, czy w powiecie jest już dzierżawca dla tej technologii
      if (!hasLessorForTechnology(regionId, countyId, technology)) {
        // Nie ma dzierżawcy, więc przypisujemy nowego
        const availableLessor = findLeastBusyLessor();
        if (!availableLessor) {
          showNotification('Wszyscy twoi dzierżawcy obsługują już maksymalną liczbę powiatów (5). Zatrudnij więcej dzierżawców!', 'error');
          return null;
        }
        
        // Przypisujemy dzierżawcę do puli dzierżawy
        if (!assignLessorToLeasePool(availableLessor.id, regionId, countyId, technology)) {
          showNotification('Nie udało się przypisać dzierżawcy do puli dzierżawy!', 'error');
          return null;
        }
        
        // Sprawdzamy, czy dzierżawca ma odpowiednią specjalizację
        if (!hasMatchingSpecialization(availableLessor, technology)) {
          showNotification(`Dzierżawca ${availableLessor.name} nie ma specjalizacji pasującej do technologii ${technology}. Efektywność dzierżawy będzie niższa.`, 'warning');
        }
      }
      
      // Znajdujemy dzierżawcę dla projektu
      const projectLessor = findLessorForLeasePool(regionId, countyId, technology);
      
      // Tworzenie nowego projektu
      const newProject = createProject(technology, regionId, {
        turn: gameState.turn,
        countyId: countyId
      });

      // Dane powiatu
      const county = counties.find(c => c.voivodeship === regionId && c.id === countyId);
      if (!county) {
        showNotification('Nie znaleziono powiatu!', 'error');
        return null;
      }
      
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
      
      // Dodajemy informacje o technologii (zachowanie kompatybilności wstecznej)
      newProject.technology = technology;
      
      // Dla projektów hybrydowych dodajemy dodatkowe informacje
      if (technology.includes("+")) {
        newProject.isHybrid = true;
        newProject.hybridComponents = technology.split("+");
      } else {
        newProject.isHybrid = false;
        newProject.hybridComponents = [technology];
      }
      
      // Uwzględniamy warunki lokalne w koszcie i harmonogramie projektu
      if (technology.includes("PV")) {
        // Dla projektów zawierających fotowoltaikę uwzględniamy potencjał słoneczny
        newProject.productionFactor = county.solarPotential / 100;
      } else if (technology.includes("WF")) {
        // Dla projektów wiatrowych uwzględniamy potencjał wiatrowy
        newProject.productionFactor = county.windPotential / 100;
      } else if (technology === "BESS") {
        // Dla magazynów energii potencjał produkcyjny jest stały
        newProject.productionFactor = 1.0;
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
      
      // Obliczanie odległości od stacji transformatorowej (losowo)
      const distanceToTransformer = Math.floor(Math.random() * 10) + 1; // 1-10 km
      
      // Modyfikacja stawki dzierżawy w zależności od odległości od stacji transformatorowej
      // Każdy dodatkowy km obniża stawkę o 500-1000 zł/ha/rok
      const distanceDiscount = Math.min(distanceToTransformer * (500 + Math.random() * 500), 10000 * 0.7);
      const adjustedLeaseRate = Math.max(10000 - distanceDiscount, 10000 * 0.3);
      
      // Uwzględniamy modyfikator cen w powiecie
      const finalLeaseRate = adjustedLeaseRate * county.propertyPrices;
      
      // Aktualizujemy koszt dzierżawy
      const landCost = Math.round(finalLeaseRate * newProject.size);
      newProject.etapCosts.land_acquisition = landCost;
      
      // Dodajemy informacje o dzierżawie
      newProject.leaseDetails = {
        baseRate: 10000,
        adjustedRate: finalLeaseRate,
        distanceToTransformer: distanceToTransformer,
        hasIndexationClause: Math.random() < 0.7, // 70% umów ma klauzule indeksacyjne
        securityDeposit: Math.floor((30000 + Math.random() * 20000) * newProject.power), // 30-50 tys zł/MW
      };
      
      // Struktura przypisanych pracowników
      newProject.assignedStaff = {};
      
      // Etapy płatności
      newProject.etapPaid = {
        land_acquisition: false, // Dzierżawa nie jest płacona na początku
        environmental_decision: false,
        zoning_conditions: false,
        grid_connection: false,
        construction: false,
      };
      
      // Dodajemy projekt do listy projektów gracza
      playerDispatch({
        type: "ADD_PROJECT",
        payload: newProject,
      });
      
      // Dodajemy projekt do regionu
      regionsDispatch({
        type: "ADD_PROJECT_TO_REGION",
        payload: {
          regionId,
          project: {
            id: newProject.id,
            name: newProject.name,
            power: newProject.power,
            status: newProject.status,
            technology: newProject.technology,
          },
        },
      });
      
      // Dodajemy projekt do powiatu
      countyDispatch({
        type: "ADD_PROJECT_TO_COUNTY",
        payload: {
          countyId,
          voivodeship: regionId,
          project: {
            id: newProject.id,
            name: newProject.name,
            size: newProject.size,
            power: newProject.power,
            technology: newProject.technology,
          },
        },
      });
      
      // Aktualizujemy pulę dzierżawy
      const county2 = counties.find(c => c.voivodeship === regionId && c.id === countyId);
      if (county2 && county2.leasePools && county2.leasePools[technology]) {
        const updatedLeasePools = { ...county2.leasePools };
        updatedLeasePools[technology] = {
          ...updatedLeasePools[technology],
          projects: [...updatedLeasePools[technology].projects, newProject.id]
        };
        
        countyDispatch({
          type: "UPDATE_COUNTY",
          payload: {
            id: countyId,
            voivodeship: regionId,
            changes: {
              leasePools: updatedLeasePools
            }
          }
        });
      }
      
      // Powiadomienie o sukcesie
      showNotification(`Rozpoczęto nowy projekt ${newProject.name} w powiecie ${county.name}`, 'success');
      
      return newProject;
    },
    [
      player, 
      regions, 
      counties, 
      gameState, 
      playerDispatch, 
      regionsDispatch, 
      countyDispatch, 
      showNotification, 
      findLeastBusyLessor, 
      hasMatchingSpecialization, 
      initializeLeasePool, 
      hasLessorForTechnology, 
      assignLessorToLeasePool, 
      findLessorForLeasePool
    ]
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
      
      // Sprawdzamy, czy mamy developera dla etapów po dzierżawie
      if (currentStageIndex === 0) { // Kończymy etap land_acquisition
        // Developer jest wymagany do przejścia do kolejnych etapów
        if (player.staff.developers.length === 0) {
          showNotification('Potrzebujesz zatrudnić przynajmniej jednego developera, aby przejść do kolejnych etapów!', 'error');
          return false;
        }
        
        // Automatycznie przydzielamy najlepszego developera
        const bestDeveloper = [...player.staff.developers].sort((a, b) => b.skill - a.skill)[0];
        
        // Aktualizujemy projekt, dodając developera
        playerDispatch({
          type: 'UPDATE_PROJECT',
          payload: {
            id: projectId,
            changes: {
              assignedStaff: {
                ...(project.assignedStaff || {}),
                developer: bestDeveloper.id
              }
            }
          }
        });
        
        showNotification(`Developer ${bestDeveloper.name} został przypisany do projektu.`, 'info');
      }

      // Koszty w oparciu o specyfikację podaną przez użytkownika
      let stageCost = 0;
      
      // Pobieramy wielkość projektu w MW
      const projectMW = project.power;
      
      // Kalkulacja kosztów na podstawie specyfikacji
      switch (nextStage) {
        case "environmental_decision":
          // Due Diligence i Analizy Wstępne (minimalnie 15 000 zł)
          // Testy geotechniczne i hydrologiczne (minimalnie 10 000 zł)
          // Pomiary nasłonecznienia (5 000 zł/miesiąc)
          // Analiza zdolności przyłączeniowej (minimalnie 5 000 zł)
          stageCost = Math.max(
            15000 + Math.floor(Math.random() * 10000), // Due Diligence
            15000 * projectMW
          ) + 10000 + (5000 * 6) + 5000; // Stałe koszty + 6 miesięcy pomiarów
          break;
          
        case "zoning_conditions":
          // Warunki zabudowy - minimalny koszt 30 000 zł
          stageCost = Math.max(30000, 30000 * projectMW);
          break;
          
        case "grid_connection":
          // Warunki przyłączenia - minimalny koszt 120 000 zł
          // Zaliczka przyłączeniowa: 30 zł/kW (maks. 3 mln zł)
          stageCost = Math.max(120000, 120000 * projectMW) + Math.min(30000 * projectMW, 3000000);
          break;
          
        case "ready_to_build":
          // Decyzja środowiskowa OOŚ - minimalnie 80 000 zł
          // Pozwolenie na budowę - minimalnie 40 000 zł
          // Linia SN (średniego napięcia) - minimalnie 150 000 zł/km (przyjmujemy średnio 2 km)
          const lineLengthKm = 2; // Standardowo 2 km linii SN
          stageCost = 80000 + 40000 + (150000 * lineLengthKm);
          break;
      }

      // Koszt dzierżawy gruntu (płatność po zakończeniu etapu land_acquisition)
      const landAcquisitionCost = project.status === "land_acquisition" 
        ? project.etapCosts.land_acquisition 
        : 0;
      
      // Uwzględniamy kaucję gwarancyjną dla dzierżawy gruntu
      let securityDeposit = 0;
      if (project.status === "land_acquisition" && project.leaseDetails?.securityDeposit) {
        securityDeposit = project.leaseDetails.securityDeposit;
      }
      
      const totalCost = stageCost + landAcquisitionCost + securityDeposit;

      // Sprawdzenie środków
      if (player.cash < totalCost) {
        showNotification(
          `Nie masz wystarczających środków! Potrzebujesz ${totalCost.toLocaleString()} PLN.`, 
          'error'
        );
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
      let notificationText = `Projekt ${project.name} przeszedł do etapu ${translateStage(nextStage)}!`;
      if (landAcquisitionCost > 0) {
        notificationText += ` Opłacono dzierżawę: ${landAcquisitionCost.toLocaleString()} PLN.`;
      }
      if (securityDeposit > 0) {
        notificationText += ` Wpłacono kaucję: ${securityDeposit.toLocaleString()} PLN.`;
      }
      
      showNotification(notificationText, 'success');

      return true;
    },
    [player, gameState, playerDispatch, gameDispatch, showNotification]
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
      
      // Obliczamy koszt przyspieszenia w zależności od etapu
      let accelerationCost = 0;
      let progressGain = 0;
      
      switch (project.status) {
        case "land_acquisition":
          // Przyspieszenie dzierżawy - "szybka ścieżka" negocjacji
          accelerationCost = amount || Math.round(5000 * project.size); // 5000 zł/ha
          progressGain = Math.min(50, Math.round((accelerationCost / (5000 * project.size)) * 50));
          break;
          
        case "environmental_decision":
          // Przyspieszenie decyzji środowiskowej - dodatkowe analizy i ekspertyzy
          accelerationCost = amount || Math.max(50000, 10000 * project.power); // min. 50 000 zł lub 10 000 zł/MW
          progressGain = Math.min(40, Math.round((accelerationCost / (10000 * project.power)) * 40));
          break;
          
        case "zoning_conditions":
          // Przyspieszenie warunków zabudowy - dodatkowe konsultacje
          accelerationCost = amount || Math.max(30000, 7000 * project.power); // min. 30 000 zł lub 7 000 zł/MW
          progressGain = Math.min(35, Math.round((accelerationCost / (7000 * project.power)) * 35));
          break;
          
        case "grid_connection":
          // Przyspieszenie przyłączenia - opłata za priorytetowe rozpatrywanie wniosku
          accelerationCost = amount || Math.max(80000, 15000 * project.power); // min. 80 000 zł lub 15 000 zł/MW
          progressGain = Math.min(30, Math.round((accelerationCost / (15000 * project.power)) * 30));
          break;
      }
      
      // Sprawdzamy, czy gracz ma wystarczająco pieniędzy
      if (player.cash < accelerationCost) {
        showNotification(`Niewystarczająca ilość gotówki. Potrzebujesz ${accelerationCost.toLocaleString()} PLN.`, 'error');
        return false;
      }
      
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
      
      showNotification(`Przyspieszono projekt ${project.name} o ${progressGain}%!`, 'success');
      
      return true;
    },
    [player, gameState, playerDispatch]
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
