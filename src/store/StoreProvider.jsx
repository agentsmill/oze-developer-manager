import React, { useEffect } from 'react';
import { PlayerProvider, usePlayerContext } from './PlayerContext';
import { GameProvider, useGameContext } from './GameContext';
import { EventsProvider } from './EventsContext';
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
  
  // Używamy hooka bezpośrednio
  const gameDay = useGameDay();

  useEffect(() => {
    const handleNextDay = () => {
      const { updateProjects, generateStaffEvents, generateEconomicEvents, generateProjectEvents } = gameDay;
      
      // Aktualizujemy postęp projektów
      updateProjects && updateProjects(playerState, gameState, playerDispatch, gameDispatch);
      
      // Generujemy wydarzenia dla pracowników
      generateStaffEvents && generateStaffEvents(playerState, gameState, playerDispatch);
      
      // Generujemy wydarzenia ekonomiczne
      generateEconomicEvents && generateEconomicEvents(playerState, gameState, gameDispatch);
      
      // Generujemy wydarzenia dla projektów
      generateProjectEvents && generateProjectEvents(playerState, gameState, playerDispatch, gameDispatch);
    };

    // Dodajemy nasłuchiwanie na zdarzenie
    window.addEventListener('next-game-day', handleNextDay);

    // Usuwamy nasłuchiwanie przy odmontowaniu
    return () => {
      window.removeEventListener('next-game-day', handleNextDay);
    };
  }, [playerState, gameState, playerDispatch, gameDispatch, gameDay]);

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
