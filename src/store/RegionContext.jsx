import React, { createContext, useReducer, useContext } from "react";
import { initialRegions } from "../data/regions";

const RegionContext = createContext();

function regionReducer(state, action) {
  switch (action.type) {
    case "UPDATE_REGION":
      return state.map((region) =>
        region.id === action.payload.id
          ? { ...region, ...action.payload.changes }
          : region
      );
    case "ADD_PROJECT_TO_REGION":
      return state.map((region) =>
        region.id === action.payload.regionId
          ? {
              ...region,
              projects: [...region.projects, action.payload.project],
              availableLand: Math.max(
                0,
                region.availableLand - action.payload.project.size
              ),
            }
          : region
      );
    case "UPDATE_REGIONAL_CONDITIONS":
      return state.map((region) => {
        // Losowe fluktuacje warunków
        const solarChange = Math.floor(Math.random() * 5) - 2; // -2 do +2
        const windChange = Math.floor(Math.random() * 5) - 2; // -2 do +2
        const socialChange = Math.floor(Math.random() * 3) - 1; // -1 do +1

        return {
          ...region,
          solarConditions: Math.min(
            100,
            Math.max(0, region.solarConditions + solarChange)
          ),
          windConditions: Math.min(
            100,
            Math.max(0, region.windConditions + windChange)
          ),
          socialAcceptance: Math.min(
            100,
            Math.max(0, region.socialAcceptance + socialChange)
          ),
        };
      });
    default:
      return state;
  }
}

export const RegionsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(regionReducer, initialRegions);

  return (
    <RegionContext.Provider value={{ state, dispatch }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegionsContext = () => {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error("useRegionsContext must be used within a RegionsProvider");
  }
  return context;
};
