/**
 * System wydarzeń globalnych dla OZE Developer Manager
 * Wydarzenia możemy podzielić na kilka kategorii:
 * - Ekonomiczne (wpływają na ceny, rynek, itp.)
 * - Polityczne (zmiany przepisów, regulacji)
 * - Społeczne (protesty, poparcie dla OZE)
 * - Środowiskowe (zjawiska pogodowe, klęski)
 * - Technologiczne (innowacje, nowe technologie)
 * - Lokalne (wydarzenia w konkretnych regionach)
 * - Projektowe (wpływające na konkretne projekty)
 */

/**
 * Wpływy wydarzeń na grę:
 * - marketModifier: wpływ na ceny rynkowe (mnożnik)
 * - reputationChange: zmiana reputacji gracza
 * - permitTimeModifier: wpływ na czas uzyskania pozwoleń (mnożnik)
 * - buildCostModifier: wpływ na koszty budowy (mnożnik)
 * - regionalEffect: wpływ na konkretny region/województwo
 * - technologyEffect: wpływ na konkretną technologię (PV, WF, BESS)
 * - projectEffect: wpływ na konkretny typ projektu
 * - countyEffect: wpływ na konkretny powiat
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
  ),
  // Nowe wydarzenia ekonomiczne
  new EconomicEvent(
    'eco_6',
    'Dotacje dla hybryd PV+BESS',
    'Rząd wprowadził program dotacji pokrywający 30% kosztów magazynów energii w projektach hybrydowych.',
    120, // 120 dni
    {
      marketModifier: 1.2,
      permitTimeModifier: 0.9,
      technologyEffect: {
        technology: 'BESS',
        marketModifier: 1.3
      }
    }
  ),
  new EconomicEvent(
    'eco_7',
    'Ulgi podatkowe dla inwestorów OZE',
    'Wprowadzono 50% odliczenia VAT dla firm inwestujących w projekty energetyki odnawialnej.',
    180, // 180 dni
    {
      marketModifier: 1.15,
      permitTimeModifier: 0.85
    }
  ),
  new EconomicEvent(
    'eco_8',
    'Aukcje CPPA',
    'Wprowadzono system długoterminowych kontraktów dla przemysłu, umożliwiających stabilne finansowanie projektów OZE.',
    150, // 150 dni
    {
      marketModifier: 1.25
    }
  ),
  new EconomicEvent(
    'eco_9',
    'Program "Prosument 3.0"',
    'Nowy program rządowy oferuje dotacje do 60% dla mikroinstalacji fotowoltaicznych.',
    90, // 90 dni
    {
      technologyEffect: {
        technology: 'PV',
        marketModifier: 1.2
      }
    }
  ),
  new EconomicEvent(
    'eco_10',
    'Cła na komponenty',
    'Wprowadzono 20% cło na panele fotowoltaiczne z Chin, podnosząc koszty inwestycji.',
    120, // 120 dni
    {
      technologyEffect: {
        technology: 'PV',
        marketModifier: 0.85,
        buildCostModifier: 1.2
      },
      severity: 'negative'
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
  ),
  // Nowe wydarzenia polityczne
  new PoliticalEvent(
    'pol_6',
    'Ustawa "Fast-track"',
    'Sejm przyjął ustawę znacząco skracającą proces pozwoleń dla projektów OZE z 5 do 2 lat.',
    365, // 365 dni
    {
      permitTimeModifier: 0.6,
      reputationChange: 5
    }
  ),
  new PoliticalEvent(
    'pol_7',
    'Krajowy Plan Modernizacji Sieci',
    'Rząd przeznaczył 10 mld zł na rozbudowę infrastruktury przesyłowej, zwiększając możliwości przyłączeniowe.',
    240, // 240 dni
    {
      permitTimeModifier: 0.75,
      buildCostModifier: 0.9
    }
  ),
  new PoliticalEvent(
    'pol_8',
    'Strategia wodorowa',
    'Przyjęto strategię rozwoju wodoru z OZE z celem 2 GW mocy do 2030 roku.',
    180, // 180 dni
    {
      marketModifier: 1.15
    }
  ),
  new PoliticalEvent(
    'pol_9',
    'Zmiana ustawy odległościowej',
    'Wprowadzono zakaz budowy wiatraków w promieniu 1 km od zabudowań, co utrudnia rozwój energetyki wiatrowej.',
    300, // 300 dni
    {
      technologyEffect: {
        technology: 'WF',
        marketModifier: 0.7,
        permitTimeModifier: 1.5
      },
      severity: 'negative'
    }
  ),
  new PoliticalEvent(
    'pol_10',
    'Opóźnienie offshore',
    'Brak ustawy o morskiej energetyce wiatrowej wstrzymuje projekty o łącznej mocy 10 GW.',
    150, // 150 dni
    {
      technologyEffect: {
        technology: 'WF',
        marketModifier: 0.8
      },
      severity: 'negative'
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
  ),
  // Nowe wydarzenia społeczne
  new SocialEvent(
    'soc_6',
    'Subsydia dla mieszkańców',
    'Program "Energia dla Społeczności" oferuje darmowe instalacje PV w zamian za zgodę na farmy wiatrowe.',
    120, // 120 dni
    {
      permitTimeModifier: 0.8,
      reputationChange: 5
    }
  ),
  new SocialEvent(
    'soc_7',
    'Nowe miejsca pracy',
    'Budowa farmy wiatrowej 50 MW stworzyła 100 stałych miejsc pracy w regionie.',
    90, // 90 dni
    {
      reputationChange: 3,
      technologyEffect: {
        technology: 'WF',
        marketModifier: 1.1
      }
    },
    'zachodniopomorskie'
  ),
  new SocialEvent(
    'soc_8',
    'Programy edukacyjne OZE',
    'Warsztaty "Zielona Gmina" w szkołach, finansowane przez deweloperów, zwiększają społeczną akceptację projektów.',
    150, // 150 dni
    {
      permitTimeModifier: 0.9,
      reputationChange: 2
    }
  ),
  new SocialEvent(
    'soc_9',
    'Protesty NIMBY',
    'Blokada budowy farmy wiatrowej przez mieszkańców gminy wzbudziła obawy inwestorów.',
    60, // 60 dni
    {
      permitTimeModifier: 1.3,
      reputationChange: -4,
      technologyEffect: {
        technology: 'WF',
        marketModifier: 0.9
      }
    },
    'małopolskie'
  ),
  new SocialEvent(
    'soc_10',
    'Bunt społeczności',
    'Mieszkańcy blokują wjazd ciężarówek na plac budowy farmy fotowoltaicznej.',
    45, // 45 dni
    {
      buildCostModifier: 1.2,
      permitTimeModifier: 1.4,
      reputationChange: -3
    },
    'podkarpackie'
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
  ),
  // Nowe wydarzenia środowiskowe
  new EnvironmentalEvent(
    'env_6',
    'Korytarze bioróżnorodności',
    'Współprojekty z ekologami, w tym tworzenie pasiek przy farmach PV, zwiększają akceptację środowiskową.',
    120, // 120 dni
    {
      permitTimeModifier: 0.85,
      reputationChange: 3,
      technologyEffect: {
        technology: 'PV',
        buildCostModifier: 1.05
      }
    }
  ),
  new EnvironmentalEvent(
    'env_7',
    'Ekstremalne warunki pogodowe',
    'Gradobicie uszkodziło znaczną część paneli fotowoltaicznych w centralnej Polsce.',
    45, // 45 dni
    {
      buildCostModifier: 1.2,
      technologyEffect: {
        technology: 'PV',
        marketModifier: 0.9
      }
    },
    'łódzkie'
  ),
  new EnvironmentalEvent(
    'env_8',
    'Śmiertelność ptaków',
    'Aktywiści zaskarżyli dewelopera za zabijanie chronionych gatunków ptaków przez turbiny wiatrowe.',
    90, // 90 dni
    {
      permitTimeModifier: 1.3,
      reputationChange: -3,
      technologyEffect: {
        technology: 'WF',
        marketModifier: 0.85
      }
    },
    'warmińsko-mazurskie'
  ),
  new EnvironmentalEvent(
    'env_9',
    'Odkrycie cennego gatunku',
    'W województwie lubelskim odkryto rzadki gatunek roślin, co komplikuje projekty OZE w regionie.',
    150, // 150 dni
    {
      regionalEffect: {
        permitTimeModifier: 1.4
      }
    },
    'lubelskie'
  ),
  new EnvironmentalEvent(
    'env_10',
    'Degradacja środowiska',
    'Wycinka 50 ha lasu pod farmę PV wywołała skandal ekologiczny.',
    75, // 75 dni
    {
      permitTimeModifier: 1.5,
      reputationChange: -5,
      technologyEffect: {
        technology: 'PV',
        marketModifier: 0.8
      }
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
  ),
  // Nowe wydarzenia technologiczne
  new TechnologicalEvent(
    'tech_6',
    'Innowacyjne trackery PV',
    'Nowe systemy śledzenia słońca zwiększają wydajność paneli fotowoltaicznych o 25%.',
    180, // 180 dni
    {
      technologyEffect: {
        technology: 'PV',
        buildCostModifier: 0.85,
        marketModifier: 1.2
      }
    }
  ),
  new TechnologicalEvent(
    'tech_7',
    'Hybrydyzacja OZE',
    'Połączenie PV z wiatrem redukuje LCOE o 18%, zwiększając opłacalność projektów.',
    150, // 150 dni
    {
      buildCostModifier: 0.9,
      marketModifier: 1.15
    }
  ),
  new TechnologicalEvent(
    'tech_8',
    'Optymalizacja BESS',
    'Nowe algorytmy zarządzania zmniejszają straty energii w magazynach o 12%.',
    120, // 120 dni
    {
      technologyEffect: {
        technology: 'BESS',
        marketModifier: 1.25
      }
    }
  ),
  new TechnologicalEvent(
    'tech_9',
    'Partnerstwo z Google',
    'Wdrożenie AI do prognozowania produkcji energii zwiększa efektywność zarządzania farmami.',
    90, // 90 dni
    {
      marketModifier: 1.1
    }
  ),
  new TechnologicalEvent(
    'tech_10',
    'Awaria technologii',
    'Magazyn BESS eksplodował z powodu błędów projektowych, wywołując obawy inwestorów.',
    60, // 60 dni
    {
      technologyEffect: {
        technology: 'BESS',
        marketModifier: 0.75,
        buildCostModifier: 1.3
      },
      severity: 'negative'
    }
  )
];

// Wydarzenia lokalne
class LocalEvent extends EventBase {
  constructor(id, name, description, duration, effects, region, county = null, image = null) {
    super(id, name, description, duration, image);
    this.type = 'local';
    this.effects = effects;
    this.region = region;
    this.county = county;
  }
  
  getEffect() {
    const effect = {...this.effects};
    if (this.region) {
      effect.regionalEffect = {
        region: this.region,
        ...effect.regionalEffect
      };
    }
    if (this.county) {
      effect.countyEffect = {
        region: this.region,
        county: this.county,
        ...effect.countyEffect
      };
    }
    return effect;
  }
}

// Lista wydarzeń lokalnych
const localEvents = [
  new LocalEvent(
    'local_1',
    'Modernizacja infrastruktury',
    'Deweloperzy finansują remont dróg dojazdowych w gminie, zwiększając przychylność mieszkańców.',
    90, // 90 dni
    {
      permitTimeModifier: 0.8,
      reputationChange: 3
    },
    'małopolskie',
    'krakowski'
  ),
  new LocalEvent(
    'local_2',
    'Wzrost przychodów gminy',
    'Dodatkowe 500 000 zł/rok z podatków od farmy 20 MW zwiększyło poparcie lokalnych władz.',
    120, // 120 dni
    {
      permitTimeModifier: 0.7,
      reputationChange: 4
    },
    'mazowieckie',
    'płocki'
  ),
  new LocalEvent(
    'local_3',
    'Projekty społeczne',
    'Budowa świetlicy i siłowni plenerowej w zamian za zgodę na inwestycję OZE.',
    180, // 180 dni
    {
      permitTimeModifier: 0.75,
      reputationChange: 5
    },
    'podlaskie',
    'białostocki'
  ),
  new LocalEvent(
    'local_4',
    'Klastry energii',
    'Gminy łączą się w lokalny system energetyczny, zwiększając możliwości przyłączeniowe.',
    150, // 150 dni
    {
      permitTimeModifier: 0.85,
      buildCostModifier: 0.9
    },
    'śląskie',
    'częstochowski'
  ),
  new LocalEvent(
    'local_5',
    'Konflikty o grunty',
    'Właściciele ziemi żądają podwyżek czynszu o 300%, co utrudnia pozyskiwanie gruntów.',
    60, // 60 dni
    {
      buildCostModifier: 1.3,
      permitTimeModifier: 1.2
    },
    'wielkopolskie',
    'poznański'
  ),
  new LocalEvent(
    'local_6',
    'Brak przyłączy',
    'Operator odmawia podłączenia farmy z powodu przeciążenia sieci w regionie.',
    90, // 90 dni
    {
      permitTimeModifier: 1.5
    },
    'łódzkie',
    'łódzki wschodni'
  ),
  new LocalEvent(
    'local_7',
    'Spadek wartości nieruchomości',
    'Domy w pobliżu farmy wiatrowej straciły 20% wartości, wywołując protesty mieszkańców.',
    75, // 75 dni
    {
      permitTimeModifier: 1.3,
      reputationChange: -4
    },
    'pomorskie',
    'słupski'
  )
];

// Wydarzenia projektowe
class ProjectEvent extends EventBase {
  constructor(id, name, description, duration, effects, technology = null, image = null) {
    super(id, name, description, duration, image);
    this.type = 'project';
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

// Lista wydarzeń projektowych
const projectEvents = [
  new ProjectEvent(
    'proj_1',
    'Finansowanie z UE',
    'Uzyskano grant 15 mln zł z Funduszu Spójności na budowę magazynu energii.',
    90, // 90 dni
    {
      buildCostModifier: 0.7,
      technologyEffect: {
        marketModifier: 1.2
      }
    },
    'BESS'
  ),
  new ProjectEvent(
    'proj_2',
    'Digital Twin',
    'Cyfrowy model farmy zmniejsza ryzyko awarii o 40%, zwiększając wartość projektu.',
    120, // 120 dni
    {
      marketModifier: 1.15
    },
    'PV'
  ),
  new ProjectEvent(
    'proj_3',
    'Certyfikat ESG',
    'Uzyskanie ratingu AA+ przyciąga inwestorów i zwiększa wartość projektu.',
    150, // 150 dni
    {
      marketModifier: 1.2,
      reputationChange: 3
    }
  ),
  new ProjectEvent(
    'proj_4',
    'Recykling na miejscu',
    'Mobilne zakłady przetwarzania zużytych paneli zwiększają ekologiczność projektu.',
    180, // 180 dni
    {
      marketModifier: 1.1,
      reputationChange: 4
    },
    'PV'
  ),
  new ProjectEvent(
    'proj_5',
    'Opóźnienie pozwoleń',
    'Decyzja środowiskowa przeciąga się o 18 miesięcy z powodu protestów ekologów.',
    90, // 90 dni
    {
      permitTimeModifier: 1.6
    }
  ),
  new ProjectEvent(
    'proj_6',
    'Bank wycofuje finansowanie',
    'Podwyżka stóp procentowych spowodowała wycofanie się banku z finansowania projektu.',
    60, // 60 dni
    {
      marketModifier: 0.8,
      buildCostModifier: 1.2
    }
  ),
  new ProjectEvent(
    'proj_7',
    'Wzrost składek ubezpieczeniowych',
    'Po huraganie koszt polisy dla farm PV wzrósł o 200%.',
    120, // 120 dni
    {
      buildCostModifier: 1.15
    },
    'PV'
  )
];

// Wszystkie wydarzenia
const allEvents = [
  ...economicEvents,
  ...politicalEvents,
  ...socialEvents,
  ...environmentalEvents,
  ...technologicalEvents,
  ...localEvents,
  ...projectEvents
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

// Generator wydarzeń - zwiększam prawdopodobieństwa, aby więcej wydarzeń się pojawiało
export const generateEvents = (gameDate, probabilities) => {
  const events = [];
  
  // Zamiast prawdopodobieństw z parametru, używamy zwiększonych wartości
  const increasedProbabilities = {
    economic: 0.2,  // 20% szans na wydarzenie ekonomiczne każdego dnia
    political: 0.15, // 15% szans na wydarzenie polityczne
    social: 0.18,    // 18% szans na wydarzenie społeczne
    environmental: 0.17, // 17% szans na wydarzenie środowiskowe
    technological: 0.14, // 14% szans na wydarzenie technologiczne
    local: 0.25,     // 25% szans na wydarzenie lokalne
    project: 0.2     // 20% szans na wydarzenie projektowe
  };
  
  // Sprawdzamy dla każdego typu wydarzenia, czy powinno się pojawić
  Object.entries(increasedProbabilities).forEach(([type, probability]) => {
    if (Math.random() < probability) {
      const event = getRandomEvent(type);
      if (event) {
        events.push(event.activate(gameDate));
      }
    }
  });
  
  return events;
};

// Eksport domyślny
export default {
  economicEvents,
  politicalEvents,
  socialEvents,
  environmentalEvents,
  technologicalEvents,
  localEvents,
  projectEvents,
  allEvents,
  getRandomEvent,
  generateEvents
}; 