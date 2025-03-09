import React, { useState, useMemo } from 'react';
import { useGameContext } from '../../store/GameContext';
import { 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CalendarDays,
  Layers,
  MapPin,
  Leaf,
  Activity,
  LucideZap,
  Building2, 
  PiggyBank
} from 'lucide-react';

/**
 * Komponent wyświetlający panel aktywnych wydarzeń globalnych
 */
const GlobalEventsPanel = () => {
  const { state } = useGameContext();
  const { currentEvents } = state.globalEvents;
  const [selectedEventId, setSelectedEventId] = useState(null);
  
  // Grupujemy wydarzenia według typu
  const eventsByType = useMemo(() => {
    const grouped = {
      economic: [],
      political: [],
      social: [],
      environmental: [],
      technological: []
    };
    
    currentEvents.forEach(event => {
      if (grouped[event.type]) {
        grouped[event.type].push(event);
      }
    });
    
    return grouped;
  }, [currentEvents]);
  
  // Pobieramy wybrane wydarzenie
  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return currentEvents.find(event => event.id === selectedEventId);
  }, [selectedEventId, currentEvents]);
  
  // Formatuje datę w polskim formacie
  const formatDate = (date) => {
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Ikona dla typu wydarzenia
  const getTypeIcon = (type) => {
    switch (type) {
      case 'economic': return <PiggyBank size={16} className="text-yellow-500" />;
      case 'political': return <Building2 size={16} className="text-blue-500" />;
      case 'social': return <Layers size={16} className="text-violet-500" />;
      case 'environmental': return <Leaf size={16} className="text-green-500" />;
      case 'technological': return <LucideZap size={16} className="text-orange-500" />;
      default: return <AlertCircle size={16} className="text-gray-500" />;
    }
  };
  
  // Ikona dla efektu wydarzenia
  const getEffectIcon = (effect, value) => {
    const isPositive = value > 1.0;
    const isNegative = value < 1.0;
    
    const getIcon = () => {
      if (isPositive) return <TrendingUp size={16} className="text-green-500" />;
      if (isNegative) return <TrendingDown size={16} className="text-red-500" />;
      return <Activity size={16} className="text-gray-500" />;
    };
    
    return (
      <div className="flex items-center">
        {getIcon()}
        <span className={`ml-1 ${isPositive ? 'text-green-500' : ''} ${isNegative ? 'text-red-500' : ''}`}>
          {(value > 1.0 ? '+' : '') + ((value - 1.0) * 100).toFixed(0)}%
        </span>
      </div>
    );
  };
  
  // Tłumaczenie nazw efektów na język polski
  const translateEffectName = (effectName) => {
    const translations = {
      marketModifier: 'Ceny rynkowe',
      reputationChange: 'Zmiana reputacji',
      permitTimeModifier: 'Czas uzyskania pozwoleń',
      buildCostModifier: 'Koszt budowy',
    };
    
    return translations[effectName] || effectName;
  };
  
  // Jeśli nie ma aktywnych wydarzeń
  if (currentEvents.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Wydarzenia globalne</h2>
        <div className="text-gray-500 py-4 text-center">
          <AlertCircle className="mx-auto mb-2" size={24} />
          <p>Brak aktywnych wydarzeń globalnych</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">
        Wydarzenia globalne ({currentEvents.length})
      </h2>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Lista wydarzeń */}
        <div className="md:w-1/2">
          {Object.entries(eventsByType).map(([type, events]) => {
            if (events.length === 0) return null;
            
            // Tłumaczenie nazwy typu
            const typeNames = {
              economic: 'Ekonomiczne',
              political: 'Polityczne',
              social: 'Społeczne',
              environmental: 'Środowiskowe',
              technological: 'Technologiczne'
            };
            
            return (
              <div key={type} className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 flex items-center mb-1">
                  {getTypeIcon(type)}
                  <span className="ml-1">{typeNames[type] || type}</span>
                  <span className="ml-2 text-xs text-gray-500">({events.length})</span>
                </h3>
                
                <div className="space-y-2">
                  {events.map(event => (
                    <div 
                      key={event.id}
                      className={`p-2 rounded-md cursor-pointer transition-all border 
                        ${selectedEventId === event.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:bg-gray-50'}`}
                      onClick={() => setSelectedEventId(event.id === selectedEventId ? null : event.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{event.name}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Clock size={12} className="mr-1" />
                          {event.duration} dni
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Szczegóły wybranego wydarzenia */}
        <div className="md:w-1/2 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-4">
          {selectedEvent ? (
            <div>
              <h3 className="font-medium text-lg">{selectedEvent.name}</h3>
              <p className="text-gray-700 mt-2">{selectedEvent.description}</p>
              
              <div className="mt-4 text-sm text-gray-500">
                <div className="flex items-center mb-1">
                  <CalendarDays size={14} className="mr-1" />
                  <span>
                    Od: {formatDate(selectedEvent.startDate)} do: {formatDate(selectedEvent.expiryDate)}
                  </span>
                </div>
                
                {selectedEvent.region && (
                  <div className="flex items-center mb-1">
                    <MapPin size={14} className="mr-1" />
                    <span>Region: {selectedEvent.region}</span>
                  </div>
                )}
                
                {selectedEvent.technology && (
                  <div className="flex items-center mb-1">
                    <LucideZap size={14} className="mr-1" />
                    <span>Technologia: {selectedEvent.technology}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Efekty wydarzenia:</h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  {selectedEvent.effects && Object.entries(selectedEvent.effects).map(([effect, value]) => {
                    if (effect === 'regionalEffect' || effect === 'technologyEffect') return null;
                    
                    // Wyświetlanie zmiany reputacji inaczej niż mnożników
                    if (effect === 'reputationChange') {
                      const isPositive = value > 0;
                      const isNegative = value < 0;
                      return (
                        <div key={effect} className="flex justify-between items-center mb-1">
                          <span className="text-sm">{translateEffectName(effect)}</span>
                          <div className="flex items-center">
                            {isPositive ? (
                              <TrendingUp size={16} className="text-green-500 mr-1" />
                            ) : isNegative ? (
                              <TrendingDown size={16} className="text-red-500 mr-1" />
                            ) : null}
                            <span className={`
                              ${isPositive ? 'text-green-500' : ''}
                              ${isNegative ? 'text-red-500' : ''}
                            `}>
                              {isPositive ? '+' : ''}{value}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div key={effect} className="flex justify-between items-center mb-1">
                        <span className="text-sm">{translateEffectName(effect)}</span>
                        {getEffectIcon(effect, value)}
                      </div>
                    );
                  })}
                  
                  {/* Efekty regionalne */}
                  {selectedEvent.effects?.regionalEffect && (
                    <>
                      <div className="mt-2 mb-1">
                        <span className="text-sm font-medium flex items-center">
                          <MapPin size={14} className="mr-1" />
                          Efekt regionalny: {selectedEvent.region}
                        </span>
                      </div>
                      {Object.entries(selectedEvent.effects.regionalEffect).map(([effect, value]) => {
                        if (effect === 'region') return null;
                        return (
                          <div key={effect} className="flex justify-between items-center ml-4 mb-1">
                            <span className="text-sm">{translateEffectName(effect)}</span>
                            {getEffectIcon(effect, value)}
                          </div>
                        );
                      })}
                    </>
                  )}
                  
                  {/* Efekty technologiczne */}
                  {selectedEvent.effects?.technologyEffect && (
                    <>
                      <div className="mt-2 mb-1">
                        <span className="text-sm font-medium flex items-center">
                          <LucideZap size={14} className="mr-1" />
                          Efekt technologiczny: {selectedEvent.technology}
                        </span>
                      </div>
                      {Object.entries(selectedEvent.effects.technologyEffect).map(([effect, value]) => {
                        if (effect === 'technology') return null;
                        return (
                          <div key={effect} className="flex justify-between items-center ml-4 mb-1">
                            <span className="text-sm">{translateEffectName(effect)}</span>
                            {getEffectIcon(effect, value)}
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <p>Wybierz wydarzenie, aby zobaczyć szczegóły</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalEventsPanel; 