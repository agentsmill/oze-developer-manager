// counties.js - Dane powiatów w Polsce z parametrami dla rozwoju OZE
// Struktura przyporządkowuje powiaty do województw oraz zawiera specyficzne parametry dla każdego powiatu

export const counties = {
  dolnoslaskie: [
    {
      id: "wroclawski",
      name: "Wrocławski",
      capital: "Wrocław",
      population: 640000,
      area: 2930, // km²
      solarPotential: 75, // 0-100
      windPotential: 60, // 0-100
      availableLand: 1800, // ha
      gridCapacity: 120, // MW
      environmentalRestrictions: 45, // 0-100 (wyższe = trudniejsze)
      administrativeEfficiency: 70, // 0-100 (wyższe = sprawniejsze)
      localOpposition: 35, // 0-100 (wyższe = większy opór)
      propertyPrices: 1.8, // mnożnik cen gruntów (1.0 = średnia krajowa)
      projects: [], // aktywne projekty w powiecie
      events: [], // aktywne wydarzenia w powiecie
      isNatura2000: false, // czy obejmuje obszary Natura 2000
      isProtectedLandscape: false, // czy obejmuje obszary chronionego krajobrazu
      powerLines: {
        hv: true, // czy ma linie wysokiego napięcia
        mv: true  // czy ma linie średniego napięcia
      }
    },
    {
      id: "jeleniogorski",
      name: "Jeleniogórski",
      capital: "Jelenia Góra",
      population: 120000,
      area: 1880,
      solarPotential: 65,
      windPotential: 85,
      availableLand: 1200,
      gridCapacity: 80,
      environmentalRestrictions: 75,
      administrativeEfficiency: 65,
      localOpposition: 45,
      propertyPrices: 1.2,
      projects: [],
      events: [],
      isNatura2000: true,
      isProtectedLandscape: true,
      powerLines: {
        hv: true,
        mv: true
      }
    },
    {
      id: "walbrzyski",
      name: "Wałbrzyski",
      capital: "Wałbrzych",
      population: 170000,
      area: 1650,
      solarPotential: 60,
      windPotential: 70,
      availableLand: 900,
      gridCapacity: 70,
      environmentalRestrictions: 65,
      administrativeEfficiency: 60,
      localOpposition: 50,
      propertyPrices: 0.9,
      projects: [],
      events: [],
      isNatura2000: false,
      isProtectedLandscape: true,
      powerLines: {
        hv: true,
        mv: true
      }
    }
  ],
  
  mazowieckie: [
    {
      id: "warszawski",
      name: "Warszawski",
      capital: "Warszawa",
      population: 1800000,
      area: 3200,
      solarPotential: 70,
      windPotential: 55,
      availableLand: 1300,
      gridCapacity: 250,
      environmentalRestrictions: 50,
      administrativeEfficiency: 80,
      localOpposition: 40,
      propertyPrices: 3.2,
      projects: [],
      events: [],
      isNatura2000: false,
      isProtectedLandscape: false,
      powerLines: {
        hv: true,
        mv: true
      }
    },
    {
      id: "radomski",
      name: "Radomski",
      capital: "Radom",
      population: 250000,
      area: 2500,
      solarPotential: 75,
      windPotential: 60,
      availableLand: 2100,
      gridCapacity: 90,
      environmentalRestrictions: 35,
      administrativeEfficiency: 65,
      localOpposition: 30,
      propertyPrices: 0.8,
      projects: [],
      events: [],
      isNatura2000: false,
      isProtectedLandscape: false,
      powerLines: {
        hv: true,
        mv: true
      }
    },
    {
      id: "plocki",
      name: "Płocki",
      capital: "Płock",
      population: 170000,
      area: 1800,
      solarPotential: 65,
      windPotential: 70,
      availableLand: 1900,
      gridCapacity: 110,
      environmentalRestrictions: 40,
      administrativeEfficiency: 60,
      localOpposition: 25,
      propertyPrices: 0.9,
      projects: [],
      events: [],
      isNatura2000: false,
      isProtectedLandscape: false,
      powerLines: {
        hv: true,
        mv: true
      }
    }
  ],
  
  wielkopolskie: [
    {
      id: "poznanski",
      name: "Poznański",
      capital: "Poznań",
      population: 540000,
      area: 2800,
      solarPotential: 65,
      windPotential: 80,
      availableLand: 2200,
      gridCapacity: 150,
      environmentalRestrictions: 40,
      administrativeEfficiency: 75,
      localOpposition: 30,
      propertyPrices: 2.1,
      projects: [],
      events: [],
      isNatura2000: false,
      isProtectedLandscape: false,
      powerLines: {
        hv: true,
        mv: true
      }
    },
    {
      id: "kaliski",
      name: "Kaliski",
      capital: "Kalisz",
      population: 160000,
      area: 2100,
      solarPotential: 70,
      windPotential: 65,
      availableLand: 1800,
      gridCapacity: 85,
      environmentalRestrictions: 35,
      administrativeEfficiency: 70,
      localOpposition: 25,
      propertyPrices: 1.1,
      projects: [],
      events: [],
      isNatura2000: false,
      isProtectedLandscape: false,
      powerLines: {
        hv: true,
        mv: true
      }
    }
  ],
  
  malopolskie: [
    {
      id: "krakowski",
      name: "Krakowski",
      capital: "Kraków",
      population: 760000,
      area: 2300,
      solarPotential: 65,
      windPotential: 40,
      availableLand: 1100,
      gridCapacity: 130,
      environmentalRestrictions: 70,
      administrativeEfficiency: 75,
      localOpposition: 55,
      propertyPrices: 2.5,
      projects: [],
      events: [],
      isNatura2000: false,
      isProtectedLandscape: true,
      powerLines: {
        hv: true,
        mv: true
      }
    },
    {
      id: "tarnowski",
      name: "Tarnowski",
      capital: "Tarnów",
      population: 150000,
      area: 1900,
      solarPotential: 70,
      windPotential: 45,
      availableLand: 1500,
      gridCapacity: 70,
      environmentalRestrictions: 55,
      administrativeEfficiency: 65,
      localOpposition: 40,
      propertyPrices: 1.0,
      projects: [],
      events: [],
      isNatura2000: false,
      isProtectedLandscape: false,
      powerLines: {
        hv: true,
        mv: true
      }
    }
  ],
  
  pomorskie: [
    {
      id: "gdanski",
      name: "Gdański",
      capital: "Gdańsk",
      population: 470000,
      area: 2200,
      solarPotential: 60,
      windPotential: 95,
      availableLand: 1400,
      gridCapacity: 160,
      environmentalRestrictions: 60,
      administrativeEfficiency: 75,
      localOpposition: 35,
      propertyPrices: 2.3,
      projects: [],
      events: [],
      isNatura2000: true,
      isProtectedLandscape: true,
      powerLines: {
        hv: true,
        mv: true
      }
    },
    {
      id: "slupski",
      name: "Słupski",
      capital: "Słupsk",
      population: 120000,
      area: 2500,
      solarPotential: 55,
      windPotential: 100,
      availableLand: 2000,
      gridCapacity: 120,
      environmentalRestrictions: 55,
      administrativeEfficiency: 60,
      localOpposition: 30,
      propertyPrices: 0.9,
      projects: [],
      events: [],
      isNatura2000: true,
      isProtectedLandscape: true,
      powerLines: {
        hv: true,
        mv: true
      }
    }
  ]
};

// Funkcja pomocnicza do pobrania wszystkich powiatów jako płaskiej listy
export const getAllCounties = () => {
  const allCounties = [];
  Object.keys(counties).forEach(voivodeship => {
    counties[voivodeship].forEach(county => {
      allCounties.push({
        ...county,
        voivodeship
      });
    });
  });
  return allCounties;
};

// Funkcja do pobrania powiatów danego województwa
export const getCountiesByVoivodeship = (voivodeshipId) => {
  return counties[voivodeshipId] || [];
};

// Funkcja do pobrania konkretnego powiatu
export const getCounty = (voivodeshipId, countyId) => {
  if (!counties[voivodeshipId]) return null;
  return counties[voivodeshipId].find(county => county.id === countyId) || null;
}; 