/**
 * System wydarzeń globalnych dla OZE Developer Manager
 * Wydarzenia możemy podzielić na kilka kategorii:
 * - Ekonomiczne (wpływają na ceny, rynek, itp.)
 * - Polityczne (zmiany przepisów, regulacji)
 * - Społeczne (protesty, poparcie dla OZE)
 * - Środowiskowe (zjawiska pogodowe, klęski)
 * - Technologiczne (innowacje, nowe technologie)
 */

/**
 * Wpływy wydarzeń na grę:
 * - marketModifier: wpływ na ceny rynkowe (mnożnik)
 * - reputationChange: zmiana reputacji gracza
 * - permitTimeModifier: wpływ na czas uzyskania pozwoleń (mnożnik)
 * - buildCostModifier: wpływ na koszty budowy (mnożnik)
 * - regionalEffect: wpływ na konkretny region/województwo
 * - technologyEffect: wpływ na konkretną technologię (PV, WF, BESS)
 */

// Bazowa klasa wydarzenia
class EventBase {
  constructor(id, name, description, duration, image = null) {
    this.id = id || Date.now() + Math.random();
    this.name = name;
    this.description = description;
    this.duration = duration; // w dniach
    this.image = image;
    this.startDate = null;
    this.expiryDate = null;
  }
  
  activate(gameDate) {
    this.startDate = new Date(gameDate);
    
    const expiryDate = new Date(gameDate);
    expiryDate.setDate(expiryDate.getDate() + this.duration);
    this.expiryDate = expiryDate;
    
    return this;
  }
  
  isExpired(gameDate) {
    if (!this.expiryDate) return false;
    return gameDate > this.expiryDate;
  }
  
  getEffect() {
    return {};
  }
}

// Wydarzenie ekonomiczne
class EconomicEvent extends EventBase {
  constructor(id, name, description, duration, effects, image = null) {
    super(id, name, description, duration, image);
    this.type = 'economic';
    this.effects = effects;
  }
  
  getEffect() {
    return this.effects;
  }
}

// Wydarzenie polityczne
class PoliticalEvent extends EventBase {
  constructor(id, name, description, duration, effects, image = null) {
    super(id, name, description, duration, image);
    this.type = 'political';
    this.effects = effects;
  }
  
  getEffect() {
    return this.effects;
  }
}

// Wydarzenie społeczne
class SocialEvent extends EventBase {
  constructor(id, name, description, duration, effects, region = null, image = null) {
    super(id, name, description, duration, image);
    this.type = 'social';
    this.effects = effects;
    this.region = region;
  }
  
  getEffect() {
    const effect = {...this.effects};
    if (this.region) {
      effect.regionalEffect = {
        region: this.region,
        ...effect.regionalEffect
      };
    }
    return effect;
  }
}

// Wydarzenie środowiskowe
class EnvironmentalEvent extends EventBase {
  constructor(id, name, description, duration, effects, region = null, image = null) {
    super(id, name, description, duration, image);
    this.type = 'environmental';
    this.effects = effects;
    this.region = region;
  }
  
  getEffect() {
    const effect = {...this.effects};
    if (this.region) {
      effect.regionalEffect = {
        region: this.region,
        ...effect.regionalEffect
      };
    }
    return effect;
  }
}

// Wydarzenie technologiczne
class TechnologicalEvent extends EventBase {
  constructor(id, name, description, duration, effects, technology = null, image = null) {
    super(id, name, description, duration, image);
    this.type = 'technological';
    this.effects = effects;
    this.technology = technology;
  }
  
  getEffect() {
    const effect = {...this.effects};
    if (this.technology) {
      effect.technologyEffect = {
        technology: this.technology,
        ...effect.technologyEffect
      };
    }
    return effect;
  }
}

// Ekonomiczne
const economicEvents = [
  new EconomicEvent(
    'econ_1',
    'Wzrost cen prądu na rynku',
    'Ceny energii elektrycznej na rynku wzrosły o 15%, zwiększając atrakcyjność projektów OZE.',
    30, // 30 dni
    {
      marketModifier: 1.15,
      permitTimeModifier: 1.0
    }
  ),
  new EconomicEvent(
    'econ_2',
    'Spadek cen prądu na rynku',
    'Ceny energii elektrycznej na rynku spadły o 10%, zmniejszając opłacalność projektów OZE.',
    21, // 21 dni
    {
      marketModifier: 0.9,
      permitTimeModifier: 1.0
    }
  ),
  new EconomicEvent(
    'econ_3',
    'Wzrost stóp procentowych',
    'NBP podniósł stopy procentowe, co utrudnia finansowanie projektów i zwiększa koszty kredytów.',
    60, // 60 dni
    {
      buildCostModifier: 1.1,
      marketModifier: 0.95
    }
  ),
  new EconomicEvent(
    'econ_4',
    'Kryzys na rynku surowców',
    'Globalny kryzys na rynku surowców zwiększa koszty budowy farm PV i wiatrowych.',
    45, // 45 dni
    {
      buildCostModifier: 1.2,
      marketModifier: 1.05
    }
  ),
  new EconomicEvent(
    'econ_5',
    'Nowe fundusze UE dla OZE',
    'Unia Europejska uruchomiła nowe fundusze na rozwój OZE, co zwiększa wartość projektów.',
    90, // 90 dni
    {
      marketModifier: 1.2,
      buildCostModifier: 0.95,
      reputationChange: 5
    }
  )
];

// Polityczne
const politicalEvents = [
  new PoliticalEvent(
    'pol_1',
    'Nowelizacja ustawy o OZE',
    'Sejm przyjął nowelizację ustawy o OZE, która upraszcza procedury administracyjne.',
    120, // 120 dni
    {
      permitTimeModifier: 0.8,
      reputationChange: 3
    }
  ),
  new PoliticalEvent(
    'pol_2',
    'Zaostrzenie wymagań środowiskowych',
    'Nowe przepisy zaostrzają wymagania dotyczące ocen oddziaływania na środowisko.',
    90, // 90 dni
    {
      permitTimeModifier: 1.3,
      reputationChange: -2
    }
  ),
  new PoliticalEvent(
    'pol_3',
    'Reforma systemu aukcyjnego',
    'Rząd zreformował system aukcyjny OZE, wprowadzając korzystniejsze zasady dla inwestorów.',
    180, // 180 dni
    {
      marketModifier: 1.1,
      permitTimeModifier: 0.9,
      reputationChange: 5
    }
  ),
  new PoliticalEvent(
    'pol_4',
    'Ograniczenie dotacji dla OZE',
    'Rząd ograniczył dotacje dla nowych projektów OZE, co zmniejsza ich opłacalność.',
    150, // 150 dni
    {
      marketModifier: 0.85,
      reputationChange: -3
    }
  ),
  new PoliticalEvent(
    'pol_5',
    'Nowe cele klimatyczne',
    'Polska przyjęła ambitniejsze cele klimatyczne, zwiększając zapotrzebowanie na OZE.',
    210, // 210 dni
    {
      marketModifier: 1.15,
      reputationChange: 7
    }
  )
];

// Społeczne
const socialEvents = [
  new SocialEvent(
    'soc_1',
    'Protesty przeciwko farmom wiatrowym',
    'W wielu regionach kraju nasiliły się protesty lokalnych społeczności przeciwko farmom wiatrowym.',
    60, // 60 dni
    {
      permitTimeModifier: 1.2,
      reputationChange: -3
    }
  ),
  new SocialEvent(
    'soc_2',
    'Wzrost poparcia dla OZE',
    'Badania pokazują rekordowy wzrost poparcia społecznego dla energetyki odnawialnej.',
    90, // 90 dni
    {
      permitTimeModifier: 0.9,
      reputationChange: 4
    }
  ),
  new SocialEvent(
    'soc_3',
    'Lokalna kampania przeciwko PV',
    'W województwie małopolskim rozwinęła się kampania przeciwko wielkoobszarowym farmom PV.',
    45, // 45 dni
    {
      regionalEffect: {
        permitTimeModifier: 1.3
      }
    },
    'małopolskie'
  ),
  new SocialEvent(
    'soc_4',
    'Program edukacyjny o OZE',
    'Ministerstwo Klimatu uruchomiło ogólnopolski program edukacyjny na temat korzyści z OZE.',
    120, // 120 dni
    {
      permitTimeModifier: 0.95,
      reputationChange: 2
    }
  ),
  new SocialEvent(
    'soc_5',
    'Konflikt o turbiny przy wybrzeżu',
    'Nasilił się konflikt między rybakami a inwestorami farm wiatrowych na Bałtyku.',
    75, // 75 dni
    {
      regionalEffect: {
        permitTimeModifier: 1.4
      }
    },
    'pomorskie'
  )
];

// Środowiskowe
const environmentalEvents = [
  new EnvironmentalEvent(
    'env_1',
    'Rekordowo słoneczne lato',
    'Tegoroczne lato przyniosło rekordową liczbę dni słonecznych, co zwiększa wydajność PV.',
    90, // 90 dni
    {
      technologyEffect: {
        technology: 'PV',
        marketModifier: 1.1
      }
    }
  ),
  new EnvironmentalEvent(
    'env_2',
    'Silne wiatry na północy',
    'Na północy Polski utrzymują się wyjątkowo silne wiatry, zwiększając potencjał farm wiatrowych.',
    60, // 60 dni
    {
      regionalEffect: {
        marketModifier: 1.15
      },
      technologyEffect: {
        technology: 'WF',
        marketModifier: 1.1
      }
    },
    'pomorskie'
  ),
  new EnvironmentalEvent(
    'env_3',
    'Susze w centralnej Polsce',
    'Długotrwałe susze w centralnej Polsce powodują konflikty o wykorzystanie gruntów.',
    75, // 75 dni
    {
      regionalEffect: {
        permitTimeModifier: 1.2
      }
    },
    'mazowieckie'
  ),
  new EnvironmentalEvent(
    'env_4',
    'Odkrycie cennego gatunku ptaków',
    'W województwie podlaskim odkryto rzadki gatunek ptaków, co komplikuje projekty OZE.',
    120, // 120 dni
    {
      regionalEffect: {
        permitTimeModifier: 1.5
      }
    },
    'podlaskie'
  ),
  new EnvironmentalEvent(
    'env_5',
    'Wysoki poziom zanieczyszczenia powietrza',
    'Zimą odnotowano rekordowo wysokie poziomy zanieczyszczenia powietrza, co zwiększa poparcie dla OZE.',
    60, // 60 dni
    {
      permitTimeModifier: 0.9,
      reputationChange: 3
    }
  )
];

// Technologiczne
const technologicalEvents = [
  new TechnologicalEvent(
    'tech_1',
    'Przełom w wydajności paneli PV',
    'Naukowcy opracowali nową technologię zwiększającą wydajność paneli fotowoltaicznych o 25%.',
    150, // 150 dni
    {
      technologyEffect: {
        technology: 'PV',
        buildCostModifier: 0.9,
        marketModifier: 1.15
      }
    },
    'PV'
  ),
  new TechnologicalEvent(
    'tech_2',
    'Nowa generacja turbin wiatrowych',
    'Na rynek weszła nowa generacja turbin wiatrowych o lepszej wydajności i niższej emisji hałasu.',
    180, // 180 dni
    {
      technologyEffect: {
        technology: 'WF',
        buildCostModifier: 0.85,
        marketModifier: 1.2
      }
    },
    'WF'
  ),
  new TechnologicalEvent(
    'tech_3',
    'Innowacje w magazynach energii',
    'Przełomowe innowacje w technologii magazynów energii zwiększają ich opłacalność.',
    120, // 120 dni
    {
      technologyEffect: {
        technology: 'BESS',
        buildCostModifier: 0.8,
        marketModifier: 1.3
      }
    },
    'BESS'
  ),
  new TechnologicalEvent(
    'tech_4',
    'Problemy jakościowe z chińskimi panelami',
    'Wykryto problemy jakościowe w panelach fotowoltaicznych importowanych z Chin.',
    90, // 90 dni
    {
      technologyEffect: {
        technology: 'PV',
        buildCostModifier: 1.15,
        marketModifier: 0.9
      }
    },
    'PV'
  ),
  new TechnologicalEvent(
    'tech_5',
    'Nowy system prognozowania wiatru',
    'Opracowano nowy system prognozowania wiatru, zwiększający efektywność farm wiatrowych.',
    100, // 100 dni
    {
      technologyEffect: {
        technology: 'WF',
        marketModifier: 1.1
      }
    },
    'WF'
  )
];

// Wszystkie wydarzenia
export const allEvents = [
  ...economicEvents,
  ...politicalEvents,
  ...socialEvents,
  ...environmentalEvents,
  ...technologicalEvents
];

// Losuje wydarzenia określonego typu
export const getRandomEvent = (type = null) => {
  let events = [...allEvents];
  
  if (type) {
    events = events.filter(event => event.type === type);
  }
  
  if (events.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * events.length);
  return events[randomIndex];
};

// Generator wydarzeń
export const generateEvents = (gameDate, probabilities) => {
  const events = [];
  
  // Sprawdzamy dla każdego typu wydarzenia, czy powinno się pojawić
  Object.entries(probabilities).forEach(([type, probability]) => {
    if (Math.random() < probability) {
      const event = getRandomEvent(type);
      if (event) {
        events.push(event.activate(gameDate));
      }
    }
  });
  
  return events;
};

export default {
  allEvents,
  getRandomEvent,
  generateEvents
}; 