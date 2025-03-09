import React, { createContext, useReducer, useContext } from "react";
import { competitors } from "../data/competitors";
import useGameDay from "../hooks/useGameDay";
// Importujemy system wydarzeń globalnych
import globalEventSystem, { generateEvents } from "../data/globalEvents";

// Funkcja pomocnicza do dodawania dni do daty
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Formatowanie daty do polskiego formatu
const formatDate = (date) => {
  return date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Początkowy stan gry
const initialState = {
  turn: 1,
  day: 1,
  currentScreen: "map",
  selectedRegion: null,
  selectedProject: null,
  selectedCounty: null, // Dodajemy wybrany powiat
  notification: null,
  gameSpeed: 1,
  competitors: competitors, // Dodajemy konkurentów do stanu gry
  marketProjects: [], // Projekty dostępne na giełdzie
  marketHistory: [], // Historia transakcji na giełdzie
  marketPriceModifiers: {
    PV: 1.0,
    WF: 1.0,
    BESS: 1.0
  },
  parallelProcessing: {
    enabled: true,
    maxParallelTasks: 3
  },
  // System czasu gry
  gameDate: new Date(2025, 0, 1), // 1 stycznia 2025
  lastDateUpdate: new Date(),
  // Nowe cele gry
  gameGoals: {
    rtbPowerTarget: 25000, // 25 GW = 25000 MW
    cashTarget: 10000000000, // 10 mld zł
    currentRtbPower: 0,
    isWon: false,
    winReason: null,
    startYear: 2025
  },
  // Ustawienia dotyczące nowego modułu powiatów
  countySettings: {
    showCounties: true,
    filterByPotential: false,
    minSolarPotential: 0,
    minWindPotential: 0,
    maxLocalOpposition: 100
  },
  // Stan wydarzeń globalnych
  globalEvents: {
    currentEvents: [],
    eventProbabilities: {
      economic: 0.25,  // Zwiększona szansa na wydarzenia ekonomiczne
      political: 0.20, // Zwiększona szansa na wydarzenia polityczne
      social: 0.25,    // Zwiększona szansa na wydarzenia społeczne
      environmental: 0.20, // Zwiększona szansa na wydarzenia środowiskowe
      technological: 0.20, // Zwiększona szansa na wydarzenia technologiczne
      local: 0.30,     // Wysoka szansa na wydarzenia lokalne
      project: 0.25    // Wysoka szansa na wydarzenia projektowe
    }
  }
};

// Reducer do obsługi akcji
function gameReducer(state, action) {
  switch (action.type) {
    case "SET_SCREEN":
      return { ...state, currentScreen: action.payload };
    case "SELECT_REGION":
      return { ...state, selectedRegion: action.payload, selectedCounty: null };
    case "SELECT_PROJECT":
      return { ...state, selectedProject: action.payload };
    case "SELECT_COUNTY":
      return { 
        ...state, 
        selectedCounty: {
          voivodeshipId: action.payload.voivodeshipId,
          countyId: action.payload.countyId
        } 
      };
    case "SET_NOTIFICATION":
      return { ...state, notification: action.payload };
    case "SET_GAME_SPEED":
      return { ...state, gameSpeed: action.payload };
    case "NEXT_DAY":
      // Obliczamy ile dni ma minąć w oparciu o prędkość gry
      const daysToAdd = state.gameSpeed;
      const newGameDate = addDays(state.gameDate, daysToAdd);
      
      // Przetwarzamy wygasłe wydarzenia
      const activeEvents = state.globalEvents.currentEvents.filter(
        event => !event.isExpired(newGameDate)
      );
      
      return {
        ...state,
        day: state.day + 1,
        turn: state.day % 2 === 1 ? state.turn + 1 : state.turn,
        gameDate: newGameDate,
        lastDateUpdate: new Date(),
        globalEvents: {
          ...state.globalEvents,
          currentEvents: activeEvents
        }
      };
    case "UPDATE_MARKET_PROJECTS":
      return { ...state, marketProjects: action.payload };
    case "ADD_MARKET_TRANSACTION":
      return { 
        ...state, 
        marketHistory: [...state.marketHistory, action.payload],
        marketProjects: state.marketProjects.filter(p => p.id !== action.payload.projectId)
      };
    case "UPDATE_MARKET_PRICE_MODIFIERS":
      return { 
        ...state, 
        marketPriceModifiers: {
          ...state.marketPriceModifiers,
          ...action.payload
        }
      };
    case "SET_PARALLEL_PROCESSING":
      return {
        ...state,
        parallelProcessing: {
          ...state.parallelProcessing,
          ...action.payload
        }
      };
    case "UPDATE_GAME_GOALS":
      return {
        ...state,
        gameGoals: {
          ...state.gameGoals,
          ...action.payload
        }
      };
    case "SET_WIN_CONDITION":
      return {
        ...state,
        gameGoals: {
          ...state.gameGoals,
          isWon: true,
          winReason: action.payload
        }
      };
    case "ADD_GLOBAL_EVENT":
      return {
        ...state,
        globalEvents: {
          ...state.globalEvents,
          currentEvents: [...state.globalEvents.currentEvents, action.payload]
        }
      };
    case "ADD_GLOBAL_EVENTS":
      return {
        ...state,
        globalEvents: {
          ...state.globalEvents,
          currentEvents: [...state.globalEvents.currentEvents, ...action.payload]
        }
      };
    case "REMOVE_GLOBAL_EVENT":
      return {
        ...state,
        globalEvents: {
          ...state.globalEvents,
          currentEvents: state.globalEvents.currentEvents.filter(
            event => event.id !== action.payload
          )
        }
      };
    case "UPDATE_EVENT_PROBABILITIES":
      return {
        ...state,
        globalEvents: {
          ...state.globalEvents,
          eventProbabilities: {
            ...state.globalEvents.eventProbabilities,
            ...action.payload
          }
        }
      };
    default:
      return state;
  }
}

// Kontekst do przechowywania stanu gry
const GameContext = createContext();

// Provider
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { updateProjects, generateStaffEvents } = useGameDay();
  
  // Funkcja do wyświetlania powiadomień
  const showNotification = (text, type = "info") => {
    dispatch({
      type: "SET_NOTIFICATION",
      payload: { text, type }
    });
    
    // Automatyczne ukrywanie powiadomienia po 5 sekundach
    setTimeout(() => {
      dispatch({
        type: "SET_NOTIFICATION",
        payload: null
      });
    }, 5000);
  };
  
  // Funkcja do przejścia do następnego dnia
  const nextDay = () => {
    // Generujemy nowe wydarzenia dla bieżącego dnia
    // Zmieniamy mechanizm generowania wydarzeń, aby generować je częściej
    // Obecnie generujemy co dzień, ale teraz zrobimy to szybciej
    
    // Losujemy liczbę wydarzeń do wygenerowania (1-3)
    const numEventsToGenerate = Math.floor(Math.random() * 3) + 1;
    
    let newEvents = [];
    for (let i = 0; i < numEventsToGenerate; i++) {
      const generatedEvents = generateEvents(
        state.gameDate, 
        state.globalEvents.eventProbabilities
      );
      newEvents = [...newEvents, ...generatedEvents];
    }
    
    // Dodajemy nowe wydarzenia
    if (newEvents && newEvents.length > 0) {
      dispatch({ 
        type: "ADD_GLOBAL_EVENTS", 
        payload: newEvents 
      });
      
      // Pokazujemy powiadomienia o nowych wydarzeniach, maksymalnie 3
      const eventsToNotify = newEvents.slice(0, 3);
      eventsToNotify.forEach(event => {
        showNotification(
          `Nowe wydarzenie: ${event.name} - ${event.description.substring(0, 100)}${event.description.length > 100 ? '...' : ''}`,
          "event"
        );
      });
      
      // Jeśli jest więcej niż 3 wydarzenia, pokazujemy zbiorcze powiadomienie
      if (newEvents.length > 3) {
        showNotification(
          `Łącznie wygenerowano ${newEvents.length} nowych wydarzeń. Sprawdź zakładkę Wydarzenia.`,
          "info"
        );
      }
    }
    
    // Wykonujemy standardową akcję przejścia do następnego dnia
    dispatch({ type: "NEXT_DAY" });
    
    // Wysyłamy zdarzenie, które zostanie obsłużone w StoreProvider
    window.dispatchEvent(new CustomEvent('next-game-day'));
    
    // Sprawdzenie celów gry po każdym dniu
    checkGameGoals();
  };
  
  // Funkcja obliczająca łączny efekt aktywnych wydarzeń
  const calculateEventsEffect = (effectType) => {
    if (!state.globalEvents.currentEvents || state.globalEvents.currentEvents.length === 0) {
      // Brak wydarzeń - zwracamy wartość neutralną
      return 1.0;
    }
    
    // Zbieramy efekty wszystkich aktywnych wydarzeń
    let multiplier = 1.0;
    
    state.globalEvents.currentEvents.forEach(event => {
      const effect = event.getEffect();
      
      // Sprawdzamy globalny modyfikator
      if (effect[effectType]) {
        multiplier *= effect[effectType];
      }
      
      // Sprawdzamy efekty regionalne i technologiczne
      if (effect.regionalEffect && effect.regionalEffect[effectType]) {
        // Tu można dodać sprawdzanie, czy efekt dotyczy aktualnie wybranego regionu
        // Dla uproszczenia dodajemy wszystkie
        multiplier *= effect.regionalEffect[effectType];
      }
      
      if (effect.technologyEffect && effect.technologyEffect[effectType]) {
        // Tu można dodać sprawdzanie, czy efekt dotyczy aktualnie wybranej technologii
        // Dla uproszczenia dodajemy wszystkie
        multiplier *= effect.technologyEffect[effectType];
      }
    });
    
    return multiplier;
  };
  
  // Funkcja sprawdzająca, czy gracz osiągnął cele gry
  const checkGameGoals = () => {
    // Sprawdź, czy gracz ma wystarczającą moc projektów RTB
    if (state.gameGoals.currentRtbPower >= state.gameGoals.rtbPowerTarget && !state.gameGoals.isWon) {
      dispatch({
        type: "SET_WIN_CONDITION",
        payload: "rtb_power"
      });
      
      showNotification(
        `Gratulacje! Osiągnąłeś cel 25 GW mocy w projektach Ready-to-Build. Jesteś liderem polskiego rynku OZE!`,
        "win"
      );
    }
    
    // Sprawdź, czy gracz ma wystarczającą ilość gotówki
    if (state.gameGoals.cash >= state.gameGoals.cashTarget && !state.gameGoals.isWon) {
      dispatch({
        type: "SET_WIN_CONDITION",
        payload: "cash"
      });
      
      showNotification(
        `Gratulacje! Zgromadziłeś 10 miliardów złotych! Jesteś finansowym gigantem polskiego rynku OZE!`,
        "win"
      );
    }
  };

  return (
    <GameContext.Provider value={{ 
      state, 
      dispatch,
      showNotification,
      nextDay,
      checkGameGoals,
      calculateEventsEffect
    }}>
      {children}
    </GameContext.Provider>
  );
};

// Hook do używania kontekstu
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext musi być używany wewnątrz GameProvider");
  }
  return context;
};
