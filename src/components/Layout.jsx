import React from "react";
import {
  Map,
  Circle,
  Users,
  Wind,
  Sun,
  AlertTriangle,
  Banknote,
  BarChart3,
  Calendar,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useGameContext } from "../store/GameContext";
import { usePlayerContext } from "../store/PlayerContext";
import Notification from "./ui/Notification";
import "../styles/custom.css";

// Funkcja pomocnicza do formatowania daty
const formatDate = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const Layout = ({ children }) => {
  const { state, dispatch, nextDay } = useGameContext();
  const { state: playerState } = usePlayerContext();

  return (
    <div className="app-container">
      {/* Nagłówek z informacjami o grze */}
      <header className="app-header">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">OZE Developer Manager</h1>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {formatDate(state.gameDate)} <span className="text-xs text-gray-500">(Dzień: {state.day})</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Banknote className="h-4 w-4" />
              <span className="text-sm">
                {playerState.cash.toLocaleString()} PLN
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="text-sm">
                Reputacja: {playerState.reputation}/200
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Wind className="h-4 w-4" />
              <span className="text-sm">
                Moc RTB: {playerState.rtbPower.toLocaleString()} MW
              </span>
            </div>
            <div className="speed-control ml-4">
              <button
                onClick={() => dispatch({ type: "SET_GAME_SPEED", payload: 1 })}
                className={`speed-button ${state.gameSpeed === 1 ? "active" : ""}`}
                title="1 dzień"
              >
                1x
              </button>
              <button
                onClick={() => dispatch({ type: "SET_GAME_SPEED", payload: 3 })}
                className={`speed-button ${state.gameSpeed === 3 ? "active" : ""}`}
                title="3 dni"
              >
                3x
              </button>
              <button
                onClick={() => dispatch({ type: "SET_GAME_SPEED", payload: 5 })}
                className={`speed-button ${state.gameSpeed === 5 ? "active" : ""}`}
                title="5 dni"
              >
                5x
              </button>
              <button
                onClick={() => dispatch({ type: "SET_GAME_SPEED", payload: 10 })}
                className={`speed-button ${state.gameSpeed === 10 ? "active" : ""}`}
                title="10 dni"
              >
                10x
              </button>
            </div>
            <button
              onClick={nextDay}
              className="btn btn-primary px-3 py-1 flex items-center gap-1 text-white rounded"
              title={`Przejdź do następnego dnia (+${state.gameSpeed} ${state.gameSpeed === 1 ? 'dzień' : 'dni'})`}
            >
              <ChevronRight className="h-4 w-4" />
              {state.gameSpeed > 1 
                ? `+${state.gameSpeed} dni` 
                : "Następny dzień"}
            </button>
          </div>
        </div>
      </header>

      {/* Nawigacja między ekranami */}
      <nav className="app-nav">
        <div className="flex gap-4">
          <NavButton
            icon={<Map className="h-4 w-4" />}
            screenName="map"
            label="Mapa Polski"
            currentScreen={state.currentScreen}
            onClick={() =>
              dispatch({ type: "SET_SCREEN", payload: "map" })
            }
          />
          <NavButton
            icon={<Circle className="h-4 w-4" />}
            screenName="company"
            label="Zarządzanie Spółką"
            currentScreen={state.currentScreen}
            onClick={() =>
              dispatch({ type: "SET_SCREEN", payload: "company" })
            }
          />
          <NavButton
            icon={<AlertTriangle className="h-4 w-4" />}
            screenName="events"
            label="Wydarzenia"
            currentScreen={state.currentScreen}
            onClick={() =>
              dispatch({ type: "SET_SCREEN", payload: "events" })
            }
          />
          <NavButton
            icon={<BarChart3 className="h-4 w-4" />}
            screenName="competitors"
            label="Konkurencja"
            currentScreen={state.currentScreen}
            onClick={() =>
              dispatch({ type: "SET_SCREEN", payload: "competitors" })
            }
          />
          <NavButton
            icon={<Sun className="h-4 w-4" />}
            screenName="market"
            label="Giełda Projektów"
            currentScreen={state.currentScreen}
            onClick={() =>
              dispatch({ type: "SET_SCREEN", payload: "market" })
            }
          />
        </div>
      </nav>

      {/* Główny ekran gry */}
      <main className="flex flex-1 overflow-auto">
        {children}
      </main>

      {/* Panel powiadomień */}
      {state.notification && (
        <Notification
          text={state.notification.text}
          type={state.notification.type}
          onClose={() =>
            dispatch({ type: "SET_NOTIFICATION", payload: null })
          }
        />
      )}
    </div>
  );
};

const NavButton = ({ icon, screenName, label, currentScreen, onClick }) => {
  const isActive = currentScreen === screenName;
  return (
    <button
      onClick={onClick}
      className={`nav-button flex items-center px-3 py-1 rounded text-white ${
        isActive ? "active" : ""
      }`}
    >
      <span className="mr-1">{icon}</span> {label}
    </button>
  );
};

export default Layout;
