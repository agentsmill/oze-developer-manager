/**
 * Staff.js - Model pracownika dla OZE Developer Manager
 * Struktura danych opisująca pracownika z różnymi atrybutami, cechami i historiami
 */

// Lista możliwych cech pozytywnych
export const POSITIVE_TRAITS = [
  { id: 'pracowity', label: 'Pracowity', description: '+15% wydajność, -10% zmęczenie', effects: { efficiency: 0.15, energyLoss: -0.1 } },
  { id: 'kreatywny', label: 'Kreatywny', description: '+20% szansa na innowacje', effects: { innovationChance: 0.2 } },
  { id: 'charyzmatyczny', label: 'Charyzmatyczny', description: '+15% negocjacje, +10% relacje', effects: { negotiation: 0.15, relations: 0.1 } },
  { id: 'dokladny', label: 'Dokładny', description: '-30% ryzyko błędów, +10% czas', effects: { errorRisk: -0.3, timeNeeded: 0.1 } },
  { id: 'ambitny', label: 'Ambitny', description: '+25% praca po godzinach, szybszy rozwój', effects: { workOvertime: 0.25, careerGrowth: 0.15 } },
  { id: 'analityczny', label: 'Analityczny', description: '+20% rozwiązywanie problemów', effects: { problemSolving: 0.2 } },
  { id: 'optymista', label: 'Optymista', description: '+15% morale, -10% stres', effects: { moraleGain: 0.15, stressGain: -0.1 } },
  { id: 'lojalny', label: 'Lojalny', description: '-50% szansa odejścia, +15% morale przy długim stażu', effects: { leaveChance: -0.5, longTermMorale: 0.15 } }
];

// Lista cech neutralnych
export const NEUTRAL_TRAITS = [
  { id: 'perfekcjonista', label: 'Perfekcjonista', description: '+30% jakość, +20% czas', effects: { quality: 0.3, timeNeeded: 0.2 } },
  { id: 'indywidualista', label: 'Indywidualista', description: '+10% solo, -15% zespół', effects: { soloWork: 0.1, teamWork: -0.15 } },
  { id: 'ryzykant', label: 'Ryzykant', description: '+25% szansa przyspieszenia, +15% błędy', effects: { speedBoost: 0.25, errorRisk: 0.15 } },
  { id: 'tradycjonalista', label: 'Tradycjonalista', description: '-20% adaptacja do zmian, +15% standardowe procedury', effects: { adaptability: -0.2, standardProcedures: 0.15 } }
];

// Lista cech negatywnych
export const NEGATIVE_TRAITS = [
  { id: 'konfliktowy', label: 'Konfliktowy', description: '-20% relacje, ryzyko sporów', effects: { relations: -0.2, conflictRisk: 0.3 } },
  { id: 'prokrastynator', label: 'Prokrastynator', description: '+25% opóźnienia, -15% wydajność', effects: { delayRisk: 0.25, efficiency: -0.15 } },
  { id: 'wypalony', label: 'Wypalony', description: '-25% wydajność, -20% morale', effects: { efficiency: -0.25, morale: -0.2 } },
  { id: 'chaotyczny', label: 'Chaotyczny', description: '-15% organizacja, +10% kreatywność', effects: { organization: -0.15, creativity: 0.1 } },
  { id: 'pesymista', label: 'Pesymista', description: '-15% morale zespołu, częstsze zgłaszanie problemów', effects: { teamMorale: -0.15, problemReporting: 0.2 } },
  { id: 'niecierpliwy', label: 'Niecierpliwy', description: '-20% zadania długoterminowe, +10% krótkie zadania', effects: { longTasks: -0.2, shortTasks: 0.1 } }
];

// Lista specjalizacji pracowników
export const SPECIALIZATIONS = {
  scout: ['Małe projekty', 'Duże projekty', 'Fotowoltaika', 'Farmy wiatrowe', 'Tereny poprzemysłowe', 'Obszary chronione'],
  developer: ['Fotowoltaika', 'Farmy wiatrowe', 'Magazyny energii', 'Hybrydowe', 'Offshore', 'Repowering'],
  lawyer: ['Decyzje środowiskowe', 'Warunki zabudowy', 'Pozwolenia na budowę', 'Umowy MPZP', 'Prawo energetyczne'],
  envSpecialist: ['Oceny oddziaływania', 'Natura 2000', 'Ochrona gatunkowa', 'Kompensacje', 'Obszary chronione'],
  lobbyist: ['Społeczności lokalne', 'Władze gminne', 'Władze wojewódzkie', 'Media i PR', 'NGO']
};

// Lista poziomów doświadczenia
export const EXPERIENCE_LEVELS = {
  junior: {
    label: 'Początkujący',
    minExp: 0,
    maxExp: 3000,
    salaryMultiplier: 1.0,
    skillRange: [1, 4]
  },
  mid: {
    label: 'Doświadczony',
    minExp: 3001,
    maxExp: 8000,
    salaryMultiplier: 1.5,
    skillRange: [4, 7]
  },
  senior: {
    label: 'Ekspert',
    minExp: 8001,
    maxExp: Infinity,
    salaryMultiplier: 2.2,
    skillRange: [7, 10]
  }
};

// Podstawowe wynagrodzenia dla różnych typów pracowników
export const BASE_SALARIES = {
  scout: 2500,      // 2.5k zł
  developer: 3000,  // 3k zł
  lawyer: 0,        // Jednorazowa opłata
  envSpecialist: 0, // Jednorazowa opłata
  lobbyist: 5000    // 5k zł
};

// Koszt jednorazowego wynajęcia specjalistów
export const SPECIALIST_COSTS = {
  lawyer: 30000000,      // 30 mln zł
  envSpecialist: 25000000 // 25 mln zł
};

/**
 * Generuje imię i nazwisko dla pracownika
 * @returns {string} Imię i nazwisko
 */
export const generateStaffName = () => {
  const firstNames = [
    'Jan', 'Adam', 'Piotr', 'Michał', 'Tomasz', 'Paweł', 'Marcin', 'Łukasz', 'Karol', 
    'Anna', 'Maria', 'Katarzyna', 'Małgorzata', 'Agnieszka', 'Magdalena', 'Joanna', 'Aleksandra'
  ];
  
  const lastNames = [
    'Kowalski', 'Nowak', 'Wiśniewski', 'Wójcik', 'Kowalczyk', 'Kamiński', 'Lewandowski', 
    'Dąbrowski', 'Zieliński', 'Szymański', 'Woźniak', 'Kozłowski', 'Mazur', 'Jankowski'
  ];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName}`;
};

/**
 * Generuje losowe cechy dla pracownika
 * @returns {Array} Tablica z cechami pracownika
 */
export const generateStaffTraits = () => {
  const traitCount = 1 + Math.floor(Math.random() * 3); // 1-3 cechy
  const allTraits = [...POSITIVE_TRAITS, ...NEUTRAL_TRAITS, ...NEGATIVE_TRAITS];
  
  // Wylosuj cechy bez powtórzeń
  const selectedTraits = [];
  const usedIndices = new Set();
  
  while (selectedTraits.length < traitCount && usedIndices.size < allTraits.length) {
    const index = Math.floor(Math.random() * allTraits.length);
    
    if (!usedIndices.has(index)) {
      usedIndices.add(index);
      selectedTraits.push(allTraits[index].id);
    }
  }
  
  return selectedTraits;
};

/**
 * Tworzy nowego pracownika z losowymi danymi
 * @param {string} type - Typ pracownika (scout, developer, lawyer, envSpecialist, lobbyist)
 * @param {string} level - Poziom (junior, mid, senior)
 * @returns {Object} Obiekt pracownika
 */
export const createStaff = (type, level = 'junior') => {
  const levelData = EXPERIENCE_LEVELS[level] || EXPERIENCE_LEVELS.junior;
  const baseSalary = BASE_SALARIES[type] || 3000;
  
  // Oblicz pensję na podstawie poziomu
  const salary = Math.floor(baseSalary * levelData.salaryMultiplier);
  
  // Losowe wartości umiejętności w zakresie dla danego poziomu
  const skillMin = levelData.skillRange[0];
  const skillMax = levelData.skillRange[1];
  const skill = skillMin + Math.floor(Math.random() * (skillMax - skillMin + 1));
  
  // Losowe doświadczenie w ramach poziomu
  const expMin = levelData.minExp;
  const expMax = levelData.maxExp;
  const experience = expMin + Math.floor(Math.random() * (expMax - expMin));
  
  // Losuj specjalizację
  const availableSpecializations = SPECIALIZATIONS[type] || ['Ogólna'];
  const specialization = availableSpecializations[Math.floor(Math.random() * availableSpecializations.length)];
  
  // Utworzenie obiektu pracownika
  return {
    id: Date.now(),
    name: generateStaffName(),
    type,
    level,
    skill,
    experience,
    specialization,
    salary,
    energy: 80 + Math.floor(Math.random() * 21), // 80-100
    morale: 70 + Math.floor(Math.random() * 31), // 70-100
    hiredOn: new Date().toISOString(),
    traits: generateStaffTraits(),
    potrzeby: {
      uznanie: 40 + Math.floor(Math.random() * 61), // 40-100
      rozwoj: 50 + Math.floor(Math.random() * 51), // 50-100
      stabilizacja: 30 + Math.floor(Math.random() * 71), // 30-100
      autonomia: 40 + Math.floor(Math.random() * 61), // 40-100
      relacjeSpoleczne: 30 + Math.floor(Math.random() * 71) // 30-100
    },
    historia: [{
      data: new Date().toISOString(),
      typ: 'zatrudnienie',
      opis: `Zatrudniony jako ${level} ${type}`
    }]
  };
};

/**
 * Oblicza wpływ cech na wydajność pracownika
 * @param {Object} staff - Obiekt pracownika
 * @returns {Object} Obiekt z modyfikatorami wydajności
 */
export const calculateTraitEffects = (staff) => {
  const effects = {
    efficiency: 0,
    quality: 0,
    negotiation: 0,
    errorRisk: 0,
    timeNeeded: 0,
    moraleGain: 0,
    energyLoss: 0,
    relations: 0,
    leaveChance: 0
  };
  
  // Brak cech
  if (!staff.traits || staff.traits.length === 0) {
    return effects;
  }
  
  // Połącz wszystkie cechy
  const allTraits = [...POSITIVE_TRAITS, ...NEUTRAL_TRAITS, ...NEGATIVE_TRAITS];
  
  // Znajdź efekty dla każdej cechy
  staff.traits.forEach(traitId => {
    const trait = allTraits.find(t => t.id === traitId);
    
    if (trait && trait.effects) {
      // Łączymy efekty
      Object.keys(trait.effects).forEach(effectKey => {
        if (effects[effectKey] !== undefined) {
          effects[effectKey] += trait.effects[effectKey];
        } else {
          effects[effectKey] = trait.effects[effectKey];
        }
      });
    }
  });
  
  return effects;
};

/**
 * Generuje wydarzenie związane z pracownikiem
 * @param {Object} staff - Obiekt pracownika
 * @returns {Object|null} Wydarzenie lub null
 */
export const generateStaffEvent = (staff) => {
  // Bazowe prawdopodobieństwo wydarzenia (5%)
  let eventChance = 0.05;
  
  // Modyfikacja na podstawie morale i energii
  if (staff.morale < 50) eventChance += 0.05;
  if (staff.energy < 40) eventChance += 0.07;
  
  // Modyfikacja na podstawie cech
  if (staff.traits && staff.traits.includes('konfliktowy')) eventChance += 0.03;
  if (staff.traits && staff.traits.includes('wypalony')) eventChance += 0.05;
  
  // Sprawdzamy, czy wydarzenie wystąpi
  if (Math.random() > eventChance) {
    return null;
  }
  
  // Możliwe wydarzenia
  const possibleEvents = [
    {
      id: 'conflict',
      title: 'Konflikt w zespole',
      description: `${staff.name} popadł w konflikt z innym członkiem zespołu.`,
      severity: 'negative',
      effects: {
        morale: -10,
        relations: -15
      }
    },
    {
      id: 'innovation',
      title: 'Innowacyjny pomysł',
      description: `${staff.name} zaproponował innowacyjne rozwiązanie problemu.`,
      severity: 'positive',
      effects: {
        morale: +15,
        skill: +0.2
      }
    },
    {
      id: 'burnout',
      title: 'Oznaki wypalenia',
      description: `${staff.name} wykazuje oznaki wypalenia zawodowego.`,
      severity: 'negative',
      effects: {
        energy: -20,
        morale: -15
      }
    },
    {
      id: 'training_success',
      title: 'Udane szkolenie',
      description: `${staff.name} zdobył nowe umiejętności podczas szkolenia.`,
      severity: 'positive',
      effects: {
        skill: +0.5,
        experience: +100,
        morale: +10
      }
    },
    {
      id: 'job_offer',
      title: 'Oferta od konkurencji',
      description: `${staff.name} otrzymał ofertę pracy od konkurencji.`,
      severity: 'neutral',
      effects: {
        leaveRisk: 0.3
      }
    }
  ];
  
  // Wybieramy losowe wydarzenie
  const selectedEvent = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
  
  // Dodajemy unikalne ID i datę
  return {
    ...selectedEvent,
    uniqueId: `${selectedEvent.id}_${Date.now()}`,
    date: new Date().toISOString()
  };
};

// Nazwa stała dla eksportu domyślnego
const StaffModel = {
  createStaff,
  generateStaffName,
  generateStaffTraits,
  calculateTraitEffects,
  generateStaffEvent,
  POSITIVE_TRAITS,
  NEUTRAL_TRAITS,
  NEGATIVE_TRAITS
};

export default StaffModel; 