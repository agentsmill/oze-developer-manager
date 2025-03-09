// Definicje technologii OZE
export const technologies = {
  PV: {
    name: "Fotowoltaika",
    shortName: "PV",
    icon: "Sun",
    color: "yellow",
    stages: {
      land_acquisition: {
        time: { min: 5, max: 9 }, // tury
        costPerMW: { min: 10000, max: 10000 }, // zł/MWp/rok - koszt dzierżawy gruntu
        description: "Pozyskiwanie gruntów pod instalacje fotowoltaiczne",
      },
      environmental_decision: {
        time: { min: 8, max: 15 },
        costPerMW: { min: 15000, max: 25000 }, // Koszt due diligence i analiz wstępnych
        description: "Uzyskanie decyzji środowiskowej dla instalacji PV",
      },
      zoning_conditions: {
        time: { min: 6, max: 12 },
        costPerMW: { min: 30000, max: 40000 }, // Koszt warunków zabudowy
        description: "Uzyskanie warunków zabudowy dla instalacji PV",
      },
      grid_connection: {
        time: { min: 10, max: 18 },
        costPerMW: { min: 120000, max: 150000 }, // Koszt warunków przyłączenia
        description: "Przyłączenie do sieci instalacji fotowoltaicznej",
      },
      construction: {
        time: { min: 12, max: 20 },
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

// Funkcja do generowania projektu odpowiedniego typu
export const createProject = (technology, regionId, options = {}) => {
  const tech = technologies[technology];
  if (!tech) return null;

  const projectSize = options.size || Math.floor(30 + Math.random() * 50); // domyślnie 30-80 ha

  // Różne przeliczniki w zależności od technologii
  let projectPower;
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

  // Generowanie nowego projektu
  const projectId = Date.now() + Math.floor(Math.random() * 1000);

  return {
    id: projectId,
    name: `${tech.shortName}-${regionId
      .substring(0, 3)
      .toUpperCase()}${projectId.toString().slice(-4)}`,
    technology,
    region: regionId,
    size: projectSize, // Wielkość w hektarach
    power: projectPower, // Moc w MW
    status: "land_acquisition",
    statusIndex: 0,
    startedOn: options.turn || 1,
    assignedScout: null,
    assignedDeveloper: null,
    landCost: 0,
    progress: 0,
    // Czasy trwania etapów w turach
    etapTime: {
      land_acquisition:
        tech.stages.land_acquisition.time.min +
        Math.floor(
          Math.random() *
            (tech.stages.land_acquisition.time.max -
              tech.stages.land_acquisition.time.min)
        ),
      environmental_decision:
        tech.stages.environmental_decision.time.min +
        Math.floor(
          Math.random() *
            (tech.stages.environmental_decision.time.max -
              tech.stages.environmental_decision.time.min)
        ),
      zoning_conditions:
        tech.stages.zoning_conditions.time.min +
        Math.floor(
          Math.random() *
            (tech.stages.zoning_conditions.time.max -
              tech.stages.zoning_conditions.time.min)
        ),
      grid_connection:
        tech.stages.grid_connection.time.min +
        Math.floor(
          Math.random() *
            (tech.stages.grid_connection.time.max -
              tech.stages.grid_connection.time.min)
        ),
      construction:
        tech.stages.construction.time.min +
        Math.floor(
          Math.random() *
            (tech.stages.construction.time.max -
              tech.stages.construction.time.min)
        ),
    },
    // Koszt każdego etapu
    etapCosts: {
      land_acquisition:
        Math.floor(
          tech.stages.land_acquisition.costPerMW.min +
            Math.random() *
              (tech.stages.land_acquisition.costPerMW.max -
                tech.stages.land_acquisition.costPerMW.min)
        ) * projectPower,
      environmental_decision:
        Math.floor(
          tech.stages.environmental_decision.costPerMW.min +
            Math.random() *
              (tech.stages.environmental_decision.costPerMW.max -
                tech.stages.environmental_decision.costPerMW.min)
        ) * projectPower,
      zoning_conditions:
        Math.floor(
          tech.stages.zoning_conditions.costPerMW.min +
            Math.random() *
              (tech.stages.zoning_conditions.costPerMW.max -
                tech.stages.zoning_conditions.costPerMW.min)
        ) * projectPower,
      grid_connection:
        Math.floor(
          tech.stages.grid_connection.costPerMW.min +
            Math.random() *
              (tech.stages.grid_connection.costPerMW.max -
                tech.stages.grid_connection.costPerMW.min)
        ) * projectPower,
      construction:
        Math.floor(
          tech.stages.construction.costPerMW.min +
            Math.random() *
              (tech.stages.construction.costPerMW.max -
                tech.stages.construction.costPerMW.min)
        ) * projectPower,
    },
    etapPaid: {
      land_acquisition: false,
      environmental_decision: false,
      zoning_conditions: false,
      grid_connection: false,
      construction: false,
    },
    // Ryzyka projektu
    risks: {
      protest: 0,
      corruption: 0,
      delay: 0,
      specific: tech.specificRisks.map((risk) => ({
        ...risk,
        triggered: false,
      })),
    },
    events: [], // Historia wydarzeń projektu
    totalCost: 0, // Całkowity koszt projektu
    estimatedProfit: 0, // Szacowany zysk
    parallelProcesses: {}, // Procesy równoległe
  };
};
