import React from "react";
import StoreProvider from "./store/StoreProvider";
import Layout from "./components/Layout";
import MapView from "./components/map/MapView";
import CompanyView from "./components/company/CompanyView";
import EventsView from "./components/events/EventsView";
import CompetitorsView from "./components/competitors/CompetitorsView";
import MarketView from "./components/market/MarketView";
import HRSystem from "./components/HR/HRSystem";
import { useGameContext } from "./store/GameContext";

// Komponent wybierający aktualny widok
const ScreenSelector = () => {
  const { state } = useGameContext();

  switch (state.currentScreen) {
    case "map":
      return <MapView />;
    case "company":
      return <CompanyView />;
    case "events":
      return <EventsView />;
    case "competitors":
      return <CompetitorsView />;
    case "market":
      return <MarketView />;
    case "hr":
      return <HRSystem />;
    default:
      return <MapView />;
  }
};

function App() {
  return (
    <StoreProvider>
      <Layout>
        <ScreenSelector />
      </Layout>
    </StoreProvider>
  );
}

export default App;
