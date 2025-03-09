// To jest plik mostkowy zapewniający kompatybilność wsteczną
// Wszystkie komponenty importujące z "EventContext" powinny teraz otrzymać
// funkcjonalność z "EventsContext"
import { EventsProvider, useEventsContext } from './EventsContext';

export { EventsProvider, useEventsContext };
