import React, { createContext, useContext, useReducer } from 'react';

const EventsContext = createContext();

// Początkowy stan wydarzeń
const initialState = {
  events: [
    {
      id: 'initial-event-1',
      type: 'economic_event',
      title: 'Początek działalności',
      description: 'Rozpoczynasz swoją przygodę w sektorze OZE. Powodzenia!',
      severity: 'positive',
      turn: 1,
      expires: 10
    },
    {
      id: 'initial-event-2',
      type: 'staff_event',
      title: 'Zatrudnienie pierwszych pracowników',
      description: 'Czas zbudować zespół, który będzie realizował Twoje projekty.',
      severity: 'info',
      turn: 1,
      expires: 8
    },
    {
      id: 'initial-event-3',
      type: 'project_event',
      title: 'Rynek OZE w Polsce',
      description: 'Rynek OZE w Polsce dynamicznie się rozwija. To dobry moment na inwestycje.',
      severity: 'info',
      turn: 1,
      expires: 12
    }
  ],
  filters: {
    type: 'all',
    severity: 'all',
    staffId: null,
    projectId: null
  }
};

function eventsReducer(state, action) {
  switch (action.type) {
    case "ADD_EVENT":
      return {
        ...state,
        events: [...state.events, action.payload]
      };
    case "REMOVE_EVENT":
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.payload)
      };
    case "CLEAR_EXPIRED_EVENTS":
      return {
        ...state,
        events: state.events.filter(
          (event) => !event.expires || event.expires > action.payload.currentTurn
        )
      };
    case "SET_FILTER":
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.filterType]: action.payload.value
        }
      };
    case "CLEAR_FILTERS":
      return {
        ...state,
        filters: {
          type: 'all',
          severity: 'all',
          staffId: null,
          projectId: null
        }
      };
    default:
      return state;
  }
}

export function EventsProvider({ children }) {
  const [state, dispatch] = useReducer(eventsReducer, initialState);
  
  return (
    <EventsContext.Provider value={{ state, dispatch }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEventsContext() {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEventsContext must be used within an EventsProvider');
  }
  return context;
} 