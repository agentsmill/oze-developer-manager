import React, { useState } from "react";
import { useEventsContext } from "../../store/EventContext";
import { useGameContext } from "../../store/GameContext";
import { usePlayerContext } from "../../store/PlayerContext";
import { translateEventType, translateEventEffect } from "../../utils/translators";
import { AlertTriangle, FileText, TrendingUp, Shield, Users, Activity, Filter, Globe } from "lucide-react";
import GlobalEventsPanel from "./GlobalEventsPanel";

const EventsView = () => {
  const { state: events } = useEventsContext();
  const { state: gameState } = useGameContext();
  const { state: playerState } = usePlayerContext();
  
  // Stan dla filtrów
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  
  // Filtrujemy aktywne wydarzenia (które jeszcze nie wygasły)
  const activeEvents = events.filter(e => (!e.expires || e.expires > gameState.turn));
  
  // Filtrujemy według kategorii
  const economicEvents = activeEvents.filter(e => e.type === 'economic_event');
  const staffEvents = activeEvents.filter(e => e.type === 'staff_event');
  const auditEvents = activeEvents.filter(e => e.type === 'audit');
  const illegalEvents = activeEvents.filter(e => e.type === 'illegal_activity');
  const otherEvents = activeEvents.filter(e => 
    e.type !== 'economic_event' && 
    e.type !== 'staff_event' && 
    e.type !== 'audit' && 
    e.type !== 'illegal_activity'
  );
  
  // Filtrujemy wydarzenia globalne i lokalne
  const globalEvents = activeEvents.filter(e => !e.regionId && !e.countyId);
  const localEvents = activeEvents.filter(e => e.regionId || e.countyId);
  
  // Filtrujemy wydarzenia według wybranych filtrów
  const filteredEvents = activeEvents.filter(event => {
    // Filtrowanie według typu
    if (eventTypeFilter !== "all" && event.type !== eventTypeFilter) {
      return false;
    }
    
    // Filtrowanie według ważności
    if (severityFilter !== "all" && event.severity !== severityFilter) {
      return false;
    }
    
    return true;
  });
  
  // Sortujemy wydarzenia od najnowszych
  const sortedEvents = [...filteredEvents].sort((a, b) => b.turn - a.turn);
  
  // Historia wszystkich wydarzeń
  const allSortedEvents = [...events].sort((a, b) => b.turn - a.turn);
  
  // Funkcja do wyświetlania ikon wydarzeń
  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'economic_event':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'staff_event':
        return <Users className="h-5 w-5 text-green-500" />;
      case 'audit':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'illegal_activity':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Funkcja do określania klasy CSS dla wydarzenia na podstawie ważności
  const getEventClass = (severity) => {
    switch (severity) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-l-4 border-green-500';
      case 'negative':
        return 'bg-red-100 text-red-800 border-l-4 border-red-500';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500';
      default:
        return 'bg-blue-100 text-blue-800 border-l-4 border-blue-500';
    }
  };

  return (
    <div className="flex flex-1">
      <div className="flex-1 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Panel wydarzeń</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-4">
          <div className="bg-white p-3 rounded shadow">
            <div className="text-sm text-gray-500">Aktywne</div>
            <div className="text-xl font-bold">{activeEvents.length}</div>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <div className="text-sm text-gray-500">Ekonomiczne</div>
            <div className="text-xl font-bold">{economicEvents.length}</div>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <div className="text-sm text-gray-500">Personalne</div>
            <div className="text-xl font-bold">{staffEvents.length}</div>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <div className="text-sm text-gray-500">Audyty</div>
            <div className="text-xl font-bold">{auditEvents.length}</div>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <div className="text-sm text-gray-500">Nielegalne</div>
            <div className="text-xl font-bold">{illegalEvents.length}</div>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <div className="text-sm text-gray-500">Globalne / Lokalne</div>
            <div className="text-xl font-bold">{globalEvents.length} / {localEvents.length}</div>
          </div>
        </div>
        
        {/* Filtrowanie wydarzeń */}
        <div className="bg-white p-4 rounded shadow mb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-gray-700 font-medium">Filtruj wydarzenia:</span>
            </div>
            
            <div>
              <select 
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="all">Wszystkie typy</option>
                <option value="economic_event">Ekonomiczne</option>
                <option value="staff_event">Personel</option>
                <option value="audit">Audyty</option>
                <option value="illegal_activity">Nielegalne</option>
              </select>
            </div>
            
            <div>
              <select 
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="all">Wszystkie ważności</option>
                <option value="positive">Pozytywne</option>
                <option value="negative">Negatywne</option>
                <option value="warning">Ostrzeżenia</option>
                <option value="info">Informacyjne</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Panel wydarzeń globalnych */}
        <div className="mb-4">
          <h3 className="font-bold text-lg mb-3 flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Wydarzenia globalne
          </h3>
          <GlobalEventsPanel />
        </div>
        
        {/* Aktywne wydarzenia */}
        <div className="bg-white p-4 rounded shadow mb-4">
          <h3 className="font-bold text-lg mb-3 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Aktywne wydarzenia
          </h3>
          
          {sortedEvents.length > 0 ? (
            <div className="space-y-3">
              {sortedEvents.map(event => (
                <div 
                  key={event.id} 
                  className={`p-3 rounded ${getEventClass(event.severity)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-bold flex items-center">
                      {getEventIcon(event.type)}
                      <span className="ml-2">{event.title}</span>
                    </div>
                    <div className="text-xs bg-gray-200 rounded px-2 py-1 text-gray-800">
                      Tura {event.turn}
                      {event.expires && <span> (wygasa: {event.expires})</span>}
                    </div>
                  </div>
                  <div className="mt-1">{event.description}</div>
                  
                  {event.effect && (
                    <div className="mt-2 text-sm">
                      <div className="font-medium">Efekt:</div>
                      <div className="flex items-center mt-1">
                        <div className="bg-gray-200 text-gray-800 rounded px-2 py-1">
                          {event.effect.type === 'market_price_modifier' && 
                            `Mnożnik ceny: ${event.effect.value.toFixed(2)}x dla ${event.effect.technology === 'all' ? 'wszystkich technologii' : event.effect.technology}`
                          }
                          {event.effect.type === 'project_speed' && 
                            `Szybkość projektów: ${(event.effect.value * 100).toFixed(0)}%`
                          }
                        </div>
                        <div className="ml-2 text-xs text-gray-500">
                          Pozostało: {event.expires - gameState.turn} tur
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {event.regionId && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Region:</span> {event.regionId}
                    </div>
                  )}
                  
                  {event.countyId && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Powiat:</span> {event.countyId}
                    </div>
                  )}
                  
                  {event.projectId && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Projekt:</span> {
                        playerState.projects.find(p => p.id === event.projectId)?.name || "Nieznany projekt"
                      }
                    </div>
                  )}
                  
                  {event.staffId && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Pracownik:</span> {event.staffName || "Nieznany pracownik"}
                    </div>
                  )}
                  
                  {event.fine && (
                    <div className="mt-2 text-sm font-medium text-red-600">
                      Kara: {event.fine.toLocaleString()} zł
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Brak aktywnych wydarzeń spełniających kryteria filtrowania</p>
          )}
        </div>
        
        {/* Historia wydarzeń */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold text-lg mb-3">Historia wydarzeń</h3>
          
          {allSortedEvents.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="text-center p-2">Tura</th>
                    <th className="text-left p-2">Wydarzenie</th>
                    <th className="text-center p-2">Typ</th>
                    <th className="text-center p-2">Ważność</th>
                    <th className="text-center p-2">Lokalizacja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allSortedEvents.map(event => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="text-center p-2">{event.turn}</td>
                      <td className="p-2 flex items-center">
                        {getEventIcon(event.type)}
                        <span className="ml-2">{event.title}</span>
                      </td>
                      <td className="text-center p-2">
                        <span className="text-xs px-2 py-1 rounded bg-gray-100">
                          {translateEventType(event.type)}
                        </span>
                      </td>
                      <td className="text-center p-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          event.severity === 'positive' ? 'bg-green-100 text-green-800' :
                          event.severity === 'negative' ? 'bg-red-100 text-red-800' :
                          event.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {event.severity === 'positive' ? 'Pozytywne' :
                           event.severity === 'negative' ? 'Negatywne' :
                           event.severity === 'warning' ? 'Ostrzeżenie' :
                           'Informacja'}
                        </span>
                      </td>
                      <td className="text-center p-2">
                        {event.regionId || event.countyId || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Brak historii wydarzeń</p>
          )}
        </div>
      </div>
      
      {/* Panel podsumowania */}
      <div className="w-1/3 bg-gray-100 p-4 overflow-y-auto">
        <h3 className="font-bold text-lg mb-4">Wpływ wydarzeń na grę</h3>
        
        <div className="space-y-4">
          {/* Metryki reputacji */}
          <div className="bg-white p-3 rounded shadow">
            <h4 className="font-medium mb-2 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Twoja reputacja
            </h4>
            
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-4 mr-2">
                <div 
                  className={`h-4 rounded-full ${
                    playerState.reputation >= 150 ? 'bg-green-500' :
                    playerState.reputation >= 100 ? 'bg-green-400' :
                    playerState.reputation >= 50 ? 'bg-yellow-400' :
                    'bg-red-400'
                  }`}
                  style={{ width: `${Math.min(100, playerState.reputation / 2)}%` }}
                ></div>
              </div>
              <div className="text-lg font-bold">{playerState.reputation}</div>
            </div>
            
            <div className="text-sm mt-2">
              {playerState.reputation >= 150 ? 'Doskonała reputacja - najlepsze warunki finansowe i szybkość procesów.' :
               playerState.reputation >= 100 ? 'Dobra reputacja - standardowe warunki.' :
               playerState.reputation >= 50 ? 'Przeciętna reputacja - gorsze warunki.' :
               'Słaba reputacja - znaczne utrudnienia.'}
            </div>
          </div>
          
          {/* Aktywne wydarzenia ekonomiczne */}
          {economicEvents.length > 0 && (
            <div className="bg-white p-3 rounded shadow">
              <h4 className="font-medium mb-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Aktywne wydarzenia ekonomiczne
              </h4>
              
              <div className="space-y-2">
                {economicEvents.map(event => (
                  <div key={event.id} className="text-sm p-2 bg-gray-50 rounded">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-xs text-gray-500">
                      Tura {event.turn} - {event.expires} ({event.expires - gameState.turn} pozostało)
                    </div>
                    {event.effect && (
                      <div className="mt-1 text-xs">
                        {event.effect.type === 'market_price_modifier' && 
                          `Mnożnik ceny: ${event.effect.value.toFixed(2)}x dla ${event.effect.technology === 'all' ? 'wszystkich technologii' : event.effect.technology}`
                        }
                        {event.effect.type === 'project_speed' && 
                          `Szybkość projektów: ${(event.effect.value * 100).toFixed(0)}%`
                        }
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Audyty i kontrole */}
          <div className="bg-white p-3 rounded shadow">
            <h4 className="font-medium mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Audyty i kontrole
            </h4>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <div className="text-sm">Liczba audytów:</div>
                <div className="font-medium">{playerState.audits.totalAudits}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm">Zaliczone audyty:</div>
                <div className="font-medium">{playerState.audits.passedAudits}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm">Łączne kary:</div>
                <div className="font-medium text-red-600">{playerState.audits.totalFines.toLocaleString()} zł</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm">Ryzyko audytu:</div>
                <div className="font-medium">{playerState.illegals.auditRisk}%</div>
              </div>
            </div>
            
            {playerState.audits.lastAuditResult && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                <div className="font-medium">Ostatni audyt (tura {playerState.audits.lastAuditResult.turn}):</div>
                <div className={playerState.audits.lastAuditResult.passed ? "text-green-600" : "text-red-600"}>
                  {playerState.audits.lastAuditResult.passed ? "Zaliczony" : "Niezaliczony"}
                </div>
                {!playerState.audits.lastAuditResult.passed && (
                  <div className="text-sm">
                    <div>Kara: {playerState.audits.lastAuditResult.fine.toLocaleString()} zł</div>
                    <div>Utrata reputacji: {playerState.audits.lastAuditResult.reputationLoss} pkt</div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Nielegalne działania */}
          <div className="bg-white p-3 rounded shadow">
            <h4 className="font-medium mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Działania niejawne
            </h4>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <div className="text-sm">Poziom korupcji:</div>
                <div className="font-medium">{playerState.illegals.corruptionNetwork}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm">Łączne łapówki:</div>
                <div className="font-medium text-red-600">{playerState.illegals.totalBribes.toLocaleString()} zł</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm">Liczba działań:</div>
                <div className="font-medium">{playerState.illegals.illegalActionHistory.length}</div>
              </div>
            </div>
            
            {playerState.illegals.illegalActionHistory.length > 0 && (
              <div className="mt-2">
                <div className="text-sm font-medium mb-1">Ostatnie działania:</div>
                <div className="max-h-40 overflow-y-auto text-xs">
                  {playerState.illegals.illegalActionHistory.slice(-5).reverse().map((action, index) => (
                    <div key={index} className="p-1 border-b border-gray-100">
                      <div>Tura {action.turn}: {action.type}</div>
                      <div className="text-gray-500">Koszt: {action.cost.toLocaleString()} zł</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsView; 