import React, { useState, useRef, useEffect } from "react";
import { useEventsContext } from "../../store/EventsContext";
import { useGameContext } from "../../store/GameContext";
import { usePlayerContext } from "../../store/PlayerContext";
import { 
  AlertTriangle, 
  Info, 
  Briefcase, 
  Users, 
  TrendingUp,
  Check,
  X,
  Filter,
  Globe,
  Activity,
  FileText,
  User,
  AlertCircle,
  Clock,
  Calendar,
  TrendingDown,
  Zap,
  Map,
  Building,
  PiggyBank,
  LineChart,
  BarChart3,
  Target
} from "lucide-react";

const EventsView = () => {
  const { state: eventsState } = useEventsContext();
  const { state: gameState } = useGameContext();
  const { state: playerState } = usePlayerContext();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState("wszystkie");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showChronology, setShowChronology] = useState(false);
  const timelineRef = useRef(null);

  // Defensywnie pobieramy wydarzenia z kontekstu, upewniając się, że jest to tablica
  const eventsArray = Array.isArray(eventsState?.events) ? eventsState.events : [];
  
  // Filtrujemy aktywne wydarzenia (które jeszcze nie wygasły)
  const activeEvents = React.useMemo(() => {
    return eventsArray.filter(e => (!e.expires || e.expires > gameState.turn));
  }, [eventsArray, gameState.turn]);
  
  // Dzielimy wydarzenia na kategorie
  const eventsByCategory = React.useMemo(() => {
    const economic = activeEvents.filter(e => e.type === 'economic_event');
    const personal = activeEvents.filter(e => e.type === 'staff_event');
    const audits = activeEvents.filter(e => e.type === 'audit_event');
    const illegal = activeEvents.filter(e => e.type === 'illegal_event');
    const projects = activeEvents.filter(e => e.type === 'project_event');
    const global = activeEvents.filter(e => e.scope === 'global');
    const local = activeEvents.filter(e => e.scope === 'local');
    
    return { economic, personal, audits, illegal, projects, global, local };
  }, [activeEvents]);
  
  // Filtrujemy według aktywnej zakładki
  const getFilteredEventsByTab = () => {
    switch(activeTab) {
      case "ekonomiczne": return eventsByCategory.economic;
      case "personalne": return eventsByCategory.personal;
      case "audyty": return eventsByCategory.audits;
      case "nielegalne": return eventsByCategory.illegal;
      case "projekty": return eventsByCategory.projects;
      case "globalne": return eventsByCategory.global;
      case "lokalne": return eventsByCategory.local;
      default: return activeEvents;
    }
  };

  // Sortujemy wydarzenia z dodatkowym filtrowaniem
  const sortedEvents = React.useMemo(() => {
    let filtered = getFilteredEventsByTab();
    
    // Dodatkowe filtrowanie po typie wydarzenia
    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(event => event.type === eventTypeFilter);
    }
    
    // Filtrowanie po priorytecie/wadze
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(event => event.severity === priorityFilter);
    }
    
    return [...filtered].sort((a, b) => b.turn - a.turn);
  }, [activeEvents, eventTypeFilter, priorityFilter, activeTab, getFilteredEventsByTab]);
  
  // Historia wszystkich wydarzeń
  const allSortedEvents = React.useMemo(() => {
    return [...eventsArray].sort((a, b) => b.turn - a.turn);
  }, [eventsArray]);
  
  // Liczenie wpływu wydarzeń na grę
  const calculateEventImpact = React.useMemo(() => {
    let impact = {
      economy: 0,
      reputation: 0,
      permits: 0,
      buildCost: 0,
      riskLevel: 0
    };
    
    activeEvents.forEach(event => {
      if (event.effects) {
        if (event.effects.marketModifier) 
          impact.economy += (event.effects.marketModifier - 1) * 100;
        if (event.effects.reputationChange) 
          impact.reputation += event.effects.reputationChange;
        if (event.effects.permitTimeModifier) 
          impact.permits += (event.effects.permitTimeModifier - 1) * 100;
        if (event.effects.buildCostModifier) 
          impact.buildCost += (event.effects.buildCostModifier - 1) * 100;
        if (event.effects.riskLevel) 
          impact.riskLevel += event.effects.riskLevel;
      }
    });
    
    return impact;
  }, [activeEvents]);

  // Funkcja do wyświetlania ikon wydarzeń
  const getEventIcon = (event) => {
    switch(event.type) {
      case 'staff_event':
        return <Users className="w-5 h-5 text-indigo-500" />;
      case 'project_event':
        return <Briefcase className="w-5 h-5 text-teal-500" />;
      case 'economic_event':
        return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'audit_event':
        return <FileText className="w-5 h-5 text-amber-500" />;
      case 'illegal_event':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'law_change':
        return <Building className="w-5 h-5 text-blue-500" />;
      case 'market_change':
        return <LineChart className="w-5 h-5 text-purple-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };
  
  // Funkcja do wyświetlania klasy dla typu wydarzenia
  const getSeverityClass = (severity) => {
    switch(severity) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };
  
  // Funkcja do wyświetlania ikony dla typu wydarzenia
  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'positive':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'negative':
        return <X className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };
  
  // Efekt dla scrollowania chronologii do aktualnej tury
  useEffect(() => {
    if (showChronology && timelineRef.current) {
      const currentTurnElement = document.getElementById(`turn-${gameState.turn}`);
      if (currentTurnElement) {
        timelineRef.current.scrollLeft = currentTurnElement.offsetLeft - 100;
      }
    }
  }, [showChronology, gameState.turn]);
  
  // Efekt dla zaznaczenia domyślnego wydarzenia (pierwsze aktywne)
  useEffect(() => {
    if (activeEvents.length > 0 && !selectedEvent) {
      setSelectedEvent(activeEvents[0]);
    }
  }, [activeEvents, selectedEvent]);

  // Tłumaczenie typów wydarzeń na polski
  const translateEventType = (type) => {
    const translations = {
      economic_event: "Ekonomiczne",
      staff_event: "Personalne",
      project_event: "Projektowe",
      audit_event: "Audyt",
      illegal_event: "Nielegalne",
      law_change: "Zmiana prawa",
      market_change: "Zmiana rynkowa"
    };
    return translations[type] || type;
  };
  
  // Formatowanie daty
  const formatDate = (turn) => {
    // Zakładamy że gra zaczyna się 1 stycznia 2023
    const startDate = new Date(2023, 0, 1);
    const date = new Date(startDate);
    date.setDate(date.getDate() + turn);
    
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Górny panel z chronologią i przełączaniem widoku */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center">
            <Activity className="mr-2 text-blue-600" />
            Dziennik Wydarzeń
          </h2>
          
          <div className="flex items-center space-x-4">
            <button 
              className={`flex items-center px-3 py-1.5 rounded-md border ${showChronology ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300'}`}
              onClick={() => setShowChronology(!showChronology)}
            >
              <Clock className="w-4 h-4 mr-1" />
              Chronologia
            </button>
            
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button 
                className={`px-3 py-1.5 ${activeTab === "wszystkie" ? 'bg-blue-50 text-blue-700' : 'bg-white'}`}
                onClick={() => setActiveTab("wszystkie")}
              >
                Wszystkie
              </button>
              <button 
                className={`px-3 py-1.5 ${activeTab === "ekonomiczne" ? 'bg-emerald-50 text-emerald-700' : 'bg-white'}`}
                onClick={() => setActiveTab("ekonomiczne")}
              >
                Ekonomiczne
              </button>
              <button 
                className={`px-3 py-1.5 ${activeTab === "personalne" ? 'bg-indigo-50 text-indigo-700' : 'bg-white'}`}
                onClick={() => setActiveTab("personalne")}
              >
                Personalne
              </button>
              <button 
                className={`px-3 py-1.5 ${activeTab === "projekty" ? 'bg-teal-50 text-teal-700' : 'bg-white'}`}
                onClick={() => setActiveTab("projekty")}
              >
                Projekty
              </button>
              <button 
                className={`px-3 py-1.5 ${activeTab === "globalne" ? 'bg-violet-50 text-violet-700' : 'bg-white'}`}
                onClick={() => setActiveTab("globalne")}
              >
                Globalne
              </button>
            </div>
          </div>
        </div>
        
        {/* Chronologia wydarzeń - pokazuje się po kliknięciu przycisku */}
        {showChronology && (
          <div 
            ref={timelineRef}
            className="pb-3 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
          >
            <div className="inline-block min-w-full">
              <div className="relative">
                <div className="absolute h-0.5 bg-gray-300 top-4 left-0 right-0 z-0"></div>
                <div className="flex">
                  {Array.from({length: Math.max(gameState.turn + 10, 30)}, (_, i) => i).map(turn => {
                    const hasEvents = eventsArray.some(e => e.turn === turn);
                    return (
                      <div 
                        key={turn} 
                        id={`turn-${turn}`}
                        className={`inline-flex flex-col items-center mx-6 relative ${turn === gameState.turn ? 'scale-110' : ''}`}
                      >
                        <div 
                          className={`w-8 h-8 rounded-full z-10 flex items-center justify-center
                            ${turn === gameState.turn 
                              ? 'bg-blue-600 text-white border-2 border-white shadow-lg' 
                              : hasEvents 
                                ? 'bg-indigo-100 border border-indigo-300 cursor-pointer hover:bg-indigo-200' 
                                : 'bg-gray-200 border border-gray-300'
                            }
                          `}
                          onClick={() => hasEvents && setEventTypeFilter(`turn_${turn}`)}
                        >
                          {hasEvents ? 
                            (eventsArray.filter(e => e.turn === turn).length) 
                            : '-'
                          }
                        </div>
                        <div className={`text-xs mt-1 ${turn === gameState.turn ? 'font-bold' : ''}`}>
                          {turn > 0 ? `Dzień ${turn}` : 'Start'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-hidden grid grid-cols-3 gap-6 p-6">
        {/* Lista wydarzeń - pierwsza kolumna */}
        <div className="col-span-1 flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {activeTab === "wszystkie" ? "Aktywne wydarzenia" : `Wydarzenia ${activeTab}`}
            </h3>
            <div className="text-sm text-gray-500">
              Łącznie: {sortedEvents.length}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-y-auto flex-1">
            {sortedEvents.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {sortedEvents.map(event => (
                  <div 
                    key={event.id || `event-${Math.random()}`} 
                    className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 
                      ${selectedEvent && selectedEvent.id === event.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                    `}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start">
                      <div className="mr-3 mt-1">
                        {getEventIcon(event)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="truncate font-medium pr-2">{event.title}</div>
                          <div className="text-xs text-gray-500 whitespace-nowrap">
                            Dzień {event.turn}
                          </div>
                        </div>
                        <div className="mt-1 flex items-center">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs ${
                            event.severity === 'positive' ? 'bg-green-100 text-green-800' :
                            event.severity === 'negative' ? 'bg-red-100 text-red-800' :
                            event.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {getSeverityIcon(event.severity)}
                            <span className="ml-1">{translateEventType(event.type)}</span>
                          </span>
                          
                          {event.region && (
                            <span className="ml-2 text-xs text-gray-500 flex items-center">
                              <Map className="w-3 h-3 mr-0.5" />
                              {event.region}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Info className="w-12 h-12 text-gray-300 mb-2" />
                <p>Brak wydarzeń spełniających kryteria</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Szczegóły wydarzenia - druga kolumna */}
        <div className="col-span-1 flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Szczegóły wydarzenia</h3>
          
          {selectedEvent ? (
            <div className="bg-white rounded-lg shadow-sm p-5 flex-1">
              <div className={`rounded-lg p-3 mb-4 border ${getSeverityClass(selectedEvent.severity)}`}>
                <div className="flex items-center">
                  {getEventIcon(selectedEvent)}
                  <h3 className="text-lg font-semibold ml-2">{selectedEvent.title}</h3>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="whitespace-pre-line text-gray-700">{selectedEvent.description}</p>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 border-t border-b py-3 border-gray-100">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Dzień {selectedEvent.turn}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(selectedEvent.turn)}</span>
                  </div>
                  
                  {selectedEvent.region && (
                    <div className="flex items-center">
                      <Map className="w-4 h-4 mr-1" />
                      <span>{selectedEvent.region}</span>
                    </div>
                  )}
                </div>
                
                {selectedEvent.effects && Object.keys(selectedEvent.effects).length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Wpływ na rozgrywkę:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedEvent.effects.marketModifier && (
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="text-sm text-gray-500">Ceny rynkowe</div>
                          <div className="flex items-center">
                            {selectedEvent.effects.marketModifier > 1 
                              ? <TrendingUp className="w-4 h-4 text-green-500 mr-1" /> 
                              : <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                            }
                            <span className={selectedEvent.effects.marketModifier > 1 ? 'text-green-600' : 'text-red-600'}>
                              {((selectedEvent.effects.marketModifier - 1) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {selectedEvent.effects.reputationChange && (
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="text-sm text-gray-500">Reputacja</div>
                          <div className="flex items-center">
                            {selectedEvent.effects.reputationChange > 0 
                              ? <TrendingUp className="w-4 h-4 text-green-500 mr-1" /> 
                              : <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                            }
                            <span className={selectedEvent.effects.reputationChange > 0 ? 'text-green-600' : 'text-red-600'}>
                              {selectedEvent.effects.reputationChange > 0 ? '+' : ''}{selectedEvent.effects.reputationChange}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {selectedEvent.effects.permitTimeModifier && (
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="text-sm text-gray-500">Czas uzyskania pozwoleń</div>
                          <div className="flex items-center">
                            {selectedEvent.effects.permitTimeModifier < 1 
                              ? <TrendingUp className="w-4 h-4 text-green-500 mr-1" /> 
                              : <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                            }
                            <span className={selectedEvent.effects.permitTimeModifier < 1 ? 'text-green-600' : 'text-red-600'}>
                              {((selectedEvent.effects.permitTimeModifier - 1) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {selectedEvent.effects.buildCostModifier && (
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="text-sm text-gray-500">Koszt budowy</div>
                          <div className="flex items-center">
                            {selectedEvent.effects.buildCostModifier < 1 
                              ? <TrendingUp className="w-4 h-4 text-green-500 mr-1" /> 
                              : <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                            }
                            <span className={selectedEvent.effects.buildCostModifier < 1 ? 'text-green-600' : 'text-red-600'}>
                              {((selectedEvent.effects.buildCostModifier - 1) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedEvent.staffId && playerState?.staff && (
                  <div className="mt-4 bg-indigo-50 p-3 rounded">
                    <h4 className="font-medium text-indigo-700 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Dotyczy pracownika:
                    </h4>
                    <div className="mt-1">
                      {playerState.staff.find(s => s.id === selectedEvent.staffId)?.name || 'Nieznany pracownik'}
                    </div>
                  </div>
                )}
                
                {selectedEvent.projectId && playerState?.projects && (
                  <div className="mt-4 bg-teal-50 p-3 rounded">
                    <h4 className="font-medium text-teal-700 flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      Dotyczy projektu:
                    </h4>
                    <div className="mt-1">
                      {playerState.projects.find(p => p.id === selectedEvent.projectId)?.name || 'Nieznany projekt'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Info className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-center text-gray-500">Wybierz wydarzenie z listy, aby zobaczyć szczegóły</p>
            </div>
          )}
        </div>
        
        {/* Panel wpływu i analizy - trzecia kolumna */}
        <div className="col-span-1 flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Wpływ wydarzeń na grę</h3>
          
          <div className="space-y-4 flex-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                <Target className="w-5 h-5 mr-1 text-blue-500" />
                Twoja reputacja
              </h4>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span>Aktualna reputacja:</span>
                  <span className="font-medium">{playerState?.reputation || 50}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="h-2.5 rounded-full bg-blue-600" 
                    style={{width: `${playerState?.reputation || 50}%`}}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Słaba</span>
                  <span>Dobra</span>
                </div>
                
                {calculateEventImpact.reputation !== 0 && (
                  <div className="flex items-center mt-1 text-sm">
                    <span className="mr-1">Wpływ aktywnych wydarzeń:</span>
                    <span className={calculateEventImpact.reputation > 0 ? 'text-green-600' : 'text-red-600'}>
                      {calculateEventImpact.reputation > 0 ? '+' : ''}{calculateEventImpact.reputation} pkt
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                <TrendingUp className="w-5 h-5 mr-1 text-emerald-500" />
                Ekonomia i rynek
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <PiggyBank className="w-4 h-4 mr-1 text-yellow-500" />
                    <span className="text-sm">Ceny rynkowe:</span>
                  </div>
                  <div className={`flex items-center ${calculateEventImpact.economy > 0 ? 'text-green-600' : calculateEventImpact.economy < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    {calculateEventImpact.economy > 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : calculateEventImpact.economy < 0 ? (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    ) : (
                      <div className="w-4 h-4 mr-1" />
                    )}
                    <span className="font-medium">
                      {calculateEventImpact.economy > 0 ? '+' : ''}{calculateEventImpact.economy.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 mr-1 text-orange-500" />
                    <span className="text-sm">Koszt budowy:</span>
                  </div>
                  <div className={`flex items-center ${calculateEventImpact.buildCost < 0 ? 'text-green-600' : calculateEventImpact.buildCost > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    {calculateEventImpact.buildCost < 0 ? (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    ) : calculateEventImpact.buildCost > 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <div className="w-4 h-4 mr-1" />
                    )}
                    <span className="font-medium">
                      {calculateEventImpact.buildCost > 0 ? '+' : ''}{calculateEventImpact.buildCost.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-purple-500" />
                    <span className="text-sm">Czas uzyskania pozwoleń:</span>
                  </div>
                  <div className={`flex items-center ${calculateEventImpact.permits < 0 ? 'text-green-600' : calculateEventImpact.permits > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    {calculateEventImpact.permits < 0 ? (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    ) : calculateEventImpact.permits > 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <div className="w-4 h-4 mr-1" />
                    )}
                    <span className="font-medium">
                      {calculateEventImpact.permits > 0 ? '+' : ''}{calculateEventImpact.permits.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                <BarChart3 className="w-5 h-5 mr-1 text-purple-500" />
                Statystyki wydarzeń
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded p-3">
                  <div className="text-sm text-blue-700">Aktywne</div>
                  <div className="text-2xl font-bold">{activeEvents.length}</div>
                </div>
                
                <div className="bg-emerald-50 rounded p-3">
                  <div className="text-sm text-emerald-700">Ekonomiczne</div>
                  <div className="text-2xl font-bold">{eventsByCategory.economic.length}</div>
                </div>
                
                <div className="bg-indigo-50 rounded p-3">
                  <div className="text-sm text-indigo-700">Personalne</div>
                  <div className="text-2xl font-bold">{eventsByCategory.personal.length}</div>
                </div>
                
                <div className="bg-amber-50 rounded p-3">
                  <div className="text-sm text-amber-700">Audyty</div>
                  <div className="text-2xl font-bold">{eventsByCategory.audits.length}</div>
                </div>
                
                <div className="bg-rose-50 rounded p-3">
                  <div className="text-sm text-rose-700">Nielegalne</div>
                  <div className="text-2xl font-bold">{eventsByCategory.illegal.length}</div>
                </div>
                
                <div className="bg-violet-50 rounded p-3">
                  <div className="text-sm text-violet-700">Globalne/Lokalne</div>
                  <div className="text-2xl font-bold">{eventsByCategory.global.length}/{eventsByCategory.local.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stopka z filtrowaniem - opcjonalnie */}
      <div className="bg-white border-t border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Filter className="w-4 h-4 mr-1" />
            <span>Ostatnie zdarzenie: {allSortedEvents[0]?.title || "Brak"}</span>
          </div>
          
          <div className="text-sm">
            Dzień: <span className="font-medium">{gameState.turn}</span> | 
            Data: <span className="font-medium">{formatDate(gameState.turn)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsView; 