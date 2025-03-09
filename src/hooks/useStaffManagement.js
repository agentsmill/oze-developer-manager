import { useState, useEffect, useCallback } from 'react';
import { usePlayerContext } from '../store/PlayerContext';
import { useGameContext } from '../store/GameContext';
import { translateStaffType, translateStaffLevel } from '../utils/translators';

/**
 * Hook do zarządzania kadrami
 * @returns {Object} - Obiekt z funkcjami i stanem do zarządzania kadrami
 */
const useStaffManagement = () => {
  const { state: playerState, dispatch: playerDispatch } = usePlayerContext();
  const { state: gameState, showNotification } = useGameContext();
  const [staffEvents, setStaffEvents] = useState([]);

  // Parametry dla różnych poziomów umiejętności
  const skillLevels = {
    junior: { minSkill: 1, maxSkill: 3, salaryMultiplier: 1 },
    mid: { minSkill: 4, maxSkill: 7, salaryMultiplier: 1.5 },
    senior: { minSkill: 8, maxSkill: 10, salaryMultiplier: 2.2 }
  };
  
  // Bazowe wynagrodzenie dla różnych typów pracowników
  const baseSalaries = {
    scout: 2500, // 2.5k zł
    developer: 3000, // 3k zł
    lawyer: 0, // Jednorazowa opłata
    envSpecialist: 0, // Jednorazowa opłata
    lobbyist: 5000 // 5k zł
  };
  
  // Koszt jednorazowego wynajęcia specjalistów
  const specialistCosts = {
    lawyer: 30000000, // 30 mln zł
    envSpecialist: 25000000 // 25 mln zł
  };

  // Efekt do generowania zdarzeń pracowników co turę
  const generateStaffEventsCallback = useCallback(() => {
    if (gameState.turn > 1) {
      generateStaffEvents();
    }
  }, [gameState.turn]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    generateStaffEventsCallback();
  }, [generateStaffEventsCallback]);

  /**
   * Funkcja do zatrudniania pracownika
   * @param {string} staffType - Typ pracownika (scout, developer, lawyer, envSpecialist, lobbyist)
   * @param {string} level - Poziom pracownika (junior, mid, senior)
   * @returns {boolean} - Czy udało się zatrudnić pracownika
   */
  const hireStaff = (staffType, level = 'junior') => {
    // Obliczamy wynagrodzenie i koszt zatrudnienia
    const level_data = skillLevels[level];
    const baseSalary = baseSalaries[staffType];
    const monthlySalary = Math.floor(baseSalary * level_data.salaryMultiplier);
    
    // Dla prawników i specjalistów ds. środowiska jest to opłata jednorazowa
    const hireCost = (staffType === 'lawyer' || staffType === 'envSpecialist') 
      ? specialistCosts[staffType]
      : monthlySalary * 2; // Koszt zatrudnienia = 2 miesiące wynagrodzenia
    
    // Sprawdzamy czy gracz ma wystarczające środki
    if (playerState.cash < hireCost) {
      showNotification(`Nie masz wystarczających środków! Potrzebujesz ${hireCost.toLocaleString()} PLN.`, 'error');
      return false;
    }
    
    // Tworzymy nowego pracownika
    const newStaffId = Date.now();
    const skill = Math.floor(level_data.minSkill + Math.random() * (level_data.maxSkill - level_data.minSkill + 1));
    
    const newStaff = {
      id: newStaffId,
      type: staffType,
      name: generateStaffName(), // Funkcja generująca imię i nazwisko
      skill: skill, // 1-10 umiejętności
      experience: 0, // Doświadczenie zdobywane z czasem
      level: level,
      salary: monthlySalary,
      hiredOn: gameState.turn,
      morale: 100, // Morale pracownika (0-100)
      energy: 100, // Energia pracownika (0-100)
      specialization: getRandomSpecialization(staffType), // Specjalizacja pracownika
      traits: generateStaffTraits() // Cechy pracownika
    };
    
    // Aktualizujemy stan gracza
    playerDispatch({
      type: 'HIRE_STAFF',
      payload: {
        staffType,
        staff: newStaff,
        cost: hireCost
      }
    });
    
    showNotification(`Zatrudniono ${translateStaffLevel(level)} ${translateStaffType(staffType, true)}: ${newStaff.name}`, 'success');
    return true;
  };

  /**
   * Funkcja do zwalniania pracownika
   * @param {string} staffType - Typ pracownika
   * @param {string} staffId - ID pracownika
   * @returns {boolean} - Czy udało się zwolnić pracownika
   */
  const fireStaff = (staffType, staffId) => {
    // Sprawdzamy czy pracownik istnieje
    const staffList = playerState.staff[`${staffType}s`];
    if (!staffList) return false;
    
    const staffIndex = staffList.findIndex(s => s.id === staffId);
    if (staffIndex === -1) return false;
    
    const staff = staffList[staffIndex];
    
    // Koszt odprawy (1 miesiąc wynagrodzenia)
    const severancePay = staff.salary;
    
    // Sprawdzamy czy gracz ma wystarczające środki na odprawę
    if (playerState.cash < severancePay) {
      showNotification(`Nie masz wystarczających środków na odprawę! Potrzebujesz ${severancePay.toLocaleString()} PLN.`, 'error');
      return false;
    }
    
    // Aktualizujemy stan gracza
    playerDispatch({
      type: 'FIRE_STAFF',
      payload: {
        staffType,
        staffId,
        cost: severancePay
      }
    });
    
    showNotification(`Zwolniono pracownika: ${staff.name}`, 'warning');
    return true;
  };

  /**
   * Funkcja do wysyłania pracownika na szkolenie
   * @param {string} staffType - Typ pracownika
   * @param {string} staffId - ID pracownika
   * @param {string} trainingType - Typ szkolenia (skill, specialization)
   * @returns {boolean} - Czy udało się wysłać pracownika na szkolenie
   */
  const trainStaff = (staffType, staffId, trainingType) => {
    // Sprawdzamy czy pracownik istnieje
    const staffList = playerState.staff[`${staffType}s`];
    if (!staffList) return false;
    
    const staffIndex = staffList.findIndex(s => s.id === staffId);
    if (staffIndex === -1) return false;
    
    const staff = staffList[staffIndex];
    
    // Koszt szkolenia zależny od typu i poziomu pracownika
    const trainingCost = calculateTrainingCost(staff, trainingType);
    
    // Sprawdzamy czy gracz ma wystarczające środki
    if (playerState.cash < trainingCost) {
      showNotification(`Nie masz wystarczających środków na szkolenie! Potrzebujesz ${trainingCost.toLocaleString()} PLN.`, 'error');
      return false;
    }
    
    // Aktualizujemy stan gracza
    playerDispatch({
      type: 'TRAIN_STAFF',
      payload: {
        staffType,
        staffId,
        trainingType,
        cost: trainingCost
      }
    });
    
    showNotification(`Wysłano pracownika ${staff.name} na szkolenie`, 'success');
    return true;
  };

  /**
   * Przypisuje pracownika do projektu
   * @param {string} staffType - Typ pracownika (scout, developer, lawyer, envSpecialist, lobbyist)
   * @param {string} staffId - ID pracownika
   * @param {string} projectId - ID projektu
   * @returns {boolean} - Czy operacja się powiodła
   */
  const assignStaffToProject = (staffType, staffId, projectId) => {
    // Sprawdzamy czy pracownik istnieje
    const staffTypeKey = staffType.endsWith('s') ? staffType : `${staffType}s`;
    const staffList = playerState.staff[staffTypeKey];
    if (!staffList) return false;
    
    const staff = staffList.find(s => s.id === staffId);
    if (!staff) return false;
    
    // Sprawdzamy czy projekt istnieje
    const project = playerState.projects.find(p => p.id === projectId);
    if (!project) return false;
    
    // Sprawdzamy etap projektu i czy pracownik może być przypisany
    const isValidAssignment = isStaffValidForProjectStage(staffType, project.status);
    if (!isValidAssignment) {
      showNotification(`${translateStaffType(staffType)} nie może być przypisany do projektu na etapie ${translateStage(project.status)}`, 'error');
      return false;
    }
    
    // Jeśli pracownik jest już przypisany do innego projektu, najpierw go odłączamy
    if (staff.assignedProject) {
      unassignStaffFromProject(staffType, staffId);
    }
    
    // Aktualizujemy stan gracza
    playerDispatch({
      type: 'ASSIGN_STAFF_TO_PROJECT',
      payload: {
        staffType: staffType.endsWith('s') ? staffType.slice(0, -1) : staffType,
        staffId,
        projectId
      }
    });
    
    // Dodajemy wydarzenie o przypisaniu
    eventsDispatch({
      type: 'ADD_EVENT',
      payload: {
        id: Date.now() + Math.random(),
        type: 'staff_event',
        title: 'Przypisanie pracownika',
        description: `${staff.name} (${translateStaffType(staffType)}) został przypisany do projektu ${project.name}`,
        severity: 'info',
        turn: gameState.turn,
        expires: gameState.turn + 5,
        staffId: staff.id,
        staffName: staff.name,
        projectId: project.id
      }
    });
    
    showNotification(`Przypisano ${translateStaffType(staffType)} ${staff.name} do projektu ${project.name}`, 'success');
    return true;
  };
  
  /**
   * Sprawdza, czy dany typ pracownika może być przypisany do projektu na danym etapie
   * @param {string} staffType - Typ pracownika
   * @param {string} projectStage - Etap projektu
   * @returns {boolean} - Czy przypisanie jest możliwe
   */
  const isStaffValidForProjectStage = (staffType, projectStage) => {
    const stages = [
      "land_acquisition",
      "environmental_decision",
      "zoning_conditions", 
      "grid_connection",
      "ready_to_build"
    ];
    
    switch(staffType) {
      case 'scout':
      case 'scouts':
        return stages.indexOf(projectStage) <= stages.indexOf("land_acquisition");
      case 'developer':
      case 'developers':
        return true; // Developerzy mogą pracować na każdym etapie
      case 'lawyer':
      case 'lawyers':
        return stages.indexOf(projectStage) >= stages.indexOf("environmental_decision") && 
               stages.indexOf(projectStage) <= stages.indexOf("grid_connection");
      case 'envSpecialist':
      case 'envSpecialists':
        return stages.indexOf(projectStage) <= stages.indexOf("environmental_decision");
      case 'lobbyist':
      case 'lobbyists':
        return stages.indexOf(projectStage) >= stages.indexOf("environmental_decision") && 
               stages.indexOf(projectStage) <= stages.indexOf("zoning_conditions");
      default:
        return false;
    }
  };
  
  /**
   * Odłącza pracownika od projektu
   * @param {string} staffType - Typ pracownika
   * @param {string} staffId - ID pracownika
   * @returns {boolean} - Czy operacja się powiodła
   */
  const unassignStaffFromProject = (staffType, staffId) => {
    const staffTypeKey = staffType.endsWith('s') ? staffType : `${staffType}s`;
    const staffList = playerState.staff[staffTypeKey];
    if (!staffList) return false;
    
    const staff = staffList.find(s => s.id === staffId);
    if (!staff || !staff.assignedProject) return false;
    
    const projectId = staff.assignedProject;
    const project = playerState.projects.find(p => p.id === projectId);
    
    // Aktualizujemy stan pracownika
    playerDispatch({
      type: 'UPDATE_STAFF',
      payload: {
        staffType: staffTypeKey,
        staffId: staffId,
        changes: {
          assignedProject: null,
          assignedSince: null
        }
      }
    });
    
    // Aktualizujemy stan projektu
    const projectStaffType = staffType.endsWith('s') ? staffType.slice(0, -1) : staffType;
    if (project) {
      playerDispatch({
        type: 'UPDATE_PROJECT',
        payload: {
          id: projectId,
          changes: {
            assignedStaff: {
              ...(project.assignedStaff || {}),
              [projectStaffType]: null
            }
          }
        }
      });
      
      showNotification(`Odłączono ${translateStaffType(staffType)} ${staff.name} od projektu ${project.name}`, 'info');
    }
    
    return true;
  };

  /**
   * Funkcja do generowania zdarzeń pracowników
   * Wywoływana co turę
   */
  const generateStaffEvents = () => {
    const newEvents = [];
    
    // Przetwarzamy wszystkie typy pracowników
    Object.keys(playerState.staff).forEach(staffTypeKey => {
      const staffList = playerState.staff[staffTypeKey];
      if (!staffList || staffList.length === 0) return;
      
      staffList.forEach(staff => {
        // Szansa na zdarzenie: 5% na turę dla każdego pracownika
        if (Math.random() < 0.05) {
          const event = generateRandomStaffEvent(staff);
          if (event) {
            newEvents.push(event);
            
            // Aplikujemy efekt zdarzenia
            applyStaffEventEffect(staff.type, staff.id, event);
          }
        }
        
        // Aktualizacja doświadczenia pracownika
        updateStaffExperience(staff.type, staff.id);
      });
    });
    
    if (newEvents.length > 0) {
      setStaffEvents(prev => [...prev, ...newEvents]);
    }
  };

  /**
   * Funkcja do generowania losowego zdarzenia pracownika
   * @param {Object} staff - Obiekt pracownika
   * @returns {Object|null} - Obiekt zdarzenia lub null
   */
  const generateRandomStaffEvent = (staff) => {
    const eventTypes = [
      'vacation', // Urlop
      'illness', // Choroba
      'burnout', // Wypalenie zawodowe
      'promotion', // Awans
      'conflict', // Konflikt w zespole
      'innovation', // Innowacyjny pomysł
      'mistake' // Błąd
    ];
    
    // Modyfikujemy szanse na zdarzenia w zależności od stanu pracownika
    let weights = [0.15, 0.1, 0.05, 0.1, 0.1, 0.2, 0.3]; // Domyślne wagi
    
    // Jeśli pracownik ma niskie morale, zwiększamy szansę na wypalenie i konflikty
    if (staff.morale < 50) {
      weights[2] *= 3; // Wypalenie x3
      weights[4] *= 2; // Konflikt x2
    }
    
    // Jeśli pracownik ma niską energię, zwiększamy szansę na chorobę i błędy
    if (staff.energy < 50) {
      weights[1] *= 2; // Choroba x2
      weights[6] *= 1.5; // Błąd x1.5
    }
    
    // Jeśli pracownik ma wysokie umiejętności, zwiększamy szansę na innowację i awans
    if (staff.skill > 7) {
      weights[5] *= 2; // Innowacja x2
      weights[3] *= 1.5; // Awans x1.5
    }
    
    // Normalizujemy wagi
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    weights = weights.map(w => w / totalWeight);
    
    // Losujemy zdarzenie na podstawie wag
    const random = Math.random();
    let cumulativeWeight = 0;
    let selectedEventIndex = -1;
    
    for (let i = 0; i < weights.length; i++) {
      cumulativeWeight += weights[i];
      if (random <= cumulativeWeight) {
        selectedEventIndex = i;
        break;
      }
    }
    
    if (selectedEventIndex === -1) return null;
    
    const eventType = eventTypes[selectedEventIndex];
    let event = {
      id: Date.now(),
      staffId: staff.id,
      staffName: staff.name,
      staffType: staff.type,
      type: eventType,
      turn: gameState.turn,
      title: '',
      description: '',
      effects: []
    };
    
    // Wypełniamy szczegóły zdarzenia
    switch(eventType) {
      case 'vacation':
        event.title = `${staff.name} bierze urlop`;
        event.description = `Pracownik bierze ${Math.floor(1 + Math.random() * 3)} dni urlopu.`;
        event.effects.push({
          type: 'energy',
          value: 30 // +30 do energii
        });
        event.effects.push({
          type: 'morale',
          value: 20 // +20 do morale
        });
        event.effects.push({
          type: 'productivity',
          value: -1 // -100% produktywności na czas urlopu
        });
        break;
        
      case 'illness':
        event.title = `${staff.name} zachorował`;
        event.description = `Pracownik jest chory i nie może pracować przez ${Math.floor(1 + Math.random() * 5)} dni.`;
        event.effects.push({
          type: 'energy',
          value: -20 // -20 do energii
        });
        event.effects.push({
          type: 'productivity',
          value: -1 // -100% produktywności na czas choroby
        });
        break;
        
      case 'burnout':
        event.title = `${staff.name} cierpi na wypalenie zawodowe`;
        event.description = `Pracownik jest przemęczony i jego wydajność spada o 50%.`;
        event.effects.push({
          type: 'energy',
          value: -40 // -40 do energii
        });
        event.effects.push({
          type: 'morale',
          value: -30 // -30 do morale
        });
        event.effects.push({
          type: 'productivity',
          value: -0.5 // -50% produktywności
        });
        break;
        
      case 'promotion':
        event.title = `${staff.name} zasługuje na awans`;
        event.description = `Pracownik wykazuje się dużym zaangażowaniem i zasługuje na awans.`;
        event.effects.push({
          type: 'morale',
          value: 40 // +40 do morale
        });
        event.effects.push({
          type: 'skill',
          value: 1 // +1 do umiejętności
        });
        event.effects.push({
          type: 'salary',
          value: 0.1 // +10% do wynagrodzenia
        });
        break;
        
      case 'conflict':
        event.title = `${staff.name} ma konflikt w zespole`;
        event.description = `Pracownik ma konflikt z innymi członkami zespołu, co wpływa na jego morale.`;
        event.effects.push({
          type: 'morale',
          value: -25 // -25 do morale
        });
        event.effects.push({
          type: 'productivity',
          value: -0.2 // -20% produktywności
        });
        break;
        
      case 'innovation':
        event.title = `${staff.name} ma innowacyjny pomysł`;
        event.description = `Pracownik wpadł na innowacyjny pomysł, który może przyspieszyć rozwój projektów.`;
        event.effects.push({
          type: 'morale',
          value: 15 // +15 do morale
        });
        event.effects.push({
          type: 'productivity',
          value: 0.2 // +20% produktywności
        });
        event.effects.push({
          type: 'experience',
          value: 10 // +10 do doświadczenia
        });
        break;
        
      case 'mistake':
        event.title = `${staff.name} popełnił błąd`;
        event.description = `Pracownik popełnił błąd, który może opóźnić rozwój projektu.`;
        event.effects.push({
          type: 'morale',
          value: -10 // -10 do morale
        });
        event.effects.push({
          type: 'productivity',
          value: -0.15 // -15% produktywności
        });
        break;
        
      default:
        return null;
    }
    
    return event;
  };

  /**
   * Funkcja do aplikowania efektu zdarzenia pracownika
   * @param {string} staffType - Typ pracownika
   * @param {string} staffId - ID pracownika
   * @param {Object} event - Obiekt zdarzenia
   */
  const applyStaffEventEffect = (staffType, staffId, event) => {
    // Tworzymy aktualizację pracownika
    const staffUpdate = { id: staffId };
    
    // Aplikujemy wszystkie efekty
    event.effects.forEach(effect => {
      switch(effect.type) {
        case 'energy':
          staffUpdate.energy = effect.value; // Wartość bezwzględna
          break;
        case 'morale':
          staffUpdate.morale = effect.value; // Wartość bezwzględna
          break;
        case 'productivity':
          staffUpdate.productivityModifier = effect.value; // Wartość względna
          break;
        case 'skill':
          staffUpdate.skillIncrease = effect.value; // Wartość bezwzględna
          break;
        case 'experience':
          staffUpdate.experienceIncrease = effect.value; // Wartość bezwzględna
          break;
        case 'salary':
          staffUpdate.salaryModifier = effect.value; // Wartość względna
          break;
        default:
          break;
      }
    });
    
    // Aktualizujemy pracownika
    playerDispatch({
      type: 'UPDATE_STAFF',
      payload: {
        staffType,
        staffUpdate
      }
    });
    
    // Wyświetlamy powiadomienie
    showNotification(event.title, 'info');
  };

  /**
   * Funkcja do aktualizacji doświadczenia pracownika
   * @param {string} staffType - Typ pracownika
   * @param {string} staffId - ID pracownika
   */
  const updateStaffExperience = (staffType, staffId) => {
    // Sprawdzamy czy pracownik istnieje
    const staffList = playerState.staff[`${staffType}s`];
    if (!staffList) return;
    
    const staffIndex = staffList.findIndex(s => s.id === staffId);
    if (staffIndex === -1) return;
    
    const staff = staffList[staffIndex];
    
    // Zwiększamy doświadczenie pracownika
    const experienceIncrease = 1; // 1 punkt doświadczenia na turę
    
    // Aktualizujemy pracownika
    playerDispatch({
      type: 'UPDATE_STAFF',
      payload: {
        staffType,
        staffUpdate: {
          id: staffId,
          experienceIncrease
        }
      }
    });
    
    // Sprawdzamy czy pracownik może awansować
    if (staff.experience + experienceIncrease >= 100 && staff.skill < 10) {
      // Awansujemy pracownika
      playerDispatch({
        type: 'UPDATE_STAFF',
        payload: {
          staffType,
          staffUpdate: {
            id: staffId,
            skillIncrease: 1,
            experience: 0
          }
        }
      });
      
      // Wyświetlamy powiadomienie
      showNotification(`${staff.name} zdobył nowy poziom umiejętności!`, 'success');
    }
  };

  /**
   * Funkcja do obliczania kosztu szkolenia
   * @param {Object} staff - Obiekt pracownika
   * @param {string} trainingType - Typ szkolenia
   * @returns {number} - Koszt szkolenia
   */
  const calculateTrainingCost = (staff, trainingType) => {
    const baseCost = 5000; // Bazowy koszt szkolenia
    
    // Modyfikator kosztu w zależności od poziomu pracownika
    const levelModifier = staff.level === 'junior' ? 1 : 
                          staff.level === 'mid' ? 1.5 : 2;
    
    // Modyfikator kosztu w zależności od typu szkolenia
    const typeModifier = trainingType === 'skill' ? 1 : 1.5;
    
    return Math.floor(baseCost * levelModifier * typeModifier);
  };

  /**
   * Funkcja do generowania imienia i nazwiska pracownika
   * @returns {string} - Imię i nazwisko
   */
  const generateStaffName = () => {
    const firstNames = ['Adam', 'Anna', 'Piotr', 'Katarzyna', 'Michał', 'Magdalena', 'Jan', 'Aleksandra', 'Tomasz', 'Małgorzata', 'Marek', 'Barbara', 'Andrzej', 'Ewa', 'Krzysztof', 'Zofia', 'Paweł', 'Monika', 'Rafał', 'Joanna'];
    const lastNames = ['Nowak', 'Kowalski', 'Wiśniewski', 'Wójcik', 'Kowalczyk', 'Kamiński', 'Lewandowski', 'Zieliński', 'Woźniak', 'Szymański', 'Dąbrowski', 'Kozłowski', 'Jankowski', 'Mazur', 'Kwiatkowski', 'Krawczyk', 'Piotrowski', 'Grabowski', 'Nowakowski', 'Pawłowski'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  };

  /**
   * Funkcja do generowania losowej specjalizacji pracownika
   * @param {string} staffType - Typ pracownika
   * @returns {string} - Specjalizacja
   */
  const getRandomSpecialization = (staffType) => {
    const specializations = {
      scout: ['PV', 'WF', 'BESS', 'Negocjacje', 'Analiza gruntów'],
      developer: ['PV', 'WF', 'BESS', 'Zarządzanie projektami', 'Analiza techniczna'],
      lawyer: ['Prawo energetyczne', 'Prawo środowiskowe', 'Prawo budowlane', 'Negocjacje'],
      envSpecialist: ['Oceny oddziaływania', 'Ochrona gatunkowa', 'Rekultywacja', 'Monitoring'],
      lobbyist: ['Władze lokalne', 'Media', 'NGO', 'Społeczności lokalne']
    };
    
    const availableSpecializations = specializations[staffType] || ['Ogólna'];
    return availableSpecializations[Math.floor(Math.random() * availableSpecializations.length)];
  };

  /**
   * Funkcja do generowania losowych cech pracownika
   * @returns {Array} - Tablica cech
   */
  const generateStaffTraits = () => {
    const allTraits = [
      'Pracowity', 'Leniwy', 'Kreatywny', 'Analityczny', 'Komunikatywny', 
      'Introwertyczny', 'Dokładny', 'Chaotyczny', 'Ambitny', 'Ostrożny',
      'Optymista', 'Pesymista', 'Zespołowy', 'Indywidualista', 'Elastyczny',
      'Sztywny', 'Odporny na stres', 'Wrażliwy', 'Punktualny', 'Spóźnialski'
    ];
    
    // Losujemy 1-3 cechy
    const traitCount = 1 + Math.floor(Math.random() * 3);
    const traits = [];
    
    for (let i = 0; i < traitCount; i++) {
      const availableTraits = allTraits.filter(t => !traits.includes(t));
      if (availableTraits.length === 0) break;
      
      const trait = availableTraits[Math.floor(Math.random() * availableTraits.length)];
      traits.push(trait);
    }
    
    return traits;
  };

  return {
    hireStaff,
    fireStaff,
    trainStaff,
    assignStaffToProject,
    staffEvents,
    calculateTrainingCost
  };
};

export default useStaffManagement; 