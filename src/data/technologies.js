// Definicje technologii OZE
export const technologies = {
  PV: {
    name: "Fotowoltaika",
    shortName: "PV",
    icon: "Sun",
    color: "yellow",
    stages: {
      land_acquisition: {
        time: { min: 1, max: 3 }, // tury - znacznie krótszy czas
        costPerMW: { min: 10000, max: 10000 }, // zł/MWp/rok - koszt dzierżawy gruntu
        description: "Pozyskiwanie gruntów pod instalacje fotowoltaiczne",
      },
      environmental_decision: {
        time: { min: 4, max: 8 }, // tury - skrócony czas
        costPerMW: { min: 15000, max: 25000 }, // Koszt due diligence i analiz wstępnych
        description: "Uzyskanie decyzji środowiskowej dla instalacji PV",
      },
      zoning_conditions: {
        time: { min: 2, max: 4 }, // tury - skrócony czas
        costPerMW: { min: 30000, max: 40000 }, // Koszt warunków zabudowy
        description: "Uzyskanie warunków zabudowy dla instalacji PV",
      },
      grid_connection: {
        time: { min: 3, max: 6 }, // tury - skrócony czas
        costPerMW: { min: 120000, max: 150000 }, // Koszt warunków przyłączenia
        description: "Przyłączenie do sieci instalacji fotowoltaicznej",
      },
      construction: {
        time: { min: 6, max: 10 }, // tury - skrócony czas
        costPerMW: { min: 2500000, max: 3500000 },
        description: "Budowa instalacji fotowoltaicznej",
      },
    },
    marketPrices: {
      greenfield: { min: 15000, max: 25000, currency: "PLN" }, // PLN/MWp
      development: { min: 50000, max: 80000, currency: "EUR" }, // EUR/MWp
      rtb: { min: 610000, max: 610000, currency: "PLN" }, // PLN/MWp - znormalizowana cena RtB
      cod: { min: 800000, max: 1200000, currency: "EUR" }, // EUR/MWp
    },
    specificRisks: [
      {
        name: "Problemy z siecią",
        probability: 0.25,
        impact: "grid_connection_delay",
        description: "Ograniczenia w przyłączeniu do sieci",
      },
      {
        name: "Zmiany w systemie wsparcia",
        probability: 0.15,
        impact: "financial_impact",
        description: "Zmiany w aukcjach OZE",
      },
    ],
  },

  WF: {
    name: "Farmy Wiatrowe",
    shortName: "WF",
    icon: "Wind",
    color: "blue",
    stages: {
      land_acquisition: {
        time: { min: 7, max: 12 },
        costPerMW: { min: 10000, max: 10000 }, // zł/MWp/rok - koszt dzierżawy gruntu
        description: "Pozyskiwanie gruntów pod farmy wiatrowe",
      },
      environmental_decision: {
        time: { min: 12, max: 20 },
        costPerMW: { min: 15000, max: 25000 }, // Koszt due diligence i analiz wstępnych
        description: "Uzyskanie decyzji środowiskowej dla farm wiatrowych",
      },
      zoning_conditions: {
        time: { min: 10, max: 16 },
        costPerMW: { min: 30000, max: 40000 }, // Koszt warunków zabudowy
        description: "Uzyskanie warunków zabudowy dla farm wiatrowych",
      },
      grid_connection: {
        time: { min: 12, max: 24 },
        costPerMW: { min: 120000, max: 150000 }, // Koszt warunków przyłączenia
        description: "Przyłączenie do sieci farm wiatrowych",
      },
      construction: {
        time: { min: 18, max: 30 },
        costPerMW: { min: 4000000, max: 6000000 },
        description: "Budowa farm wiatrowych",
      },
    },
    marketPrices: {
      greenfield: { min: 200000, max: 700000, currency: "PLN" },
      development: { min: 250000, max: 350000, currency: "PLN" },
      rtb: { min: 400000, max: 400000, currency: "PLN" }, // PLN/MWp - znormalizowana cena RtB
      cod: { min: 1500000, max: 2000000, currency: "EUR" },
    },
    specificRisks: [
      {
        name: "Protesty ekologiczne",
        probability: 0.35,
        impact: "environmental_decision_delay",
        description: "Protesty organizacji ekologicznych",
      },
      {
        name: "Zasada 10H",
        probability: 0.2,
        impact: "land_limitation",
        description: "Ograniczenia lokalizacji turbin",
      },
    ],
  },

  BESS: {
    name: "Magazyny Energii",
    shortName: "BESS",
    icon: "Battery",
    color: "green",
    stages: {
      land_acquisition: {
        time: { min: 4, max: 8 },
        costPerMW: { min: 10000, max: 10000 }, // zł/MWp/rok - koszt dzierżawy gruntu
        description: "Pozyskiwanie gruntów pod magazyny energii",
      },
      environmental_decision: {
        time: { min: 6, max: 12 },
        costPerMW: { min: 15000, max: 25000 }, // Koszt due diligence i analiz wstępnych
        description: "Uzyskanie decyzji środowiskowej dla magazynów energii",
      },
      zoning_conditions: {
        time: { min: 4, max: 10 },
        costPerMW: { min: 30000, max: 40000 }, // Koszt warunków zabudowy
        description: "Uzyskanie warunków zabudowy dla magazynów energii",
      },
      grid_connection: {
        time: { min: 10, max: 18 },
        costPerMW: { min: 120000, max: 150000 }, // Koszt warunków przyłączenia
        description: "Przyłączenie do sieci magazynów energii",
      },
      construction: {
        time: { min: 12, max: 18 },
        costPerMW: { min: 2800000, max: 3600000 },
        description: "Budowa magazynów energii",
      },
    },
    marketPrices: {
      greenfield: { min: 50000, max: 100000, currency: "PLN" },
      development: { min: 150000, max: 250000, currency: "PLN" },
      rtb: { min: 1800000, max: 1800000, currency: "PLN" }, // PLN/MWp - znormalizowana cena RtB
      cod: { min: 3000000, max: 4500000, currency: "PLN" },
    },
    specificRisks: [
      {
        name: "Regulacje bezpieczeństwa",
        probability: 0.3,
        impact: "additional_costs",
        description: "Dodatkowe wymagania bezpieczeństwa",
      },
      {
        name: "Problemy z łańcuchem dostaw",
        probability: 0.25,
        impact: "construction_delay",
        description: "Opóźnienia w dostawie komponentów",
      },
    ],
  },
};

// Definicje technologii hybrydowych
export const hybridTechnologies = {
  "PV+BESS": {
    name: "Fotowoltaika z Magazynem",
    shortName: "PV+BESS",
    icon: "SunBattery",
    color: "teal",
    components: ["PV", "BESS"],
    // Współczynniki określające, jak komponenty hybrydowe wpływają na parametry projektu
    componentWeights: {
      PV: 0.7,  // 70% parametrów projektu pochodzi z PV
      BESS: 0.3  // 30% parametrów projektu pochodzi z BESS
    }
  },
  "WF+BESS": {
    name: "Wiatrowa z Magazynem",
    shortName: "WF+BESS",
    icon: "WindBattery",
    color: "indigo",
    components: ["WF", "BESS"],
    componentWeights: {
      WF: 0.7,
      BESS: 0.3
    }
  },
  "PV+WF": {
    name: "Fotowoltaika i Wiatrowa",
    shortName: "PV+WF",
    icon: "SunWind",
    color: "green",
    components: ["PV", "WF"],
    componentWeights: {
      PV: 0.5,
      WF: 0.5
    }
  },
  "PV+WF+BESS": {
    name: "Kompleksowy System OZE",
    shortName: "PV+WF+BESS",
    icon: "SunWindBattery",
    color: "purple",
    components: ["PV", "WF", "BESS"],
    componentWeights: {
      PV: 0.4,
      WF: 0.4,
      BESS: 0.2
    }
  }
};

// Funkcja do generowania projektu odpowiedniego typu
export const createProject = (technology, regionId, options = {}) => {
  // Sprawdzamy, czy to jest projekt hybrydowy
  const isHybrid = technology.includes("+");
  
  let tech;
  let hybridTech;
  let components = [];
  
  if (isHybrid) {
    // Pobieramy definicję technologii hybrydowej
    hybridTech = hybridTechnologies[technology];
    if (!hybridTech) return null;
    
    // Pobieramy komponenty hybrydowe
    components = hybridTech.components.map(comp => technologies[comp]);
    if (components.some(c => !c)) return null; // Jeśli brakuje jakiegoś komponentu
  } else {
    // Standardowy projekt - jedna technologia
    tech = technologies[technology];
    if (!tech) return null;
  }

  const projectSize = options.size || Math.floor(30 + Math.random() * 50); // domyślnie 30-80 ha

  // Różne przeliczniki w zależności od technologii
  let projectPower;
  
  if (isHybrid) {
    // Dla projektów hybrydowych obliczamy moc jako średnią ważoną mocy komponentów
    if (technology === "PV+BESS") {
      // PV z magazynem ma specjalny przelicznik
      projectPower = Math.floor(projectSize * (1.2 + Math.random() * 0.6)); // 1.2-1.8 MW/ha
    } else if (technology === "WF+BESS") {
      // Farma wiatrowa z magazynem
      projectPower = Math.floor(projectSize * (0.6 + Math.random() * 0.3)); // 0.6-0.9 MW/ha
    } else if (technology === "PV+WF") {
      // PV i farma wiatrowa
      projectPower = Math.floor(projectSize * (0.8 + Math.random() * 0.4)); // 0.8-1.2 MW/ha
    } else if (technology === "PV+WF+BESS") {
      // Kompleksowy system
      projectPower = Math.floor(projectSize * (1.0 + Math.random() * 0.5)); // 1.0-1.5 MW/ha
    } else {
      // Domyślny przypadek
      projectPower = Math.floor(projectSize * (1.0 + Math.random() * 0.5)); // 1.0-1.5 MW/ha
    }
  } else {
    // Dla standardowych projektów - istniejące przeliczniki
    switch (technology) {
      case "PV":
        projectPower = Math.floor(projectSize * (1.0 + Math.random() * 0.5)); // 1.0-1.5 MW/ha
        break;
      case "WF":
        projectPower = Math.floor(projectSize * (0.5 + Math.random() * 0.3)); // 0.5-0.8 MW/ha
        break;
      case "BESS":
        projectPower = Math.floor(projectSize * (2.0 + Math.random() * 1.0)); // 2.0-3.0 MW/ha
        break;
      default:
        projectPower = Math.floor(projectSize * (1.2 + Math.random() * 0.8)); // 1.2-2.0 MW/ha
    }
  }

  // Generowanie nowego projektu
  const projectId = Date.now() + Math.floor(Math.random() * 1000);
  const projectName = isHybrid ? 
    `${hybridTech.shortName} ${regionId.slice(0, 3).toUpperCase()}${Math.floor(Math.random() * 100)}` :
    `${tech.shortName} ${regionId.slice(0, 3).toUpperCase()}${Math.floor(Math.random() * 100)}`;
  
  // Konstruujemy obiekt etapów i kosztów
  let stages = {};
  let marketPrices = {};
  
  if (isHybrid) {
    // Dla projektów hybrydowych, łączymy etapy i koszty poszczególnych technologii
    stages = hybridTech.components.reduce((acc, comp) => {
      const compTech = technologies[comp];
      const weight = hybridTech.componentWeights[comp];
      
      // Dla każdego etapu, ważymy parametry komponentu
      Object.entries(compTech.stages).forEach(([stage, params]) => {
        if (!acc[stage]) {
          acc[stage] = {
            time: { min: 0, max: 0 },
            costPerMW: { min: 0, max: 0 },
            description: `${hybridTech.name}: ${params.description}`
          };
        }
        
        // Ważymy czasy i koszty
        acc[stage].time.min += params.time.min * weight;
        acc[stage].time.max += params.time.max * weight;
        acc[stage].costPerMW.min += params.costPerMW.min * weight;
        acc[stage].costPerMW.max += params.costPerMW.max * weight;
      });
      
      return acc;
    }, {});
    
    // Obliczamy ceny rynkowe jako średnią ważoną cen komponentów
    const baseMarketPrice = hybridTech.components.reduce((acc, comp) => {
      const compTech = technologies[comp];
      const weight = hybridTech.componentWeights[comp];
      
      Object.entries(compTech.marketPrices).forEach(([stage, price]) => {
        if (!acc[stage]) {
          acc[stage] = { min: 0, max: 0, currency: price.currency };
        }
        
        acc[stage].min += price.min * weight;
        acc[stage].max += price.max * weight;
      });
      
      return acc;
    }, {});
    
    // Dodajemy 10-20% premium za hybrydę (większa efektywność)
    const hybridPremium = 1.1 + Math.random() * 0.1; // 1.1-1.2
    
    Object.keys(baseMarketPrice).forEach(stage => {
      marketPrices[stage] = {
        min: Math.round(baseMarketPrice[stage].min * hybridPremium),
        max: Math.round(baseMarketPrice[stage].max * hybridPremium),
        currency: baseMarketPrice[stage].currency
      };
    });
  } else {
    // Dla standardowych projektów - istniejące etapy i ceny
    stages = tech.stages;
    marketPrices = tech.marketPrices;
  }
  
  // Obliczamy koszty etapów projektu
  const etapCosts = {};
  Object.entries(stages).forEach(([stage, params]) => {
    // Losowy koszt w zakresie min-max dla danego etapu
    const minCost = params.costPerMW.min;
    const maxCost = params.costPerMW.max;
    const costPerMW = minCost + Math.random() * (maxCost - minCost);
    
    // Całkowity koszt dla etapu
    etapCosts[stage] = Math.round(costPerMW * projectPower);
  });
  
  // Konstruujemy pełny obiekt projektu
  return {
    id: projectId,
    name: projectName,
    technology: technology,
    isHybrid: isHybrid,
    hybridComponents: isHybrid ? hybridTech.components : [technology],
    region: regionId,
    size: projectSize,
    power: projectPower,
    status: "land_acquisition",
    statusIndex: 0,
    progress: 0,
    turn: options.turn || 1,
    etapCosts: etapCosts,
    marketValue: calculateMarketValue(technology, projectPower, "land_acquisition"),
    totalCost: 0,
    events: [],
    assignedStaff: {},
    specialRisks: isHybrid ? 
      hybridTech.components.flatMap(comp => technologies[comp].specificRisks || []) :
      tech.specificRisks || []
  };
};

// Funkcja pomocnicza do obliczania wartości rynkowej projektu
function calculateMarketValue(technology, power, stage) {
  const baseValuePerMW = {
    PV: 150000,
    WF: 200000,
    BESS: 250000,
    "PV+BESS": 180000,
    "WF+BESS": 230000,
    "PV+WF": 190000,
    "PV+WF+BESS": 220000
  }[technology] || a50000;
  
  const stageMultiplier = {
    land_acquisition: 0.15,
    environmental_decision: 0.35,
    zoning_conditions: 0.55,
    grid_connection: 0.85,
    ready_to_build: 1.0
  }[stage] || 0.1;
  
  return Math.round(power * baseValuePerMW * stageMultiplier);
}
