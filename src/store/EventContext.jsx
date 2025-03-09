import React, { createContext, useReducer, useContext } from "react";

const EventContext = createContext();

// Początkowy stan wydarzeń
const initialState = [];

function eventReducer(state, action) {
  switch (action.type) {
    case "ADD_EVENT":
      return [...state, action.payload];
    case "REMOVE_EVENT":
      return state.filter((event) => event.id !== action.payload);
    case "CLEAR_EXPIRED_EVENTS":
      return state.filter(
        (event) => !event.expires || event.expires > action.payload.currentTurn
      );
    default:
      return state;
  }
}

export const EventsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(eventReducer, initialState);

  return (
    <EventContext.Provider value={{ state, dispatch }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEventsContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEventsContext must be used within a EventsProvider");
  }
  return context;
};
