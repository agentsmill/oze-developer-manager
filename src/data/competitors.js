/**
 * Dane konkurentów w grze
 */

export const competitors = [
  {
    id: 'competitor1',
    name: 'GreenPower Polska',
    power: 8000, // Początkowa moc w MW
    rtbPower: 2000, // Początkowa moc RTB w MW
    growth: 1.1, // Współczynnik wzrostu
    strongRegions: ['mazowieckie', 'wielkopolskie', 'slaskie'],
    strategy: 'aggressive', // Strategia działania
    reputation: 70, // Reputacja 0-100
    description: 'Największy deweloper OZE w Polsce, agresywnie rozwijający swój portfel projektów. Koncentruje się na dużych farmach fotowoltaicznych i wiatrowych w centralnej i zachodniej Polsce.',
    focusTechnologies: ['PV', 'WF'],
    foundedYear: 2010
  },
  {
    id: 'competitor2',
    name: 'SolarTech',
    power: 5000,
    rtbPower: 1500,
    growth: 1.2,
    strongRegions: ['malopolskie', 'podkarpackie', 'lubelskie'],
    strategy: 'balanced',
    reputation: 65,
    description: 'Firma specjalizująca się w projektach fotowoltaicznych, z rosnącym zainteresowaniem magazynami energii. Działa głównie w południowo-wschodniej Polsce.',
    focusTechnologies: ['PV', 'BESS'],
    foundedYear: 2015
  },
  {
    id: 'competitor3',
    name: 'WindForce',
    power: 6000,
    rtbPower: 1800,
    growth: 1.15,
    strongRegions: ['pomorskie', 'zachodniopomorskie', 'warminsko-mazurskie'],
    strategy: 'conservative',
    reputation: 80,
    description: 'Doświadczony deweloper farm wiatrowych z silną pozycją w północnej Polsce. Znany z wysokiej jakości projektów i dobrych relacji z lokalnymi społecznościami.',
    focusTechnologies: ['WF'],
    foundedYear: 2008
  },
  {
    id: 'competitor4',
    name: 'EnergyStorage Systems',
    power: 3000,
    rtbPower: 900,
    growth: 1.25,
    strongRegions: ['lodzkie', 'mazowieckie', 'slaskie'],
    strategy: 'aggressive',
    reputation: 60,
    description: 'Nowy, szybko rozwijający się gracz specjalizujący się w magazynach energii. Agresywnie pozyskuje lokalizacje w pobliżu dużych ośrodków przemysłowych i węzłów energetycznych.',
    focusTechnologies: ['BESS', 'PV'],
    foundedYear: 2018
  },
  {
    id: 'competitor5',
    name: 'EcoEnergy',
    power: 4500,
    rtbPower: 1200,
    growth: 1.05,
    strongRegions: ['wielkopolskie', 'lubuskie', 'dolnoslaskie'],
    strategy: 'conservative',
    reputation: 75,
    description: 'Stabilna firma z długą historią na rynku OZE, działająca głównie w zachodniej Polsce. Ostrożnie podchodzi do nowych projektów, ale ma solidny portfel aktywów.',
    focusTechnologies: ['PV', 'WF'],
    foundedYear: 2005
  }
];

/**
 * Funkcja generująca losowe działanie konkurenta
 * @param {Object} competitor - Obiekt konkurenta
 * @param {Array} regions - Tablica regionów
 * @returns {Object|null} - Obiekt zdarzenia lub null
 */
export const generateCompetitorAction = (competitor, regions) => {
  // Sprawdzam czy regions jest poprawną tablicą
  if (!regions || !Array.isArray(regions) || regions.length === 0) {
    return null;
  }
  
  const actions = [
    'land_acquisition', // Pozyskanie gruntu
    'project_development', // Rozwój projektu
    'market_expansion', // Ekspansja na nowy region
    'technology_shift', // Zmiana technologii
    'acquisition' // Przejęcie innego dewelopera
  ];
  
  const randomAction = actions[Math.floor(Math.random() * actions.length)];
  let event = {
    id: Date.now(),
    competitorId: competitor.id,
    competitorName: competitor.name,
    type: randomAction,
    title: '',
    description: '',
    effects: [],
    regions: []
  };
  
  switch(randomAction) {
    case 'land_acquisition':
      // Wybieramy region, w którym konkurent jest silny
      const targetRegion = competitor.strongRegions[Math.floor(Math.random() * competitor.strongRegions.length)];
      const regionObj = regions.find(r => r.id === targetRegion);
      
      // Jeśli nie znaleziono regionu, wybieramy inną akcję
      if (!regionObj) {
        return generateCompetitorAction(competitor, regions);
      }
      
      const landSize = Math.floor(30 + Math.random() * 50); // 30-80 ha
      
      event.title = `${competitor.name} pozyskuje grunty w regionie ${regionObj.name}`;
      event.description = `Konkurent zabezpieczył ${landSize} ha gruntów pod nowy projekt OZE.`;
      event.effects.push({
        type: 'regional_land_availability',
        value: 0.95, // -5% dostępnych gruntów w regionie
        regionId: targetRegion
      });
      event.regions.push(targetRegion);
      break;
      
    case 'project_development':
      const projectSize = Math.floor(20 + Math.random() * 60); // 20-80 MW
      const technology = competitor.focusTechnologies[Math.floor(Math.random() * competitor.focusTechnologies.length)];
      
      event.title = `${competitor.name} rozwija nowy projekt ${technology}`;
      event.description = `Konkurent ogłosił rozwój nowego projektu ${technology} o mocy ${projectSize} MW.`;
      event.effects.push({
        type: 'competitor_power',
        value: projectSize,
        competitorId: competitor.id
      });
      break;
      
    case 'market_expansion':
      // Wybieramy region, w którym konkurent nie jest jeszcze silny
      const availableRegions = regions.filter(r => !competitor.strongRegions.includes(r.id));
      if (availableRegions.length > 0) {
        const newRegion = availableRegions[Math.floor(Math.random() * availableRegions.length)];
        
        event.title = `${competitor.name} wchodzi na rynek w regionie ${newRegion.name}`;
        event.description = `Konkurent rozpoczyna działalność w nowym regionie, zwiększając konkurencję.`;
        event.effects.push({
          type: 'regional_competition',
          value: 1.1, // +10% konkurencji w regionie
          regionId: newRegion.id
        });
        event.regions.push(newRegion.id);
      } else {
        // Jeśli nie ma dostępnych regionów, zmieniamy akcję na project_development
        return generateCompetitorAction(competitor, regions);
      }
      break;
      
    case 'technology_shift':
      const allTechnologies = ['PV', 'WF', 'BESS'];
      const newTechnologies = allTechnologies.filter(t => !competitor.focusTechnologies.includes(t));
      
      if (newTechnologies.length > 0) {
        const newTech = newTechnologies[Math.floor(Math.random() * newTechnologies.length)];
        
        event.title = `${competitor.name} wchodzi w nową technologię: ${newTech}`;
        event.description = `Konkurent ogłosił strategiczną decyzję o rozwoju projektów w technologii ${newTech}.`;
        event.effects.push({
          type: 'competitor_technology',
          value: newTech,
          competitorId: competitor.id
        });
      } else {
        // Jeśli konkurent już ma wszystkie technologie, zmieniamy akcję na project_development
        return generateCompetitorAction(competitor, regions);
      }
      break;
      
    case 'acquisition':
      event.title = `${competitor.name} przejmuje mniejszego dewelopera`;
      event.description = `Konkurent ogłosił przejęcie mniejszej firmy deweloperskiej, zwiększając swój portfel projektów.`;
      const powerIncrease = Math.floor(500 + Math.random() * 1000); // 500-1500 MW
      
      event.effects.push({
        type: 'competitor_power_boost',
        value: powerIncrease,
        competitorId: competitor.id
      });
      break;
      
    default:
      return null;
  }
  
  return event;
}; 