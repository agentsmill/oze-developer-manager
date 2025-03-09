import React, { useEffect } from 'react';
import { PlayerProvider, usePlayerContext } from './PlayerContext';
import { GameProvider, useGameContext } from './GameContext';
import { EventsProvider, useEventsContext } from './EventContext';
import { RegionsProvider } from './RegionContext';
import { CountyProvider } from './CountyContext';
import useGameDay from '../hooks/useGameDay';

/**
 * Komponent GameDayUpdater, który nasłuchuje na zdarzenie next-game-day
 * i aktualizuje stan gry
 */
const GameDayUpdater = () => {
  const { state: playerState, dispatch: playerDispatch } = usePlayerContext();
  const { state: gameState, dispatch: gameDispatch } = useGameContext();
  const { dispatch: eventsDispatch } = useEventsContext();
  const { updateProjects, generateStaffEvents, generateEconomicEvents } = useGameDay();

  useEffect(() => {
    const handleNextDay = () => {
      // Aktualizujemy postęp projektów
      updateProjects(playerState, gameState, playerDispatch, gameDispatch);
      
      // Generujemy wydarzenia dla pracowników
      generateStaffEvents(playerState, gameState, playerDispatch, eventsDispatch);
      
      // Generujemy wydarzenia ekonomiczne
      generateEconomicEvents(playerState, gameState, gameDispatch, eventsDispatch);
    };

    // Dodajemy nasłuchiwanie na zdarzenie
    window.addEventListener('next-game-day', handleNextDay);

    // Usuwamy nasłuchiwanie przy odmontowaniu
    return () => {
      window.removeEventListener('next-game-day', handleNextDay);
    };
  }, [playerState, gameState, playerDispatch, gameDispatch, eventsDispatch, updateProjects, generateStaffEvents, generateEconomicEvents]);

  return null; // Ten komponent nie renderuje żadnego UI
};

/**
 * Główny provider, który łączy wszystkie konteksty w aplikacji
 * Określa prawidłową kolejność opakowań kontekstów, aby uniknąć cykli zależności
 */
const StoreProvider = ({ children }) => {
  return (
    <EventsProvider>
      <PlayerProvider>
        <RegionsProvider>
          <CountyProvider>
            <GameProvider>
              <GameDayUpdater />
              {children}
            </GameProvider>
          </CountyProvider>
        </RegionsProvider>
      </PlayerProvider>
    </EventsProvider>
  );
};

export default StoreProvider;
