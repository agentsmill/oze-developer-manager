/**
 * Funkcje pomocnicze do tłumaczeń i analizy danych
 */

// Tłumaczenie etapów projektu
export const translateStage = (stage) => {
  switch(stage) {
    case 'land_acquisition': return 'Pozyskiwanie gruntów (Greenfield)';
    case 'environmental_decision': return 'Decyzja środowiskowa (EIA/DŚU)';
    case 'zoning_conditions': return 'Warunki zabudowy (MPZP/WZ)';
    case 'grid_connection': return 'Warunki przyłączenia (WP)';
    case 'ready_to_build': return 'Gotowy do budowy (RTB)';
    case 'construction': return 'Budowa (COD-1)';
    case 'operating': return 'Operacyjny (COD)';
    default: return stage;
  }
};

// Szczegółowy opis etapu projektu
export const getStageDescription = (stage) => {
  switch(stage) {
    case 'land_acquisition': 
      return 'Etap analizy terenu i pozyskiwania nieruchomości pod projekt. Obejmuje badania gruntu, negocjacje z właścicielami, umowy dzierżawy i zakup działek. Faza Greenfield - początek cyklu życia projektu.';
    case 'environmental_decision': 
      return 'Proces uzyskania Decyzji o Środowiskowych Uwarunkowaniach (DŚU). Wymaga przeprowadzenia oceny oddziaływania na środowisko (OOŚ/EIA), konsultacji społecznych i uzyskania zgód odpowiednich organów środowiskowych.';
    case 'zoning_conditions': 
      return 'Etap uzyskiwania pozwoleń i decyzji planistycznych. Obejmuje analizę Miejscowego Planu Zagospodarowania Przestrzennego (MPZP) lub uzyskanie Warunków Zabudowy (WZ). Kluczowy dla określenia parametrów technicznych instalacji.';
    case 'grid_connection': 
      return 'Proces uzyskania Warunków Przyłączenia (WP) od operatora sieci dystrybucyjnej. Obejmuje analizę dostępności mocy przyłączeniowej, przygotowanie projektu przyłącza i podpisanie umowy przyłączeniowej.';
    case 'ready_to_build': 
      return 'Projekt z kompletem pozwoleń i dokumentacji (RTB - Ready to Build). Gotowy do rozpoczęcia budowy, posiada Pozwolenie na Budowę (PnB) i wszystkie niezbędne zgody administracyjne.';
    case 'construction': 
      return 'Etap realizacji inwestycji. Obejmuje prace budowlane, dostawę i montaż urządzeń, przyłączenie do sieci i pierwsze testy. Faza poprzedzająca uruchomienie (COD-1).';
    case 'operating': 
      return 'Instalacja ukończona i oddana do użytku (COD - Commercial Operation Date). Generuje energię elektryczną i przychody. Wymaga bieżącego zarządzania i okresowych przeglądów.';
    default: 
      return 'Brak opisu dla tego etapu.';
  }
};

// Tłumaczenie typów pracowników
export const translateStaffType = (type, accusative = false) => {
  if (accusative) {
    switch(type) {
      case 'lessor': return 'dzierżawcę';
      case 'developer': return 'developera';
      case 'lawyer': return 'prawnika';
      case 'envSpecialist': return 'specjalistę ds. środowiska';
      case 'lobbyist': return 'lobbystę';
      default: return type;
    }
  } else {
    switch(type) {
      case 'lessor': return 'dzierżawca';
      case 'developer': return 'developer';
      case 'lawyer': return 'prawnik';
      case 'envSpecialist': return 'specjalista ds. środowiska';
      case 'lobbyist': return 'lobbysta';
      default: return type;
    }
  }
};

// Tłumaczenie poziomów pracowników
export const translateStaffLevel = (level) => {
  switch(level) {
    case 'junior': return 'początkującego';
    case 'mid': return 'doświadczonego';
    case 'senior': return 'eksperta';
    default: return level;
  }
};

// Tłumaczenie nielegalnych metod
export const translateIllegalMethod = (method, accusative = false) => {
  if (accusative) {
    switch(method) {
      case 'database': return 'nielegalną bazę danych';
      case 'corruption': return 'siecią korupcyjną';
      case 'intimidation': return 'metodami zastraszania';
      case 'forgery': return 'fałszowaniem dokumentów';
      default: return method;
    }
  } else {
    switch(method) {
      case 'database': return 'nielegalna baza danych';
      case 'corruption': return 'sieć korupcyjna';
      case 'intimidation': return 'metody zastraszania';
      case 'forgery': return 'fałszowanie dokumentów';
      default: return method;
    }
  }
};

// Tłumaczenie typów zdarzeń
export const translateEventType = (type) => {
  switch(type) {
    case 'law_change': return 'Zmiana prawa';
    case 'energy_price_change': return 'Zmiana cen energii';
    case 'grid_issue': return 'Problem z siecią';
    case 'public_opinion': return 'Opinia publiczna';
    case 'protest': return 'Protest';
    case 'local_authority': return 'Władze lokalne';
    case 'competitor_action': return 'Akcja konkurencji';
    case 'environmental_issue': return 'Problem środowiskowy';
    case 'illegal_detection': return 'Wykrycie nielegalnych działań';
    default: return type;
  }
};

// Tłumaczenie efektów zdarzeń
export const translateEventEffect = (effect) => {
  switch(effect.type) {
    case 'project_speed':
      return `Szybkość projektów: ${effect.value > 1 ? '+' : ''}${((effect.value - 1) * 100).toFixed(0)}%`;
    case 'energy_price':
      return `Ceny energii: ${effect.value > 1 ? '+' : ''}${((effect.value - 1) * 100).toFixed(0)}%`;
    case 'grid_capacity':
      return `Dostępne moce przyłączeniowe: ${effect.value > 1 ? '+' : ''}${((effect.value - 1) * 100).toFixed(0)}%`;
    case 'social_acceptance':
      return `Akceptacja społeczna: ${effect.value > 0 ? '+' : ''}${effect.value} punktów`;
    case 'regional_social_acceptance':
      return `Akceptacja społeczna w regionie: ${effect.value > 0 ? '+' : ''}${effect.value} punktów`;
    case 'regional_permit_speed':
      return `Szybkość pozwoleń w regionie: ${effect.value > 1 ? '+' : ''}${((effect.value - 1) * 100).toFixed(0)}%`;
    case 'regional_land_availability':
      return `Dostępność gruntów w regionie: ${effect.value > 1 ? '+' : ''}${((effect.value - 1) * 100).toFixed(0)}%`;
    case 'regional_land_price':
      return `Ceny gruntów w regionie: ${effect.value > 1 ? '+' : ''}${((effect.value - 1) * 100).toFixed(0)}%`;
    case 'regional_environmental_complexity':
      return `Złożoność środowiskowa w regionie: ${effect.value > 1 ? '+' : ''}${((effect.value - 1) * 100).toFixed(0)}%`;
    default:
      return `${effect.type}: ${effect.value}`;
  }
};

// Tłumaczenie strategii konkurentów
export const translateCompetitorStrategy = (strategy) => {
  switch(strategy) {
    case 'aggressive': return 'Agresywna';
    case 'balanced': return 'Zrównoważona';
    case 'conservative': return 'Konserwatywna';
    default: return strategy;
  }
};

// Analiza konkurenta
export const getCompetitorAnalysis = (competitor, playerPower) => {
  // Analiza strategii konkurenta
  if (competitor.rtbPower > playerPower * 1.5) {
    return `Silny lider, posiada ${competitor.rtbPower.toLocaleString()} MW mocy RTB. Unikaj bezpośredniej konkurencji.`;
  } else if (competitor.rtbPower > playerPower) {
    return `Nieznacznie wyprzedza Cię z mocą ${competitor.rtbPower.toLocaleString()} MW. Możliwe do nadrobienia.`;
  } else if (competitor.rtbPower > playerPower * 0.7) {
    return `Blisko za Tobą z mocą ${competitor.rtbPower.toLocaleString()} MW. Pilnuj przewagi.`;
  } else {
    return `Słabszy konkurent z mocą ${competitor.rtbPower.toLocaleString()} MW. Koncentruje się na regionach ${competitor.strongRegions.slice(0, 2).join(', ')}.`;
  }
};

// Funkcje pomocnicze UI
export const getRegionColorClass = (region) => {
  // Obliczamy średnią warunków dla regionu
  const avgConditions = (region.solarConditions + region.windConditions) / 2;
  
  if (avgConditions >= 70) return 'bg-green-200';
  else if (avgConditions >= 55) return 'bg-yellow-200';
  else return 'bg-red-200';
};

export const getColorByValue = (value) => {
  // Kolor dla wartości 0-100
  if (value >= 75) return '#22c55e'; // green-500
  else if (value >= 50) return '#3b82f6'; // blue-500
  else if (value >= 25) return '#f59e0b'; // amber-500
  else return '#ef4444'; // red-500
};

export const getStatusColorClass = (status) => {
  switch(status) {
    case 'land_acquisition': return 'bg-blue-500';
    case 'environmental_decision': return 'bg-yellow-500';
    case 'zoning_conditions': return 'bg-orange-500';
    case 'grid_connection': return 'bg-purple-500';
    case 'construction': return 'bg-red-500';
    case 'ready_to_build': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
}; 