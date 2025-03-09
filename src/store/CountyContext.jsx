import React, { createContext, useReducer, useContext } from "react";
// Tworzymy kontekst dla powiatów
import { getAllCounties } from "../data/counties";
const CountyContext = createContext();

// Początkowy stan to wszystkie powiaty ze wszystkich województw
const initialState = getAllCounties();

// Reducer obsługujący akcje związane z powiatami
function countyReducer(state, action) {
  switch (action.type) {
    case "UPDATE_COUNTY":
      return state.map((county) =>
        county.id === action.payload.id && county.voivodeship === action.payload.voivodeship
          ? { ...county, ...action.payload.changes }
          : county
      );
    case "ADD_PROJECT_TO_COUNTY":
      return state.map((county) =>
        county.id === action.payload.countyId && county.voivodeship === action.payload.voivodeship
          ? {
              ...county,
              projects: [...county.projects, action.payload.project],
              availableLand: Math.max(
                0,
                county.availableLand - action.payload.project.size
              ),
            }
          : county
      );
    case "REMOVE_PROJECT_FROM_COUNTY":
      return state.map((county) =>
        county.id === action.payload.countyId && county.voivodeship === action.payload.voivodeship
          ? {
              ...county,
              projects: county.projects.filter(
                (project) => project.id !== action.payload.projectId
              ),
              availableLand: county.availableLand + action.payload.projectSize,
            }
          : county
      );
    case "ADD_EVENT_TO_COUNTY":
      return state.map((county) =>
        county.id === action.payload.countyId && county.voivodeship === action.payload.voivodeship
          ? {
              ...county,
              events: [...county.events, action.payload.event],
            }
          : county
      );
    case "REMOVE_EVENT_FROM_COUNTY":
      return state.map((county) =>
        county.id === action.payload.countyId && county.voivodeship === action.payload.voivodeship
          ? {
              ...county,
              events: county.events.filter(
                (event) => event.id !== action.payload.eventId
              ),
            }
          : county
      );
    case "UPDATE_COUNTY_PARAMETERS":
      // Aktualizacja parametrów powiatu (np. ceny gruntów, dostępność mocy przyłączeniowej)
      return state.map((county) =>
        county.id === action.payload.countyId && county.voivodeship === action.payload.voivodeship
          ? {
              ...county,
              ...action.payload.parameters,
            }
          : county
      );
    case "UPDATE_ALL_COUNTIES":
      // Symulacja zmian rynkowych wpływających na wszystkie powiaty
      return state.map((county) => {
        // Przykładowa aktualizacja parametrów, która może być wywołana przez wydarzenia
        const solarChange = Math.random() * 5 - 2.5; // -2.5 do +2.5
        const windChange = Math.random() * 5 - 2.5;
        const oppositionChange = Math.random() * 3 - 1.5;
        const priceChange = (Math.random() * 0.1 - 0.05) * county.propertyPrices; // -5% do +5%
        
        return {
          ...county,
          solarPotential: Math.max(0, Math.min(100, county.solarPotential + solarChange)),
          windPotential: Math.max(0, Math.min(100, county.windPotential + windChange)),
          localOpposition: Math.max(0, Math.min(100, county.localOpposition + oppositionChange)),
          propertyPrices: Math.max(0.5, county.propertyPrices + priceChange),
        };
      });
    default:
      return state;
  }
}

// Provider dla kontekstu powiatów
export const CountyProvider = ({ children }) => {
  const [state, dispatch] = useReducer(countyReducer, initialState);

  return (
    <CountyContext.Provider value={{ state, dispatch }}>
      {children}
    </CountyContext.Provider>
  );
};

// Hook do korzystania z kontekstu powiatów
export const useCountyContext = () => {
  const context = useContext(CountyContext);
  if (!context) {
    throw new Error("useCountyContext musi być używany wewnątrz CountyProvider");
  }
  return context;
};

// Funkcje pomocnicze do pracy z kontekstem powiatów
export const getCountiesByVoivodeshipFromContext = (state, voivodeshipId) => {
  return state.filter(county => county.voivodeship === voivodeshipId);
};

export const getCountyFromContext = (state, voivodeshipId, countyId) => {
  return state.find(county => county.voivodeship === voivodeshipId && county.id === countyId) || null;
}; 