import React, { createContext, useContext, useReducer, useEffect } from "react";
import { competitors, generateCompetitorAction } from "../data/competitors";
import { useGameContext } from "./GameContext";
import { useRegionsContext } from "./RegionContext";

// Początkowy stan
const initialState = {
  competitors: competitors,
  competitorEvents: [],
  lastUpdateTurn: 0
};

// Typy akcji
const ACTIONS = {
  UPDATE_COMPETITORS: "UPDATE_COMPETITORS",
  ADD_COMPETITOR_EVENT: "ADD_COMPETITOR_EVENT",
  INCREASE_COMPETITOR_POWER: "INCREASE_COMPETITOR_POWER",
  ADD_COMPETITOR_REGION: "ADD_COMPETITOR_REGION",
  ADD_COMPETITOR_TECHNOLOGY: "ADD_COMPETITOR_TECHNOLOGY"
};

// Reducer
const competitorReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.UPDATE_COMPETITORS:
      return {
        ...state,
        competitors: action.payload,
        lastUpdateTurn: action.turn
      };
    
    case ACTIONS.ADD_COMPETITOR_EVENT:
      return {
        ...state,
        competitorEvents: [...state.competitorEvents, action.payload]
      };
    
    case ACTIONS.INCREASE_COMPETITOR_POWER:
      return {
        ...state,
        competitors: state.competitors.map(competitor => 
          competitor.id === action.payload.competitorId
            ? { 
                ...competitor, 
                power: competitor.power + action.payload.value,
                rtbPower: competitor.rtbPower + Math.floor(action.payload.value * 0.3) // 30% mocy idzie do RTB
              }
            : competitor
        )
      };
    
    case ACTIONS.ADD_COMPETITOR_REGION:
      return {
        ...state,
        competitors: state.competitors.map(competitor => 
          competitor.id === action.payload.competitorId
            ? { 
                ...competitor, 
                strongRegions: [...competitor.strongRegions, action.payload.regionId]
              }
            : competitor
        )
      };
    
    case ACTIONS.ADD_COMPETITOR_TECHNOLOGY:
      return {
        ...state,
        competitors: state.competitors.map(competitor => 
          competitor.id === action.payload.competitorId
            ? { 
                ...competitor, 
                focusTechnologies: [...competitor.focusTechnologies, action.payload.technology]
              }
            : competitor
        )
      };
    
    default:
      return state;
  }
};

// Kontekst
const CompetitorContext = createContext();

// Provider
export const CompetitorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(competitorReducer, initialState);
  const { state: gameState } = useGameContext();
  const { state: regionState } = useRegionsContext();

  // Aktualizacja konkurentów co turę
  useEffect(() => {
    if (gameState.turn > state.lastUpdateTurn) {
      updateCompetitors();
      generateCompetitorEvents();
    }
  }, [gameState.turn]);

  // Funkcja aktualizująca konkurentów
  const updateCompetitors = () => {
    const updatedCompetitors = state.competitors.map(competitor => {
      // Naturalny wzrost mocy konkurenta
      const powerIncrease = Math.floor(competitor.power * (competitor.growth - 1));
      const rtbIncrease = Math.floor(powerIncrease * 0.3); // 30% wzrostu idzie do RTB
      
      return {
        ...competitor,
        power: competitor.power + powerIncrease,
        rtbPower: competitor.rtbPower + rtbIncrease
      };
    });
    
    dispatch({ 
      type: ACTIONS.UPDATE_COMPETITORS, 
      payload: updatedCompetitors,
      turn: gameState.turn
    });
  };

  // Funkcja generująca zdarzenia konkurentów
  const generateCompetitorEvents = () => {
    // Sprawdzamy czy regionState i regionState.regions istnieją
    if (!regionState || !regionState.regions || regionState.regions.length === 0) {
      return; // Przerywamy wykonanie funkcji, jeśli regiony nie są dostępne
    }
    
    // Losujemy konkurenta, który wykona akcję
    const randomCompetitor = state.competitors[Math.floor(Math.random() * state.competitors.length)];
    
    // Generujemy zdarzenie
    const event = generateCompetitorAction(randomCompetitor, regionState.regions);
    
    // Jeśli nie udało się wygenerować zdarzenia, przerywamy funkcję
    if (!event) return;
    
    // Dodajemy zdarzenie
    dispatch({ 
      type: ACTIONS.ADD_COMPETITOR_EVENT, 
      payload: {
        ...event,
        turn: gameState.turn
      }
    });
    
    // Aplikujemy efekty zdarzenia
    event.effects.forEach(effect => {
      switch(effect.type) {
        case 'competitor_power':
        case 'competitor_power_boost':
          dispatch({
            type: ACTIONS.INCREASE_COMPETITOR_POWER,
            payload: {
              competitorId: effect.competitorId,
              value: effect.value
            }
          });
          break;
        
        case 'competitor_technology':
          dispatch({
            type: ACTIONS.ADD_COMPETITOR_TECHNOLOGY,
            payload: {
              competitorId: effect.competitorId,
              technology: effect.value
            }
          });
          break;
        
        // Inne efekty mogą być obsługiwane przez inne konteksty (np. RegionContext)
        default:
          break;
      }
    });
  };

  return (
    <CompetitorContext.Provider value={{ state, dispatch }}>
      {children}
    </CompetitorContext.Provider>
  );
};

// Hook do używania kontekstu
export const useCompetitorContext = () => {
  const context = useContext(CompetitorContext);
  if (!context) {
    throw new Error("useCompetitorContext must be used within a CompetitorProvider");
  }
  return context;
}; 